import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth";
import { UserRole } from "../models/User";

/**
 * Granular Role-Based Access Control middleware.
 * Verifies that the authenticated user possesses one of the allowed roles.
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ code: "UNAUTHORIZED", message: "Authentication required" });
      return;
    }

    const userRole = req.user.role as UserRole;
    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        code: "FORBIDDEN",
        message: `Forbidden: Requires one of [${allowedRoles.join(", ")}] permissions`,
      });
      return;
    }

    next();
  };
}

/**
 * Ensures an institution-level admin can only manage data for their own institution.
 * Platform super_admins bypass the institution check.
 */
export function enforceInstitutionScope(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ code: "UNAUTHORIZED", message: "Authentication required" });
    return;
  }

  // Super admins have platform-wide access
  if (req.user.role === "super_admin") {
    next();
    return;
  }

  const requestedInstId = req.params.institutionId || req.body?.institutionId || req.query.institutionId;

  if (requestedInstId && req.user.institutionId) {
    if (requestedInstId.toString() !== req.user.institutionId.toString()) {
      res.status(403).json({
        code: "CROSS_INSTITUTION_ACCESS_DENIED",
        message: "Forbidden: Campus administrators cannot access or modify records of other universities.",
      });
      return;
    }
  }

  next();
}
