export type MessageDirection = 'INBOUND' | 'OUTBOUND';
export type MessageStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';

export interface WhatsAppMessageProps {
  id: string;
  conversationId: string;
  senderName: string;
  senderPhone: string;
  content: string;
  timestamp: string;
  direction: MessageDirection;
  status?: MessageStatus;
  businessId?: string;
  workerId?: string;
  rawPayload?: Record<string, unknown>;
}

export class WhatsAppMessage {
  private readonly _id: string;
  private readonly _conversationId: string;
  private readonly _senderName: string;
  private readonly _senderPhone: string;
  private readonly _content: string;
  private readonly _timestamp: string;
  private readonly _direction: MessageDirection;
  private _status: MessageStatus;
  private readonly _businessId?: string;
  private readonly _workerId?: string;
  private readonly _rawPayload?: Record<string, unknown>;

  constructor(props: WhatsAppMessageProps) {
    this._id = props.id;
    this._conversationId = props.conversationId;
    this._senderName = props.senderName || 'Contacto';
    this._senderPhone = props.senderPhone.replace(/\D/g, '');
    this._content = props.content;
    this._timestamp = props.timestamp || new Date().toISOString();
    this._direction = props.direction;
    this._status = props.status || (props.direction === 'INBOUND' ? 'DELIVERED' : 'SENT');
    this._businessId = props.businessId || undefined;
    this._workerId = props.workerId || undefined;
    this._rawPayload = props.rawPayload;
  }

  get id(): string {
    return this._id;
  }

  get conversationId(): string {
    return this._conversationId;
  }

  get senderName(): string {
    return this._senderName;
  }

  get senderPhone(): string {
    return this._senderPhone;
  }

  get content(): string {
    return this._content;
  }

  get timestamp(): string {
    return this._timestamp;
  }

  get direction(): MessageDirection {
    return this._direction;
  }

  get status(): MessageStatus {
    return this._status;
  }

  get businessId(): string | undefined {
    return this._businessId;
  }

  get workerId(): string | undefined {
    return this._workerId;
  }

  get rawPayload(): Record<string, unknown> | undefined {
    return this._rawPayload;
  }

  markAsRead(): void {
    this._status = 'READ';
  }

  toJSON(): WhatsAppMessageProps {
    return {
      id: this._id,
      conversationId: this._conversationId,
      senderName: this._senderName,
      senderPhone: this._senderPhone,
      content: this._content,
      timestamp: this._timestamp,
      direction: this._direction,
      status: this._status,
      businessId: this._businessId,
      workerId: this._workerId,
      rawPayload: this._rawPayload,
    };
  }
}
