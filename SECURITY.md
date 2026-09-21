# CampusRide — Security Architecture & Vulnerability Disclosure Policy

## 1. Overview & Security Philosophy
CampusRide is designed specifically for university campus mobility where safety, student privacy, and platform integrity are paramount. The security architecture enforces defense-in-depth across the application lifecycle.

---

## 2. Secrets Management & Environment Hygiene
- **Zero Committed Secrets**: Secrets, tokens, and private keys must never be committed to source control. `.gitignore` at root, `/server`, and `/client` strictly excludes all `.env` files (except `.env.example`).
- **Fail-Fast Boot Validation**: In production (`NODE_ENV=production`), the backend runtime refuses to start if secrets (`JWT_SECRET`, `JWT_REFRESH_SECRET`, `ADMIN_SECRET`) are missing, shorter than 32 characters, or match placeholder patterns (`replace_with`, `supersecret`, `change_in_prod`).
- **Client/Server Configuration Separation**: The frontend client never has access to backend secrets or sensitive API credentials. The `/api/places/config` endpoint returns client-safe operational status (`isLive: false`, `mapsMode: "MOCK_DEV"`) and never exposes Google Maps server keys.

---

## 3. Authentication & Authorization (RBAC & BOLA Prevention)
- **Token Architecture**:
  - **Short-Lived Access Tokens**: 15-minute expiration signed with HMAC SHA-256 containing minimal non-PII claims (`id`, `role`, `verificationStatus`, `tokenVersion`).
  - **Refresh Tokens**: 7-day expiration stored in `httpOnly`, `sameSite: lax`, `secure` cookies with database-backed `tokenVersion` tracking.
  - **Instant Revocation**: Password changes or explicit logout instantly increments `tokenVersion`, invalidating all active sessions across devices.
- **Role-Based Access Control (RBAC)**:
  - Valid roles: `student`, `moderator`, `campus_admin`, `super_admin`.
  - Administrative endpoints (verification review, campus hubs, audit logs) require `requireRole('campus_admin', 'super_admin')`.
- **Broken Object-Level Authorization (BOLA) Defense**:
  - Ride mutations (cancel, edit) are strictly bound to the verified ride creator.
  - Ride request approvals are restricted to the driver; cancellations to the passenger.
  - Chat conversations and real-time Socket.IO rooms require confirmed trip participation (driver, accepted passenger, or authorized admin).
  - Telemetry streaming and GPS location feeds are accessible only to authenticated trip participants.

---

## 4. Rate Limiting & Abuse Prevention
CampusRide enforces distinct rate limiters using `express-rate-limit`:
- **Global API Limiter**: 100 requests per 15 minutes per IP.
- **Authentication Limiter**: 10 attempts per 15 minutes per IP on `/api/auth/login` and `/api/auth/register` in production.
- **OTP Verification Limiter**: 5 attempts per 15 minutes per IP on boarding OTP and phone OTP endpoints.
- **Emergency SOS Limiter**: 10 requests per 10 minutes per IP on `/api/emergency/sos`.
- **Cryptographic OTP Lockout**: 6-digit CSPRNG boarding OTPs lock out after 5 consecutive incorrect attempts, requiring explicit driver regeneration.

---

## 5. Input Validation & Data Sanitization
- **Strict Schema Validation**: All mutating endpoints (`POST`, `PATCH`, `PUT`) validate inputs against `zod` schemas before processing.
- **MIME Type & File Inspection**: Verification document uploads enforce an allowlist (`image/jpeg`, `image/png`, `image/webp`, `application/pdf`) and an explicit 5 MB size ceiling.
- **HTTP Parameter Pollution (HPP)**: Express middleware strips duplicate parameter attacks.
- **Strict Content Security Policy (CSP)**: Helmet is configured with explicit origin allowlists (`'self'`, Google Maps, Socket.IO transports).
- **CORS Enforcement**: Cross-origin requests are strictly restricted to `CLIENT_URL`.

---

## 6. Audit Logging
Administrative actions, emergency SOS dispatches, OTP generation, and verification status changes write immutable records to the `AuditLog` collection, logging `actorId`, `actorRole`, `action`, `resourceType`, `resourceId`, and client IP.

---

## 7. Vulnerability Disclosure & Reporting
If you discover a security vulnerability or potential privacy leak in CampusRide, please report it responsibly:

- **Contact**: `security@campusride.edu` (or submit via university security portal)
- **Response SLA**: Initial triage within 24 hours; remediation within 72 hours for critical issues.
- **Safe Harbor**: Security researchers conducting good-faith testing within non-production environments will not be subject to legal action.

