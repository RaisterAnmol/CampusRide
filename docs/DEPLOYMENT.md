# CampusRide Deployment & DevOps Guide

## 1. Overview

CampusRide is architected for containerized deployment on modern cloud platforms (AWS ECS/Fargate, Google Cloud Run, or Kubernetes). The application comprises two deployable artifacts:
1. **Server Container**: Node.js 20 Alpine executing pre-compiled TypeScript with non-root security privileges.
2. **Client Container**: Multi-stage Vite build served via Nginx Alpine with gzip compression and SPA route fallbacks.

---

## 2. Environment Variables Checklist

Every production deployment requires the following environment variables configured in the secret manager:

| Variable | Description | Production Requirement |
|---|---|---|
| `NODE_ENV` | Runtime environment mode | Must be set to `production` |
| `PORT` | HTTP port for Express | Default `5000` |
| `CLIENT_URL` | Canonical origin of SPA client | e.g. `https://campusride.edu` (used for CORS & Socket.IO verification) |
| `MONGODB_URI` | MongoDB connection string | TLS replica set connection string (e.g. MongoDB Atlas) |
| `JWT_SECRET` | Secret key for signing session tokens | Minimum 64-char cryptographically random hex string |
| `JWT_REFRESH_SECRET` | Secret key for signing refresh tokens | Distinct 64-char cryptographically random hex string |
| `ADMIN_SECRET` | Header secret for administrative API operations | Minimum 32-char cryptographically random string |
| `DEMO_MODE` | Flags demo fixture seeding | Must be set to `false` in production |

---

## 3. Database Strategy: In-Memory vs. Production Atlas

- **Local Development**: If `MONGODB_URI` is omitted, the server automatically starts an isolated `mongodb-memory-server` engine and seeds sample campus data for instant evaluation.
- **Production (`NODE_ENV=production`)**: The server **strictly refuses to boot** if `MONGODB_URI` is missing or points to a placeholder. Seeding routes (`POST /api/seed`) are permanently disabled.

---

## 4. Docker Compose Orchestration

To run the complete production-grade stack locally with containerized MongoDB:

```bash
# 1. Provide production secrets in .env
JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)
ADMIN_SECRET=$(openssl rand -hex 24)

# 2. Start the multi-container stack
docker-compose up --build -d

# 3. Verify health
curl -f http://localhost:5000/api/health
curl -f http://localhost:5000/api/ready
```

---

## 5. Rollback Strategy & Zero-Downtime Deployments

1. **Blue/Green Deployment**: Cloud Run or AWS ECS should route 100% of traffic to the green target only after `/api/ready` returns HTTP 200.
2. **Graceful Termination**: The server listens for `SIGTERM` and `SIGINT`, finishing active in-flight requests and terminating Socket.IO rooms before disconnecting Mongoose within 10 seconds.
