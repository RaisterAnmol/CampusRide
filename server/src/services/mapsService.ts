import {
  MOCK_PLACES,
  MOCK_ROUTES,
  getMockRoadDistanceAndDuration,
  MockPlace,
} from "../fixtures/mockMapsData";
import { logger } from "../utils/logger";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface RouteResult {
  mode: "LIVE" | "MOCK_DEV";
  distanceMeters: number;
  durationSeconds: number;
  encodedPolyline: string;
  decodedPath: Array<[number, number]>; // [lat, lng]
  warnings?: string[];
}

export interface PlaceSearchResult {
  mode: "LIVE" | "MOCK_DEV";
  places: Array<{
    placeId: string;
    name: string;
    formattedAddress: string;
    location: LatLng;
  }>;
}

export class MapsService {
  private static apiKey: string | undefined = process.env.GOOGLE_MAPS_API_KEY;

  public static isGoogleLiveMode(): boolean {
    return Boolean(this.apiKey && process.env.MAPS_MODE === "live");
  }

  public static isFreeLiveMode(): boolean {
    return process.env.MAPS_MODE === "free" || (!this.apiKey && process.env.MAPS_MODE !== "mock");
  }

  public static isLiveMode(): boolean {
    return this.isGoogleLiveMode() || this.isFreeLiveMode();
  }

  public static getMapMode(): "LIVE_GOOGLE" | "LIVE_FREE_OSM" | "MOCK_DEV" {
    if (this.isGoogleLiveMode()) return "LIVE_GOOGLE";
    if (this.isFreeLiveMode()) return "LIVE_FREE_OSM";
    return "MOCK_DEV";
  }

  /**
   * Search places via Google Places, Free OpenStreetMap (Nominatim), or deterministic fixtures
   */
  public static async searchPlaces(query: string): Promise<PlaceSearchResult> {
    if (!query || query.trim().length === 0) {
      return { mode: this.isLiveMode() ? "LIVE" : "MOCK_DEV", places: [] };
    }

    // 1. Google Places (if API key configured and mode is 'live')
    if (this.isGoogleLiveMode()) {
      try {
        const url = "https://places.googleapis.com/v1/places:autocomplete";
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": this.apiKey!,
          },
          body: JSON.stringify({ input: query }),
        });

