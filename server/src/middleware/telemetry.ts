import { Request, Response, NextFunction } from "express";
import client from "prom-client";

// Collect default NodeJS runtime metrics
client.collectDefaultMetrics({ prefix: "campusride_" });

export const httpRequestDurationMicroseconds = new client.Histogram({
  name: "campusride_http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
});

export const httpRequestsTotal = new client.Counter({
  name: "campusride_http_requests_total",
  help: "Total number of HTTP requests processed",
  labelNames: ["method", "route", "status_code"],
});

export const activeSocketConnections = new client.Gauge({
  name: "campusride_active_socket_connections",
  help: "Number of active real-time Socket.IO connections",
});

export const matchingEngineDurationSeconds = new client.Histogram({
  name: "campusride_matching_engine_computation_seconds",
  help: "Duration of route-overlap matching engine calculations",
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1],
});

export function telemetryMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const start = process.hrtime();

  res.on("finish", () => {
    const diff = process.hrtime(start);
    const durationSeconds = diff[0] + diff[1] / 1e9;
    const route = req.route?.path || req.path || "unknown";
    const statusCode = res.statusCode.toString();

    httpRequestDurationMicroseconds
      .labels(req.method, route, statusCode)
      .observe(durationSeconds);

    httpRequestsTotal
      .labels(req.method, route, statusCode)
      .inc();
  });

  next();
}

export { client as prometheusClient };
