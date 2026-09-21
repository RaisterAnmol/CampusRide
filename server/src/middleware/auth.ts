import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { User } from "../models/User";

export type UserRole = "student" | "moderator" | "campus_admin" | "super_admin";

export interface AuthUserPayload {
  id: string;
  email: string;
  name: string;
  college: string;
  verificationStatus: string;
  role?: UserRole;
  institutionId?: string;
  campusId?: string;
  tokenVersion?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

const JWT_SECRET = env.JWT_SECRET;
const JWT_REFRESH_SECRET = env.JWT_REFRESH_SECRET || env.JWT_SECRET;

// 15-minute access token (§2.6)
export function signToken(payload: AuthUserPayload): string {
  const safePayload = {
    ...payload,
    role: payload.role || "student",
  };
  return jwt.sign(safePayload, JWT_SECRET, { expiresIn: "15m" });
}

// 7-day refresh token with tokenVersion tracking (§2.6)
export function signRefreshToken(payload: {
  id: string;
  tokenVersion: number;
}): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "7d" });
}

export function verifyRefreshToken(token: string): {
  id: string;
  tokenVersion: number;
} {
  return jwt.verify(token, JWT_REFRESH_SECRET) as {
    id: string;
    tokenVersion: number;
  };
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      code: "UNAUTHORIZED",
      message: "Authentication required. No token provided.",
    });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;

    // Optional instant revocation check if tokenVersion is present
    if (typeof decoded.tokenVersion === "number") {
      const user = await User.findById(decoded.id)
        .select("tokenVersion")
        .lean();
      if (!user || user.tokenVersion !== decoded.tokenVersion) {
        res.status(401).json({
          code: "TOKEN_REVOKED",
          message: "Token has been revoked. Please log in again.",
        });
        return;
      }
    }

    req.user = decoded;
    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      res.status(401).json({
        code: "TOKEN_EXPIRED",
        message: "Access token expired. Please refresh.",
      });
      return;
    }
    res.status(401).json({
      code: "INVALID_TOKEN",
      message: "Invalid authentication token.",
    });
  }
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): void => {
    if (!req.user) {
      res.status(401).json({
        code: "UNAUTHORIZED",
        message: "Authentication required.",
      });
      return;
    }

    const userRole = req.user.role || "student";
    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        code: "FORBIDDEN",
        message: `Insufficient privileges. Role '${userRole}' is not authorized.`,
      });
      return;
    }

    next();
  };
}

export function requireOwnership(paramKey: string = "id") {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): void => {
    if (!req.user) {
      res.status(401).json({
        code: "UNAUTHORIZED",
        message: "Authentication required.",
      });
      return;
    }

    const resourceOwnerId = req.params[paramKey];
    const isOwner = req.user.id === resourceOwnerId;
    const isAdmin = ["campus_admin", "super_admin"].includes(
      req.user.role || "",
    );

    if (!isOwner && !isAdmin) {
      res.status(403).json({
        code: "FORBIDDEN",
        message:
          "Access denied. You can only access or modify your own resource.",
      });
      return;
    }

    next();
  };
}
