import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { env } from "../config/env";

export interface AppError extends Error {
  status?: number;
  statusCode?: number;
  code?: string;
}

/**
 * Centralized production error handler.
 * Formats uniform JSON error contracts and redacts stack traces in production.
 */
export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const status = err.status || err.statusCode || 500;
  const code = err.code || (status >= 500 ? "SERVER_ERROR" : "BAD_REQUEST");
  const requestId = req.id || req.headers["x-request-id"] || "unknown";

  const logContext = {
    err,
    requestId,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  };

  if (status >= 500) {
    logger.error(logContext, `[Error Handler] Unhandled 500 Internal Error: ${err.message}`);
  } else {
    logger.warn(logContext, `[Error Handler] Handled ${status} Client Error: ${err.message}`);
  }

  const message =
    env.NODE_ENV === "production" && status >= 500
      ? "An unexpected internal server error occurred"
      : err.message || "Internal server error";

  res.status(status).json({
    code,
    message,
    error: {
      code,
      message,
    },
    requestId,
  });
}
