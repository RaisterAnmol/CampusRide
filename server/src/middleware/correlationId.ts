import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { logger } from "../utils/logger";

declare global {
  namespace Express {
    interface Request {
      id?: string;
      log?: typeof logger;
    }
  }
}

/**
 * Correlation ID middleware.
 * Attaches a unique request ID to each incoming request, injects it into response headers,
 * and attaches a child logger scoped with the correlation ID.
 */
export function correlationIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const existingId = req.headers["x-request-id"] as string | undefined;
  const requestId = existingId && existingId.trim().length > 0 ? existingId : crypto.randomUUID();

  req.id = requestId;
  res.setHeader("X-Request-Id", requestId);
  req.log = logger.child({ requestId });

  next();
}
