export interface WhatsAppConversationProps {
  id: string;
  customerName: string;
  customerPhone: string;
  lastMessageText: string;
  lastMessageAt: string;
  unreadCount?: number;
  businessId?: string;
  workerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export class WhatsAppConversation {
  private readonly _id: string;
  private _customerName: string;
  private readonly _customerPhone: string;
  private _lastMessageText: string;
  private _lastMessageAt: string;
  private _unreadCount: number;
  private _businessId?: string;
  private _workerId?: string;
  private readonly _createdAt: string;
  private _updatedAt: string;

  constructor(props: WhatsAppConversationProps) {
    this._id = props.id;
    this._customerName = props.customerName.trim() || 'Cliente Sin Nombre';
    this._customerPhone = props.customerPhone.replace(/\D/g, '');
    this._lastMessageText = props.lastMessageText || '';
    this._lastMessageAt = props.lastMessageAt || new Date().toISOString();
    this._unreadCount = props.unreadCount ?? 0;
    this._businessId = props.businessId || undefined;
    this._workerId = props.workerId || undefined;
    this._createdAt = props.createdAt || new Date().toISOString();
    this._updatedAt = props.updatedAt || new Date().toISOString();
  }

  get id(): string {
    return this._id;
  }

  get customerName(): string {
    return this._customerName;
  }

  get customerPhone(): string {
    return this._customerPhone;
  }

  get lastMessageText(): string {
    return this._lastMessageText;
  }

  get lastMessageAt(): string {
    return this._lastMessageAt;
  }

  get unreadCount(): number {
    return this._unreadCount;
  }

  get businessId(): string | undefined {
    return this._businessId;
  }

  get workerId(): string | undefined {
    return this._workerId;
  }

  get createdAt(): string {
    return this._createdAt;
  }

  get updatedAt(): string {
    return this._updatedAt;
  }

  updateLastMessage(text: string, timestamp?: string, isIncoming = true): void {
    this._lastMessageText = text;
    this._lastMessageAt = timestamp || new Date().toISOString();
    this._updatedAt = new Date().toISOString();
    if (isIncoming) {
      this._unreadCount += 1;
    }
  }

  updateCustomerName(name: string): void {
    if (name && name.trim() && (this._customerName === 'Cliente Sin Nombre' || this._customerName === this._customerPhone)) {
      this._customerName = name.trim();
      this._updatedAt = new Date().toISOString();
    }
  }

  updateOwnership(businessId?: string, workerId?: string): void {
    let changed = false;
    if (businessId && !this._businessId) {
      this._businessId = businessId;
      changed = true;
    }
    if (workerId && !this._workerId) {
      this._workerId = workerId;
      changed = true;
    }
    if (changed) {
      this._updatedAt = new Date().toISOString();
    }
  }

  resetUnreadCount(): void {
    this._unreadCount = 0;
    this._updatedAt = new Date().toISOString();
  }

  toJSON(): WhatsAppConversationProps {
    return {
      id: this._id,
      customerName: this._customerName,
      customerPhone: this._customerPhone,
      lastMessageText: this._lastMessageText,
      lastMessageAt: this._lastMessageAt,
      unreadCount: this._unreadCount,
      businessId: this._businessId,
      workerId: this._workerId,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
