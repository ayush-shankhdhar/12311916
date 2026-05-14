export class ApiResponse<T = any> {
  public readonly success: boolean;
  public readonly message: string;
  public readonly data: T;
  public readonly meta?: any;

  constructor(success: boolean, message: string, data: T, meta?: any) {
    this.success = success;
    this.message = message;
    this.data = data;
    if (meta) {
      this.meta = meta;
    }
  }

  public static success<T>(message: string, data: T, meta?: any): ApiResponse<T> {
    return new ApiResponse<T>(true, message, data, meta);
  }

  public static error<T>(message: string, data: T = null as any): ApiResponse<T> {
    return new ApiResponse<T>(false, message, data);
  }
}

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errors: any[];
  public readonly isOperational: boolean;

  constructor(statusCode: number, message: string, errors: any[] = [], isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}
