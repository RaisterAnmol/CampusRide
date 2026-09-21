# CampusRide Production On-Call Incident Runbook

## 1. Incident: Elevated HTTP 5xx Error Rate (`HighHttpErrorRate`)

### Symptoms
- PagerDuty alert: `HighHttpErrorRate > 5%`.
- Grafana dashboard shows red spike on 500 status codes.

### Immediate Diagnosis
1. Query structured logs for unhandled errors with correlation IDs:
   ```bash
   kubectl logs -l app=campusride-server --tail=200 | jq 'select(.level >= 50)'
   ```
2. Note the `requestId`, `err.message`, and failing route.
3. Check `/api/ready` to confirm if the issue is database connectivity vs application logic.

### Mitigation
- If database connectivity issue: verify MongoDB Atlas connection pool and cluster health.
- If bad deploy: initiate rollback to previous green image tag via ECS task definition or Cloud Run revision.

---

## 2. Incident: Database Connection Pool Exhaustion (`DatabaseDown`)

### Symptoms
- `/api/ready` returns HTTP 503 `{"status":"degraded","database":"disconnected"}`.
- Connection timeout errors in application logs.

### Diagnosis
1. Inspect MongoDB Atlas metrics for connection limits and slow query spikes.
2. Check if a high volume of unindexed collection scans is running:
   ```js
   db.currentOp({ "secs_running": { "$gt": 3 } })
   ```

### Mitigation
1. Increase container connection pool limits or scale Atlas cluster tier.
2. Restart hung container tasks gracefully via `SIGTERM`.

---

## 3. Incident: Socket.IO Connection Storm or Disconnect Loops

### Symptoms
- `campusride_active_socket_connections` metric drops sharply.
- Client reconnection bursts flood the authentication endpoint.

### Mitigation
1. Verify Redis cluster connectivity for inter-node communication.
2. Verify SSL/TLS certificates and WebSocket upgrade proxies in Nginx/CloudFront.
