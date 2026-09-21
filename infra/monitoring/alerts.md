# CampusRide Prometheus Alerting Rules & Thresholds

## 1. Core Service Level Indicators (SLIs)

| Alert Rule Name | Metric Expression | Condition / Threshold | Severity | Paging Action |
|---|---|---|---|---|
| `HighHttpErrorRate` | `rate(campusride_http_requests_total{status_code=~"5.."}[5m]) / rate(campusride_http_requests_total[5m]) * 100` | `> 5% for 5 minutes` | Critical | Page On-Call Engineer |
| `HighLatencyP95` | `histogram_quantile(0.95, sum(rate(campusride_http_request_duration_seconds_bucket[5m])) by (le))` | `> 1.0s for 5 minutes` | Warning | Slack `#alerts-campusride` |
| `HighLatencyP99` | `histogram_quantile(0.99, sum(rate(campusride_http_request_duration_seconds_bucket[5m])) by (le))` | `> 2.5s for 5 minutes` | Critical | Page On-Call Engineer |
| `DatabaseDown` | `probe_success{instance="http://localhost:5000/api/ready"}` | `== 0 for 2 minutes` | Critical | Page On-Call Engineer |
| `SocketConnectionDrop`| `deriv(campusride_active_socket_connections[5m])` | `< -50 in 5 minutes` (crash loop indicator) | High | Slack `#alerts-campusride` |
| `ExcessiveAuthFailures`| `rate(campusride_http_requests_total{route=~".*login.*", status_code="401"}[5m])` | `> 50 / minute` (credential stuffing) | Warning | Notify Security Operations |

---

## 2. Prometheus AlertRule YAML Specification

```yaml
groups:
  - name: campusride_alerts
    rules:
      - alert: HighHttpErrorRate
        expr: (sum(rate(campusride_http_requests_total{status_code=~"5.."}[5m])) / sum(rate(campusride_http_requests_total[5m]))) * 100 > 5
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "CampusRide HTTP 5xx error rate exceeded 5%"
          description: "Current error rate is {{ $value }}% over the last 5 minutes."

      - alert: DatabaseConnectivityDegraded
        expr: campusride_ready_status == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "CampusRide database disconnected"
          description: "The /api/ready probe reports MongoDB unreachable."
```
