// utils/AppError.js
export class AppError extends Error {
  constructor(message, statusCode) {
    console.log("AppError constructor called with message:", message, "and statusCode:", statusCode);
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
