import { AuditLog } from "../models/AuditLog";
import { Request } from "express";
import { logger } from "../utils/logger";

export interface LogAuditOptions {
  actorId?: string;
  actorRole?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  req?: Request;
}

export async function logAuditEvent(options: LogAuditOptions): Promise<void> {
  try {
    let ip = options.req?.ip;
    let userAgent = options.req?.headers["user-agent"];

    await AuditLog.create({
      actorId: options.actorId,
      actorRole: options.actorRole || "anonymous",
      action: options.action,
      resourceType: options.resourceType,
      resourceId: options.resourceId,
      metadata: options.metadata || {},
      ipAddress: ip,
      userAgent: typeof userAgent === "string" ? userAgent : undefined,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error("[AuditService] Failed to record audit log:", err);
    logger.error({ err }, "[AuditService] Failed to record audit log");
  }
}
