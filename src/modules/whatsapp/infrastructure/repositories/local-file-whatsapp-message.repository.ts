import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { WhatsAppMessage, WhatsAppMessageProps } from '../../domain/entities/whatsapp-message.entity';
import {
  IWhatsAppMessageRepository,
  WhatsAppMessageFilter,
  WhatsAppMessageStats,
} from '../../domain/repositories/whatsapp-message.repository.interface';

interface LocalStoreSchema {
  messages: WhatsAppMessageProps[];
  lastReceivedAt: string | null;
}

export class LocalFileWhatsAppMessageRepository implements IWhatsAppMessageRepository {
  private readonly filePath: string;
  private inMemoryCache: LocalStoreSchema | null = null;
  private isReadOnly = false;
  private writeLock: Promise<void> = Promise.resolve();

  constructor() {
    const isServerless =
      Boolean(process.env.VERCEL) ||
      Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
      process.cwd().startsWith('/var/task');

    if (isServerless) {
      this.filePath = path.join(os.tmpdir(), 'whatsapp-messages.json');
    } else {
      this.filePath = path.join(process.cwd(), 'data', 'whatsapp', 'local-messages.json');
    }
  }

  private async readStore(): Promise<LocalStoreSchema> {
    if (this.inMemoryCache) return this.inMemoryCache;
    try {
      const raw = await fs.readFile(this.filePath, 'utf8');
      const parsed = JSON.parse(raw);
      this.inMemoryCache = {
        messages: Array.isArray(parsed.messages) ? parsed.messages : [],
        lastReceivedAt: parsed.lastReceivedAt || null,
      };
      return this.inMemoryCache;
    } catch {
      this.inMemoryCache = { messages: [], lastReceivedAt: null };
      return this.inMemoryCache;
    }
  }

  private async writeStore(data: LocalStoreSchema): Promise<void> {
    this.inMemoryCache = data;
    if (this.isReadOnly) return;

    this.writeLock = this.writeLock.then(async () => {
      try {
        await fs.mkdir(path.dirname(this.filePath), { recursive: true });
        await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf8');
      } catch (err: unknown) {
        const error = err as { code?: string };
        if (error?.code === 'EROFS') this.isReadOnly = true;
      }
    });

    return this.writeLock;
  }

  public async save(message: WhatsAppMessage): Promise<void> {
    const store = await this.readStore();
    const idx = store.messages.findIndex((m) => m.id === message.id);
    if (idx >= 0) {
      store.messages[idx] = message.toJSON();
    } else {
      store.messages.push(message.toJSON());
    }
    store.lastReceivedAt = new Date().toISOString();
    await this.writeStore(store);
  }

  public async saveBatch(messages: WhatsAppMessage[]): Promise<void> {
    if (!messages.length) return;
    const store = await this.readStore();
    for (const msg of messages) {
      const idx = store.messages.findIndex((m) => m.id === msg.id);
      if (idx >= 0) {
        store.messages[idx] = msg.toJSON();
      } else {
        store.messages.push(msg.toJSON());
      }
    }
    store.lastReceivedAt = new Date().toISOString();
    await this.writeStore(store);
  }

  public async findMessages(filter?: WhatsAppMessageFilter): Promise<WhatsAppMessage[]> {
    const store = await this.readStore();
    let list = store.messages.map((props) => new WhatsAppMessage(props));

    if (filter?.businessId) {
      list = list.filter((m) => !m.businessId || m.businessId === filter.businessId);
    }
    if (filter?.workerId) {
      list = list.filter((m) => !m.workerId || m.workerId === filter.workerId);
    }
    if (filter?.senderPhone) {
      list = list.filter((m) => m.senderPhone === filter.senderPhone);
    }
    if (filter?.searchQuery && filter.searchQuery.trim()) {
      const q = filter.searchQuery.trim().toLowerCase();
      list = list.filter(
        (m) =>
          m.senderName.toLowerCase().includes(q) ||
          m.senderPhone.includes(q) ||
          m.content.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return list;
  }

  public async getStats(): Promise<WhatsAppMessageStats> {
    const store = await this.readStore();
    return {
      totalMessages: store.messages.length,
      lastReceivedAt: store.lastReceivedAt,
    };
  }

  public async clearAll(): Promise<void> {
    await this.writeStore({ messages: [], lastReceivedAt: null });
  }
}

export const localWhatsAppMessageRepository = new LocalFileWhatsAppMessageRepository();
