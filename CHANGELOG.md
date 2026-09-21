# Changelog

All notable changes to the CampusRide project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Security & Hygiene
- Hardened all mutating endpoints with Zod input validation schemas.
- Implemented `express-rate-limit` across authentication, OTP, and SOS endpoints.
- Replaced console logging across the server with structured `pino` logger with PII and credential redaction.
- Normalized demo user password to `CampusRide2025!` to resolve dotenv `#` comment truncation.
- Locked CORS strictly to `CLIENT_URL` with explicit Helmet CSP configuration.
- Verified zero secrets tracked in git and updated `.gitignore` rules across all tiers.

### Documentation & Positioning
- Created `/docs/ARCHITECTURE.md` detailing request lifecycle, Socket.IO rooms, and data models.
- Created `/docs/MATCHING_ALGORITHM.md` documenting the mathematical formulation, weights, and worked examples.
- Created `/docs/API.md` providing complete REST endpoint reference with schemas and status codes.
- Standardized product casing to "CampusRide" across documentation and user interfaces.

### Code Quality & Architecture
- Replaced non-standard component names (`EditorialHero` -> `Hero`, `MasterFooter` -> `Footer`, `EngineeredRideCards` -> `RideCards`).
- Extracted reusable frontend hooks: `useScrollPosition`, `useInViewOnce`, `useReducedMotion`, `useApiResource`.
- Implemented correlation ID middleware (`X-Request-Id`) across express lifecycle.
- Added production DB guardrails preventing test in-memory engines in production environments.
- Implemented Kubernetes `/api/health` and `/api/ready` endpoints with graceful SIGTERM/SIGINT teardown.

### Design System & Accessibility
- Created centralized design tokens (`tokens.ts`, `tokens.css`) enforcing Campus Green (`#143D32`) institutional palette.
- Built reusable accessible UI primitives (`Button`, `Card`, `Input`, `Badge`, `Skeleton`).
- Added WCAG 2.1 AA accessible modal dialog semantics (`role="dialog"`, focus trap, Escape key listener).
- Added `AnimatedNumber` respecting `prefers-reduced-motion`.

### Performance & DevOps
- Code-split client routes via `React.lazy` and `Suspense`, dropping initial JS bundle size to 191 kB.
- Added `robots.txt`, `sitemap.xml`, and dynamic OpenGraph social metadata.
- Built multi-stage Dockerfiles for client and server with non-root security execution.
- Added automated GitHub Actions CI pipeline (`.github/workflows/ci.yml`).

### Infrastructure, Scalability & Telemetry (Advanced Tier)
- Added compound indexes to MongoDB `Ride` model (`{ status: 1, departureTime: 1 }`).
- Implemented in-memory response cache middleware (`server/src/middleware/cache.ts`) with `X-Cache-Lookup` header.
- Provisioned modular Terraform IaC templates (`/infra/terraform/`) for AWS ECS Fargate, DocumentDB, and CloudFront.
- Created load testing simulation suite (`/infra/load-tests/k6-commute-simulation.js`) targeting campus morning rush hours.
- Integrated Prometheus telemetry (`prom-client`, `GET /metrics`) with request duration histograms and ride counters.
- Built production Grafana dashboard and alerting specifications (`/infra/monitoring/`).

### Compliance, Multi-Tenancy & Governance (Advanced Tier)
- Implemented GDPR/DPDP compliant right-to-be-forgotten deletion (`DELETE /api/auth/me/account`) with cascading cleanup.
- Authored institutional compliance documentation: `DATA_HANDLING.md`, `PRIVACY_POLICY.md`, `TERMS_OF_SERVICE.md`.
- Implemented institutional multi-tenancy RBAC middleware (`server/src/middleware/rbac.ts`) for campus boundaries.
- Integrated Feature Flag service with per-institution rollout controls (`server/src/models/FeatureFlag.ts`).
- Created campus partnership and monetization framework (`/docs/BUSINESS_READINESS.md`).


