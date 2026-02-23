export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
  ) {
    super(message)
    this.name = this.constructor.name
  }
}

export class ResourceNotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    super(
      identifier ? `${resource} not found: ${identifier}` : `${resource} not found`,
      "RESOURCE_NOT_FOUND",
      404,
    )
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, "CONFLICT", 409)
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, public readonly cause?: unknown) {
    super(message, "DATABASE_ERROR", 500)
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR", 400)
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Invalid email or password") {
    super(message, "AUTHENTICATION_ERROR", 401)
  }
}

export class AccountLockedError extends AppError {
  constructor() {
    super("Account is temporarily locked due to too many failed attempts", "ACCOUNT_LOCKED", 429)
  }
}
