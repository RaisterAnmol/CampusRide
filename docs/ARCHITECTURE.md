# CampusRide System Architecture

## 1. Overview

CampusRide is a high-assurance peer-to-peer carpool and commute platform engineered specifically for university campuses. It pairs student drivers with classmates traveling the same routes, enforces institutional identity verification via `.edu` credentials, coordinates pickup via cryptographic one-time passwords (OTP) and QR tokens, and continuously monitors active trips for route deviations.

The platform architecture follows a decoupled client-server model:
- **Client**: Single-Page Application (SPA) built on React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, and GSAP.
- **Server**: REST and real-time state engine built on Node.js, Express, TypeScript, Mongoose (MongoDB), and Socket.IO.

---

## 2. Request Lifecycle

Every incoming HTTP request traverses a hardened middleware pipeline:

```
[Client Request]
       │
       ▼
[Reverse Proxy / Nginx / Load Balancer]
       │  Adds X-Forwarded-For, terminates TLS
       ▼
[Express HTTP Server]
       │
       ├─► Helmet (Explicit CSP, HSTS, noSniff, frameguard)
       ├─► CORS (Strict origin verification against CLIENT_URL)
       ├─► Compression & CookieParser
       ├─► Correlation ID Middleware (Generates/extracts X-Request-Id)
       ├─► Pino HTTP Request Logger (Redacts passwords, tokens, auth headers)
       ├─► Rate Limiters (Global, Auth 10/15m, OTP 5/15m, SOS 10/10m)
       │
       ▼
[Route Dispatcher]
       │
       ├─► Authentication Middleware (`requireAuth`: Verifies Bearer JWT)
       ├─► RBAC Authorization Middleware (`requireRole`, `requireAdmin`)
       ├─► Schema Validation (`zod.safeParse(req.body)`)
       │
       ▼
[Controller / Route Handler]
       │  Executes business logic, queries MongoDB, invokes MapsService
       ▼
[Central Error Handler]
       │  Catches uncaught exceptions, attaches requestId, returns sanitized JSON
       ▼
[Client Response]
```

### Response Envelope Structure
Successful responses return JSON payloads with resource schemas.
Error responses follow a uniform contract:
```json
{
  "code": "VALIDATION_ERROR",
  "message": "Detailed description of error condition",
  "requestId": "c4b819f0-2f3b-4882-9993-cf8535bca01e"
}
```

---

## 3. Real-Time Socket.IO Room Architecture

Socket connections require a verified Bearer JWT during the initial handshake (`socket.handshake.auth.token`). Connections without valid credentials are immediately terminated.

### Room Scopes & Authorization Rules

| Room Name Pattern | Scope | Authorization Invariant |
|---|---|---|
| `user_{userId}` | Private User Channel | Automatically bound to `socket.data.user.id`. Clients cannot join rooms belonging to other user IDs. Used for private seat requests, confirmations, and security alerts. |
| `conversation_{convId}` | Encrypted Chat Thread | Granted only after verifying that `socket.data.user.id` is an active participant in `Conversation.participants`. Non-members receive an `unauthorized` event and socket disconnect. |
| `trip_{tripId}` | Active Telemetry & Tracking | Granted only to the driver (`trip.driverUserId`) and passengers (`trip.passengerUserIds`). Transmits GPS coordinates, ETA calculations, and route deviation alerts. |
| `ride_{rideId}` | Commute Group Broadcast | Granted to passengers and drivers associated with an active ride offer for group schedule alerts. |

---

## 4. Data Model Relationships

```
[Institution]
       │ 1:N
       ├──────► [Campus]
       │           │ 1:N
       │           ├──────► [PickupHub] (Designated safe pick-up points with CCTV)
       │           └──────► [Geofence]  (Campus perimeter boundaries)
       │
       ▼ 1:N
     [User] ──(1:1)──► [Vehicle] (Plate last 4, capacity, vehicle type)
       │
       ├──────► [VerificationRequest] (Student ID card OCR and review status)
       │
       ├──────► [EmergencyIncident]   (ICE contact alerts and audit telemetry)
       │
       ├─(Driver)──► [Ride] ──(1:N)──► [RideRequest] (Pending, Accepted, Rejected)
       │               │
       │               └─(1:N)──► [Trip] ──(1:1)──► [TripLocation] (Live GPS coordinates)
       │                            │
       └─(Rider/Driver)─────────────┴──► [Review] (Mutual 5-star rating & reliability metrics)
```

---

## 5. In-Memory vs. Production Database Strategy

CampusRide uses a zero-friction dual-mode database engine:

### Development & Sandbox Mode (`NODE_ENV=development`)
- When `MONGODB_URI` is left blank or points to a local host, the system automatically initializes `mongodb-memory-server`.
- Automatically populates 12 student personas across 4 universities, 7 scheduled rides, active trips, and emergency incidents via `seedDemoData()`.
- Allows instant evaluation with zero cloud configuration or external database dependencies.

### Production Mode (`NODE_ENV=production`)
- Requires an explicit, secure `MONGODB_URI` connection string (e.g. MongoDB Atlas replica set with TLS).
- If `MONGODB_URI` is unset in production, the application aborts immediately on boot with a descriptive fatal error.
- Destructive seeding routes (`POST /api/seed`) are hard-disabled regardless of admin keys.

---

## 6. Performance Budget

To ensure fast load times over campus Wi-Fi and mobile networks, the following performance budgets are enforced:
- **Landing Page Initial Bundle**: `< 250 KB` gzipped (excluding external map tiles).
- **Core Web Vitals Target**:
  - Largest Contentful Paint (LCP): `< 2.0s`
  - Cumulative Layout Shift (CLS): `< 0.05`
  - Interaction to Next Paint (INP): `< 150ms`
- **Socket Latency**: Route deviation detection processed within `< 500ms` of coordinate submission.

