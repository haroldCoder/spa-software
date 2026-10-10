export interface WhatsAppMessageProps {
  id: string;
  senderName: string;
  senderPhone: string;
  content: string;
  timestamp: string;
  businessId?: string;
  workerId?: string;
  createdAt?: string;
}

export class WhatsAppMessage {
  private readonly _id: string;
  private readonly _senderName: string;
  private readonly _senderPhone: string;
  private readonly _content: string;
  private readonly _timestamp: string;
  private readonly _businessId?: string;
  private readonly _workerId?: string;
  private readonly _createdAt: string;

  constructor(props: WhatsAppMessageProps) {
    this._id = props.id;
    this._senderName = props.senderName?.trim() || 'Contacto';
    // Keep numeric digits or fallback to raw identifier if non-numeric (e.g. chat_activo)
    const digits = props.senderPhone ? props.senderPhone.replace(/\D/g, '') : '';
    this._senderPhone = digits || props.senderPhone || 'desconocido';
    this._content = props.content || '';
    this._timestamp = props.timestamp || new Date().toISOString();
    this._businessId = props.businessId || undefined;
    this._workerId = props.workerId || undefined;
    this._createdAt = props.createdAt || new Date().toISOString();
  }

  get id(): string {
    return this._id;
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

  get businessId(): string | undefined {
    return this._businessId;
  }

  get workerId(): string | undefined {
    return this._workerId;
  }

  get createdAt(): string {
    return this._createdAt;
  }

  toJSON(): WhatsAppMessageProps {
    return {
      id: this._id,
      senderName: this._senderName,
      senderPhone: this._senderPhone,
      content: this._content,
      timestamp: this._timestamp,
      businessId: this._businessId,
      workerId: this._workerId,
      createdAt: this._createdAt,
    };
  }
}
