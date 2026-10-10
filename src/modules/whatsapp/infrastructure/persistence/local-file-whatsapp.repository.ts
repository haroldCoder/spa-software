import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import {
  WhatsAppConversation,
  WhatsAppConversationProps,
} from '../../domain/entities/whatsapp-conversation.entity';
import {
  WhatsAppMessage,
  WhatsAppMessageProps,
} from '../../domain/entities/whatsapp-message.entity';
import {
  IWhatsAppStorageRepository,
  WhatsAppStorageStats,
  ConversationFilter,
} from '../../domain/repositories/whatsapp-storage.repository.interface';

interface LocalStoreSchema {
  conversations: Record<string, WhatsAppConversationProps>;
  messages: WhatsAppMessageProps[];
  lastWebhookReceivedAt: string | null;
}

export class LocalFileWhatsAppRepository implements IWhatsAppStorageRepository {
  private readonly filePath: string;
  private readonly seedFilePath: string;
  private writeLock: Promise<void> = Promise.resolve();
  // Fallback in-memory storage if disk writes are restricted
  private inMemoryCache: LocalStoreSchema | null = null;
  private isReadOnlyFilesystem = false;

  constructor(customFilePath?: string) {
    this.seedFilePath = path.join(process.cwd(), 'data', 'whatsapp', 'local-store.json');

    // On Vercel / AWS Lambda / Serverless environments, /var/task is read-only.
    // The only writable directory is os.tmpdir() (/tmp).
    const isServerless =
      Boolean(process.env.VERCEL) ||
      Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
      process.cwd().startsWith('/var/task');

    if (customFilePath) {
      this.filePath = customFilePath;
    } else if (isServerless) {
      this.filePath = path.join(os.tmpdir(), 'whatsapp-store.json');
    } else {
      this.filePath = this.seedFilePath;
    }
  }

  public getStoragePath(): string {
    return this.filePath;
  }

  private async ensureFileExists(): Promise<void> {
    if (this.isReadOnlyFilesystem) return;

    try {
      const dir = path.dirname(this.filePath);
      await fs.mkdir(dir, { recursive: true });

      try {
        await fs.access(this.filePath);
      } catch {
        // Try to initialize from repository seed data if available
        let initialData: LocalStoreSchema = {
          conversations: {},
          messages: [],
          lastWebhookReceivedAt: null,
        };

        try {
          const seedContent = await fs.readFile(this.seedFilePath, 'utf8');
          const parsed = JSON.parse(seedContent);
          initialData = {
            conversations: parsed.conversations || {},
            messages: Array.isArray(parsed.messages) ? parsed.messages : [],
            lastWebhookReceivedAt: parsed.lastWebhookReceivedAt || null,
          };
        } catch {
          // No seed or unreadable, start with empty store
        }

        await fs.writeFile(this.filePath, JSON.stringify(initialData, null, 2), 'utf8');
      }
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      if (err?.code === 'EROFS' || err?.message?.includes('read-only')) {
        this.isReadOnlyFilesystem = true;
      }
      console.warn('[LocalFileWhatsAppRepository] Warning accessing filesystem storage:', err?.message);
    }
  }

  private async readStore(): Promise<LocalStoreSchema> {
    if (this.inMemoryCache) {
      return this.inMemoryCache;
    }

    if (this.isReadOnlyFilesystem) {
      this.inMemoryCache = await this.readSeedStore();
      return this.inMemoryCache;
    }

    await this.ensureFileExists();

    try {
      const raw = await fs.readFile(this.filePath, 'utf8');
      const parsed = JSON.parse(raw);
      const store: LocalStoreSchema = {
        conversations: parsed.conversations || {},
        messages: Array.isArray(parsed.messages) ? parsed.messages : [],
        lastWebhookReceivedAt: parsed.lastWebhookReceivedAt || null,
      };
      this.inMemoryCache = store;
      return store;
    } catch {
      // Fallback: try reading seed file or initialize empty
      const store = await this.readSeedStore();
      this.inMemoryCache = store;
      return store;
    }
  }

  private async readSeedStore(): Promise<LocalStoreSchema> {
    try {
      const raw = await fs.readFile(this.seedFilePath, 'utf8');
      const parsed = JSON.parse(raw);
      return {
        conversations: parsed.conversations || {},
        messages: Array.isArray(parsed.messages) ? parsed.messages : [],
        lastWebhookReceivedAt: parsed.lastWebhookReceivedAt || null,
      };
    } catch {
      return {
        conversations: {},
        messages: [],
        lastWebhookReceivedAt: null,
      };
    }
  }

