export abstract class DomainError extends Error {
  public abstract readonly statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends DomainError {
  public readonly statusCode = 404;

  constructor(entityName: string, identifier?: string | number) {
    super(identifier ? `${entityName} con identificador '${identifier}' no fue encontrado.` : `${entityName} no fue encontrado.`);
  }
}

export class BadRequestError extends DomainError {
  public readonly statusCode = 400;
  public readonly details?: unknown;

  constructor(message: string, details?: unknown) {
    super(message);
    this.details = details;
  }
}

export class ValidationError extends BadRequestError {}

export class ConflictError extends DomainError {
  public readonly statusCode = 409;

  constructor(message: string) {
    super(message);
  }
}

export class DatabaseError extends DomainError {
  public readonly statusCode = 500;
  public readonly originalError?: unknown;

  constructor(message: string, originalError?: unknown) {
    super(message);
    this.originalError = originalError;
  }
}