        if (response.ok) {
          const data: any = await response.json();
          const suggestions = (data.suggestions || []).map((s: any) => {
            const pred = s.placePrediction;
            return {
              placeId: pred.placeId,
              name: pred.structuredFormat?.mainText?.text || pred.text?.text,
              formattedAddress: pred.text?.text || "",
              location: { lat: 28.7501, lng: 77.1177 }, // Default campus focus
            };
          });
          return { mode: "LIVE", places: suggestions };
        }
      } catch (err) {
        logger.warn({ err }, "[MapsService] Google Places search failed, falling back to OSM / Mock");
      }
    }

    // 2. Free OpenStreetMap (Nominatim) - 100% Free, no credit card/billing required
    if (this.isFreeLiveMode()) {
      try {
        const osmUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`;
        const response = await fetch(osmUrl, {
          headers: {
            "User-Agent": "CampusRide-StudentCarpool/1.0",
            Accept: "application/json",
          },
        });

        if (response.ok) {
          const data: any = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            const places = data.map((item: any) => ({
              placeId: `osm-${item.place_id}`,
              name: item.name || item.display_name.split(",")[0],
              formattedAddress: item.display_name,
              location: {
                lat: parseFloat(item.lat),
                lng: parseFloat(item.lon),
              },
            }));
            return { mode: "LIVE", places };
          }
        }
      } catch (err) {
        logger.warn({ err }, "[MapsService] Free OSM Nominatim lookup failed, falling back to fixtures");
      }
    }

    // 3. Deterministic Mock Provider
    const q = query.toLowerCase().trim();
    const matches = MOCK_PLACES.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.formattedAddress.toLowerCase().includes(q) ||
        p.types.some((t) => t.includes(q)),
    );

    return {
      mode: "MOCK_DEV",
      places: (matches.length > 0 ? matches : MOCK_PLACES.slice(0, 3)).map(
        (p) => ({
          placeId: p.placeId,
          name: p.name,
          formattedAddress: p.formattedAddress,
          location: p.location,
        }),
      ),
    };
  }

  /**
   * Compute Road Route with Routes API v2
   */
  public static async computeRoadRoute(
    origin: LatLng,
    destination: LatLng,
    intermediates: LatLng[] = [],
  ): Promise<RouteResult> {
    // 1. Google Routes API (if API key configured and mode is 'live')
    if (this.isGoogleLiveMode()) {
      try {
        const url = "https://routes.googleapis.com/directions/v2:computeRoutes";
        const body: any = {
          origin: {
            location: {
              latLng: { latitude: origin.lat, longitude: origin.lng },
            },
          },
          destination: {
            location: {
              latLng: { latitude: destination.lat, longitude: destination.lng },
            },
          },
          travelMode: "DRIVE",
          routingPreference: "TRAFFIC_AWARE",
        };

        if (intermediates.length > 0) {
          body.intermediates = intermediates.map((w) => ({
            location: { latLng: { latitude: w.lat, longitude: w.lng } },
          }));
        }

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": this.apiKey!,
            "X-Goog-FieldMask":
              "routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline",
          },
          body: JSON.stringify(body),
        });

        if (response.ok) {
          const data: any = await response.json();
          if (data.routes && data.routes.length > 0) {
            const r = data.routes[0];
            const polyline = r.polyline?.encodedPolyline || "";
            const durationSec = parseInt(
              r.duration?.replace("s", "") || "600",
              10,
            );
            return {
              mode: "LIVE",
              distanceMeters: r.distanceMeters || 1000,
              durationSeconds: durationSec,
              encodedPolyline: polyline,
              decodedPath: this.decodePolyline(polyline),
            };
          }
        }
      } catch (err) {
        logger.warn(
          { err },
          "[MapsService] Google Routes API failed, falling back to OSRM / Mock",
        );
      }
    }

    // 2. Free OpenStreetMap OSRM Road Routing (100% Free, no credit card/billing required)
    if (this.isFreeLiveMode()) {
      try {
        const coords = [
          `${origin.lng},${origin.lat}`,
          ...intermediates.map((i) => `${i.lng},${i.lat}`),
          `${destination.lng},${destination.lat}`,
        ].join(";");
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=polyline`;
        const response = await fetch(osrmUrl, {
          headers: {
            "User-Agent": "CampusRide-StudentCarpool/1.0",
            Accept: "application/json",
          },
        });

        if (response.ok) {
          const data: any = await response.json();
          if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const polyline = route.geometry;
            return {
              mode: "LIVE",
              distanceMeters: Math.round(route.distance),
              durationSeconds: Math.round(route.duration),
              encodedPolyline: polyline,
              decodedPath: this.decodePolyline(polyline),
            };
          }
        }
      } catch (err) {
        logger.warn(
          { err },
          "[MapsService] Free OSRM road routing failed, falling back to synthetic road path",
        );
      }
    }

    // Deterministic Mock Provider
    const mock = getMockRoadDistanceAndDuration(origin, destination);
    // Interpolate points between origin and destination to generate a realistic road path
    const path = this.generateSyntheticRoadPath(origin, destination);
    const polyline = this.encodePolyline(path);

    return {
      mode: "MOCK_DEV",
      distanceMeters: mock.distanceMeters,
      durationSeconds: mock.durationSeconds,
      encodedPolyline: polyline,
      decodedPath: path,
    };
  }

  /**
   * Decode Google Encoded Polyline into [latitude, longitude][]
   */
  public static decodePolyline(encoded: string): Array<[number, number]> {
    if (!encoded) return [];
    const points: Array<[number, number]> = [];
    let index = 0,
      len = encoded.length;
    let lat = 0,
      lng = 0;

    while (index < len) {
      let b,
        shift = 0,
        result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push([lat / 1e5, lng / 1e5]);
    }
    return points;
  }

  /**
   * Encode [latitude, longitude][] into Google Encoded Polyline
   */
  public static encodePolyline(points: Array<[number, number]>): string {
    let plat = 0;
    let plng = 0;
    let str = "";

    for (const [lat, lng] of points) {
      const late5 = Math.round(lat * 1e5);
      const lnge5 = Math.round(lng * 1e5);
      str += this.encodeSignedNumber(late5 - plat);
      str += this.encodeSignedNumber(lnge5 - plng);
      plat = late5;
      plng = lnge5;
    }
    return str;
  }

  private static encodeSignedNumber(num: number): string {
    let sgn_num = num << 1;
    if (num < 0) {
      sgn_num = ~sgn_num;
    }
    let encodeString = "";
    while (sgn_num >= 0x20) {
      encodeString += String.fromCharCode((0x20 | (sgn_num & 0x1f)) + 63);
      sgn_num >>= 5;
    }
    encodeString += String.fromCharCode(sgn_num + 63);
    return encodeString;
  }

  /**
   * Generate realistic intermediate points along road curves between origin and destination
   */
  public static generateSyntheticRoadPath(
    origin: LatLng,
    destination: LatLng,
  ): Array<[number, number]> {
    const steps = 8;
    const path: Array<[number, number]> = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      // Slight road curvature offset
      const curve = Math.sin(t * Math.PI) * 0.0012;
      const lat = origin.lat + (destination.lat - origin.lat) * t + curve;
      const lng = origin.lng + (destination.lng - origin.lng) * t - curve * 0.8;
      path.push([Number(lat.toFixed(6)), Number(lng.toFixed(6))]);
    }
    return path;
  }

  /**
   * Distance from GPS point to nearest point on road polyline in meters
   */
  public static computePointToRouteDistanceMeters(
    point: LatLng,
    polylinePath: Array<[number, number]>,
  ): number {
    if (!polylinePath || polylinePath.length === 0) return 0;
    if (polylinePath.length === 1) {
      return this.haversineMeters(point, {
        lat: polylinePath[0][0],
        lng: polylinePath[0][1],
      });
    }

    let minDistance = Infinity;
    for (let i = 0; i < polylinePath.length - 1; i++) {
      const p1 = { lat: polylinePath[i][0], lng: polylinePath[i][1] };
      const p2 = { lat: polylinePath[i + 1][0], lng: polylinePath[i + 1][1] };
      const dist = this.pointToSegmentDistanceMeters(point, p1, p2);
      if (dist < minDistance) {
        minDistance = dist;
      }
    }
    return Math.round(minDistance);
  }

  private static pointToSegmentDistanceMeters(
    p: LatLng,
    v: LatLng,
    w: LatLng,
  ): number {
    // Project point p onto segment vw
    const l2 =
      (w.lat - v.lat) * (w.lat - v.lat) + (w.lng - v.lng) * (w.lng - v.lng);
    if (l2 === 0) return this.haversineMeters(p, v);

    const t = Math.max(
      0,
      Math.min(
        1,
        ((p.lat - v.lat) * (w.lat - v.lat) +
          (p.lng - v.lng) * (w.lng - v.lng)) /
          l2,
      ),
    );
    const projection = {
      lat: v.lat + t * (w.lat - v.lat),
      lng: v.lng + t * (w.lng - v.lng),
    };
    return this.haversineMeters(p, projection);
  }

  public static haversineMeters(p1: LatLng, p2: LatLng): number {
    const R = 6371000;
    const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
    const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((p1.lat * Math.PI) / 180) *
        Math.cos((p2.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
