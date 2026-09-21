import {
  DEMO_FALLBACK_USERS,
  DEMO_FALLBACK_RIDES,
  DEMO_FALLBACK_OPERATIONS,
  DEMO_FALLBACK_INCIDENTS,
  DEMO_FALLBACK_VERIFICATIONS,
  DEMO_FALLBACK_ANALYTICS,
  DEMO_FALLBACK_HUBS,
  DEMO_FALLBACK_AUDIT_LOGS,
} from "./demoFallback";

const isStandaloneVercel =
  typeof window !== "undefined" &&
  window.location.hostname !== "localhost" &&
  !import.meta.env.VITE_API_URL;

const API_BASE =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "");

function getLocalDemoFallback<T>(endpoint: string, options: RequestInit): T | undefined {
  try {
    const url = new URL(endpoint, "http://localhost");
    const path = url.pathname;

    if (path === "/api/auth/login" || path === "/api/auth/register") {
      let email = "aditya.kumar@college.edu";
      try {
        if (options.body) {
          const parsed = JSON.parse(options.body as string);
          if (parsed.email) email = parsed.email;
        }
      } catch {}
      const user = DEMO_FALLBACK_USERS[email] || DEMO_FALLBACK_USERS["aditya.kumar@college.edu"];
      localStorage.setItem("campusride_user_email", email);
      return { token: "demo_jwt_token_" + user._id, user } as T;
    }

    if (path === "/api/auth/me") {
      const savedEmail = localStorage.getItem("campusride_user_email") || "aditya.kumar@college.edu";
      const user = DEMO_FALLBACK_USERS[savedEmail] || DEMO_FALLBACK_USERS["aditya.kumar@college.edu"];
      return { user, vehicle: { model: "Honda City", plateLast4: "4821" } } as T;
    }

    if (path === "/api/rides" && (!options.method || options.method === "GET")) {
      const customRides = JSON.parse(localStorage.getItem("campusride_local_rides") || "[]");
      return [...customRides, ...DEMO_FALLBACK_RIDES] as T;
    }

    if (path === "/api/rides" && options.method === "POST") {
      try {
        const body = JSON.parse(options.body as string);
        const newRide = {
          _id: "ride_local_" + Date.now(),
          creator: DEMO_FALLBACK_USERS["aditya.kumar@college.edu"],
          ...body,
          status: "active"
        };
        const customRides = JSON.parse(localStorage.getItem("campusride_local_rides") || "[]");
        localStorage.setItem("campusride_local_rides", JSON.stringify([newRide, ...customRides]));
        return newRide as T;
      } catch {}
    }

    if (path === "/api/admin/operations") {
      return DEMO_FALLBACK_OPERATIONS as T;
    }

    if (path === "/api/admin/pricing") {
      if (options.method === "PUT") {
        try {
          const body = JSON.parse(options.body as string);
          const updated = { ...DEMO_FALLBACK_OPERATIONS.pricingConfig, ...body };
          localStorage.setItem("campusride_pricing", JSON.stringify(updated));
          return updated as T;
        } catch {}
      }
      const saved = localStorage.getItem("campusride_pricing");
      return (saved ? JSON.parse(saved) : DEMO_FALLBACK_OPERATIONS.pricingConfig) as T;
    }

    if (path.includes("/emergency/incidents")) {
      return DEMO_FALLBACK_INCIDENTS as T;
    }

    if (path.includes("/verification/queue")) {
      return DEMO_FALLBACK_VERIFICATIONS as T;
    }

    if (path.includes("/analytics/mobility")) {
      return DEMO_FALLBACK_ANALYTICS as T;
    }

    if (path.includes("/places/hubs")) {
      return DEMO_FALLBACK_HUBS as T;
    }

    if (path.includes("/audit/logs")) {
      return DEMO_FALLBACK_AUDIT_LOGS as T;
    }

    if (path.includes("/requests")) {
      return [] as T;
    }

    // Default safe empty array / object for any unknown endpoint
    return [] as unknown as T;
  } catch (e) {
    console.warn("[DemoFallback] Error resolving fallback:", e);
  }

  return undefined;
}

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem("campusride_token");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // If on Vercel without a configured backend URL, serve local demo fallback directly without loopback attempt
    if (isStandaloneVercel || !API_BASE) {
      const fallback = getLocalDemoFallback<T>(endpoint, options);
      if (fallback !== undefined) return fallback;
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const fallback = getLocalDemoFallback<T>(endpoint, options);
        if (fallback !== undefined) return fallback;

        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            errorData.message ||
            `Request failed with status ${response.status}`,
        );
      }

      return response.json();
    } catch (err: any) {
      const fallback = getLocalDemoFallback<T>(endpoint, options);
      if (fallback !== undefined) {
        return fallback;
      }
      throw err;
    }
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{ token: string; user: any }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async register(data: any) {
    return this.request<{ token: string; user: any }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getMe() {
    return this.request<{ user: any; vehicle?: any }>("/api/auth/me");
  }

  async verifyUser(id: string) {
    return this.request<{ message: string; user: any }>(
      `/api/users/${id}/verify`,
      {
        method: "POST",
      },
    );
  }

  // Rides
  async getRides(
    params: {
      originLat?: number;
      originLng?: number;
      destLat?: number;
      destLng?: number;
      date?: string;
      seats?: number;
      womenOnlyDriver?: boolean;
      creatorId?: string;
      status?: string;
      college?: string;
      department?: string;
      course?: string;
      year?: number | string;
      semester?: number | string;
      sameCourseSemOnly?: boolean;
      sameDepartmentOnly?: boolean;
      sameCollegeOnly?: boolean;
      verifiedOnly?: boolean;
      maxFare?: number | string;
      minRating?: number | string;
    } = {},
  ) {
    const query = new URLSearchParams();
    if (params.originLat !== undefined)
      query.set("originLat", params.originLat.toString());
    if (params.originLng !== undefined)
      query.set("originLng", params.originLng.toString());
    if (params.destLat !== undefined)
      query.set("destLat", params.destLat.toString());
    if (params.destLng !== undefined)
      query.set("destLng", params.destLng.toString());
    if (params.date) query.set("date", params.date);
    if (params.seats) query.set("seats", params.seats.toString());
    if (params.womenOnlyDriver) query.set("womenOnlyDriver", "true");
    if (params.creatorId) query.set("creatorId", params.creatorId);
    if (params.status) query.set("status", params.status);
    if (params.college && params.college !== "Any") query.set("college", params.college);
    if (params.department && params.department !== "Any") query.set("department", params.department);
    if (params.course && params.course !== "Any") query.set("course", params.course);
    if (params.year && params.year !== "Any") query.set("year", params.year.toString());
    if (params.semester && params.semester !== "Any") query.set("semester", params.semester.toString());
    if (params.sameCourseSemOnly) query.set("sameCourseSemOnly", "true");
    if (params.sameDepartmentOnly) query.set("sameDepartmentOnly", "true");
    if (params.sameCollegeOnly) query.set("sameCollegeOnly", "true");
    if (params.verifiedOnly) query.set("verifiedOnly", "true");
    if (params.maxFare) query.set("maxFare", params.maxFare.toString());
    if (params.minRating) query.set("minRating", params.minRating.toString());

    const queryString = query.toString();
    return this.request<any[]>(
      `/api/rides${queryString ? `?${queryString}` : ""}`,
    );
  }

  async getRideById(id: string) {
    return this.request<any>(`/api/rides/${id}`);
  }

  async createRide(rideData: any) {
    return this.request<any>("/api/rides", {
      method: "POST",
      body: JSON.stringify(rideData),
    });
  }

  async updateRide(id: string, updateData: any) {
    return this.request<any>(`/api/rides/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updateData),
    });
  }

  async cancelRide(id: string) {
    return this.request<any>(`/api/rides/${id}`, {
      method: "DELETE",
    });
  }

  // Requests
  async requestRide(rideId: string) {
    return this.request<any>(`/api/rides/${rideId}/request`, {
      method: "POST",
    });
  }

  async getRequests(role?: "driver" | "passenger", rideId?: string) {
    const query = new URLSearchParams();
    if (role) query.set("role", role);
    if (rideId) query.set("rideId", rideId);
    const qs = query.toString();
    return this.request<any[]>(`/api/requests${qs ? `?${qs}` : ""}`);
  }

  async updateRequestStatus(
    reqId: string,
    status: "accepted" | "declined" | "cancelled",
  ) {
    return this.request<any>(`/api/requests/${reqId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  // Trips & OTP
  async startTrip(rideId: string) {
    return this.request<any>("/api/trips", {
      method: "POST",
      body: JSON.stringify({ rideId }),
    });
  }

  async getTrip(tripId: string) {
    return this.request<any>(`/api/trips/${tripId}`);
  }

  async verifyOtp(tripId: string, otp: string) {
    return this.request<{ message: string; verified: boolean }>(
      `/api/trips/${tripId}/verify-otp`,
      {
        method: "POST",
        body: JSON.stringify({ otp }),
      },
    );
  }

  async regenerateOtp(tripId: string) {
    return this.request<{ message: string; otp: string; expiresAt: string }>(
      `/api/trips/${tripId}/regenerate-otp`,
      {
        method: "POST",
      },
    );
  }

  async completeTrip(tripId: string, distance?: number) {
    return this.request<any>(`/api/trips/${tripId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "completed", distance }),
    });
  }

  // Chat / Conversations
  async getConversation(rideId?: string) {
    return this.request<any>(
      `/api/conversations${rideId ? `?rideId=${rideId}` : ""}`,
    );
  }

  async sendMessage(conversationId: string, text: string) {
    return this.request<any>(`/api/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ text }),
    });
  }

  // Reviews
  async submitReview(data: {
    tripId: string;
    toUserId: string;
    rating: number;
    comment?: string;
  }) {
    return this.request<any>("/api/reviews", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getUserReviews(userId: string) {
    return this.request<any[]>(`/api/users/${userId}/reviews`);
  }

  // Mobility Analytics
  async getMobilityAnalytics() {
    return this.request<any>("/api/analytics/mobility");
  }

  // Emergency SOS & SOC Operations
  async triggerSos(data: {
    tripId?: string;
    latitude: number;
    longitude: number;
    accuracy?: number;
    address?: string;
    notes?: string;
  }) {
    return this.request<any>("/api/emergency/sos", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getEmergencyIncidents(params: { status?: string; campusId?: string } = {}) {
    const q = new URLSearchParams();
    if (params.status) q.set("status", params.status);
    if (params.campusId) q.set("campusId", params.campusId);
    const qs = q.toString();
    return this.request<{ incidents: any[] }>(`/api/emergency/incidents${qs ? `?${qs}` : ""}`);
  }

  async updateIncidentStatus(id: string, status: string, securityNotes?: string) {
    return this.request<any>(`/api/emergency/incidents/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, securityNotes }),
    });
  }

  // Student & Institutional Verification
  async submitVerificationRequest(data: {
    studentIdentifier: string;
    documentType?: string;
    documentMimeType?: string;
    documentSizeBytes?: number;
  }) {
    return this.request<any>("/api/verification/request", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getMyVerificationRequest() {
    return this.request<{ request: any }>("/api/verification/my-request");
  }

  async getVerificationQueue(status = "pending") {
    return this.request<{ requests: any[] }>(`/api/verification/queue?status=${status}`);
  }

  async reviewVerificationRequest(
    id: string,
    decision: "approved" | "rejected",
    rejectionReason?: string
  ) {
    return this.request<any>(`/api/verification/requests/${id}/review`, {
      method: "PATCH",
      body: JSON.stringify({ decision, rejectionReason }),
    });
  }

  // Maps, Routes & Pickup Hubs
  async getPlacesConfig() {
    return this.request<{ mapsMode: "LIVE" | "MOCK_DEV"; isLive: boolean }>("/api/places/config");
  }

  async searchPlaces(query: string) {
    return this.request<{ mode: string; places: any[] }>(`/api/places/search?q=${encodeURIComponent(query)}`);
  }

  async calculateRoadRoute(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ) {
    return this.request<any>("/api/routes/calculate", {
      method: "POST",
      body: JSON.stringify({ origin, destination }),
    });
  }

  async getCampusHubs() {
    return this.request<{ hubs: any[] }>("/api/places/hubs");
  }

  // Audit Trails
  async getAuditLogs(limit = 40) {
    return this.request<{ logs: any[] }>(`/api/audit/logs?limit=${limit}`);
  }

  // Admin Telemetry, Operations & Pricing
  async getAdminOperations() {
    return this.request<{
      kpis: {
        totalRevenue: number;
        totalRides: number;
        co2SavedKg: number;
        ongoingRidesCount: number;
      };
      ongoingRides: any[];
      pricingConfig: {
        minPricePerSeat: number;
        basePrice: number;
        pricePerKm: number;
        localTransitComparison: string;
        updatedBy?: string;
        updatedAt?: string;
      };
    }>("/api/admin/operations");
  }

  async getAdminPricing() {
    return this.request<{
      minPricePerSeat: number;
      basePrice: number;
      pricePerKm: number;
      localTransitComparison: string;
      updatedBy?: string;
      updatedAt?: string;
    }>("/api/admin/pricing");
  }

  async updateAdminPricing(data: {
    minPricePerSeat: number;
    basePrice: number;
    pricePerKm: number;
    localTransitComparison?: string;
  }) {
    return this.request<any>("/api/admin/pricing", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiService();
