import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 concurrent students
    { duration: '1m', target: 50 },  // Sustained load of 50 active users
    { duration: '30s', target: 100 }, // Peak morning commute burst
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<400'], // 95% of requests must complete below 400ms
    http_req_failed: ['rate<0.01'],   // Error rate must remain under 1%
  },
};

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:5000';

export default function () {
  // 1. Healthcheck probe
  const healthRes = http.get(`${BASE_URL}/api/health`);
  check(healthRes, {
    'healthcheck status is 200': (r) => r.status === 200,
  });

  // 2. Readiness probe
  const readyRes = http.get(`${BASE_URL}/api/ready`);
  check(readyRes, {
    'readiness status is 200': (r) => r.status === 200,
  });

  // 3. Campus Pickup Hubs Directory (Read path)
  const hubsRes = http.get(`${BASE_URL}/api/places/hubs`);
  check(hubsRes, {
    'hubs status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