  private async writeStore(data: LocalStoreSchema): Promise<void> {
    // Keep in-memory cache synchronized immediately
    this.inMemoryCache = data;

    if (this.isReadOnlyFilesystem) {
      return;
    }

    await this.ensureFileExists();

    // Serialize write operations to avoid race conditions
    this.writeLock = this.writeLock.then(async () => {
      const tempPath = `${this.filePath}.${Date.now()}.${Math.random().toString(36).slice(2, 6)}.tmp`;
      try {
        await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf8');
        await fs.rename(tempPath, this.filePath);
      } catch (error: unknown) {
        const err = error as { code?: string; message?: string };
        if (err?.code === 'EROFS' || err?.message?.includes('read-only')) {
          this.isReadOnlyFilesystem = true;
          console.warn('[LocalFileWhatsAppRepository] Read-only filesystem detected; operating in memory-safe mode.');
        } else {
          console.error('[LocalFileWhatsAppRepository] Error writing store file:', err?.message);
        }
        try {
          await fs.unlink(tempPath);
        } catch {
          // ignore unlink error
        }
      }
    });

    return this.writeLock;
  }

  async findConversations(filter?: ConversationFilter | string): Promise<WhatsAppConversation[]> {
    const store = await this.readStore();
    let list = Object.values(store.conversations).map(
      (props) => new WhatsAppConversation(props)
    );

    const searchQuery = typeof filter === 'string' ? filter : filter?.searchQuery;
    const businessId = typeof filter === 'object' ? filter.businessId : undefined;
    const workerId = typeof filter === 'object' ? filter.workerId : undefined;

    if (businessId) {
      list = list.filter((c) => !c.businessId || c.businessId === businessId);
    }

    if (workerId) {
      list = list.filter((c) => c.workerId === workerId);
    }

    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.customerName.toLowerCase().includes(query) ||
          c.customerPhone.includes(query) ||
          c.lastMessageText.toLowerCase().includes(query)
      );
    }

    // Sort by lastMessageAt descending
    list.sort((a, b) => {
      return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
    });

    return list;
  }

  async findConversationById(id: string): Promise<WhatsAppConversation | null> {
    const store = await this.readStore();
    const props = store.conversations[id];
    if (!props) return null;
    return new WhatsAppConversation(props);
  }

  async saveConversation(conversation: WhatsAppConversation): Promise<void> {
    const store = await this.readStore();
    store.conversations[conversation.id] = conversation.toJSON();
    await this.writeStore(store);
  }

  async findMessagesByConversationId(conversationId: string): Promise<WhatsAppMessage[]> {
    const store = await this.readStore();
    const matching = store.messages.filter((m) => m.conversationId === conversationId);

    // Sort ascending by timestamp
    matching.sort((a, b) => {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });

    return matching.map((props) => new WhatsAppMessage(props));
  }

  async saveMessage(message: WhatsAppMessage): Promise<void> {
    const store = await this.readStore();
    const existingIndex = store.messages.findIndex((m) => m.id === message.id);
    if (existingIndex >= 0) {
      store.messages[existingIndex] = message.toJSON();
    } else {
      store.messages.push(message.toJSON());
    }
    store.lastWebhookReceivedAt = new Date().toISOString();
    await this.writeStore(store);
  }

  async saveMessagesBatch(messages: WhatsAppMessage[]): Promise<void> {
    if (!messages.length) return;
    const store = await this.readStore();

    for (const msg of messages) {
      const existingIndex = store.messages.findIndex((m) => m.id === msg.id);
      if (existingIndex >= 0) {
        store.messages[existingIndex] = msg.toJSON();
      } else {
        store.messages.push(msg.toJSON());
      }
    }

    store.lastWebhookReceivedAt = new Date().toISOString();
    await this.writeStore(store);
  }

  async getStats(): Promise<WhatsAppStorageStats> {
    const store = await this.readStore();
    return {
      totalConversations: Object.keys(store.conversations).length,
      totalMessages: store.messages.length,
      lastWebhookReceivedAt: store.lastWebhookReceivedAt,
    };
  }

  async clearAllData(): Promise<void> {
    const cleared: LocalStoreSchema = {
      conversations: {},
      messages: [],
      lastWebhookReceivedAt: null,
    };
    await this.writeStore(cleared);
  }
}

// Singleton instance for server runtime
export const localWhatsAppRepository = new LocalFileWhatsAppRepository();
