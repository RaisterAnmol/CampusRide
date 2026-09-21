import { io, Socket } from "socket.io-client";
 
const isLocalhost = typeof window !== "undefined" && window.location.hostname === "localhost";
const SOCKET_URL = import.meta.env.VITE_API_URL || (isLocalhost ? "http://localhost:5000" : "");

let socket: Socket | null = null;

export function getSocket(): Socket {
  const token =
    localStorage.getItem("campusride_token") || localStorage.getItem("token");

  // In standalone mode without a remote backend, return a safe dummy socket
  if (!SOCKET_URL) {
    return {
      connected: false,
      on: () => {},
      off: () => {},
      once: () => {},
      emit: () => {},
      disconnect: () => ({ connect: () => {} }),
      connect: () => {}
    } as any;
  }

  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      transports: ["websocket", "polling"],
      withCredentials: true,
      auth: {
        token,
      },
    });

    socket.on("unauthorized", (err) => {
      console.warn("[Socket] Unauthorized action:", err);
    });
  } else if (token && socket.auth && (socket.auth as any).token !== token) {
    // If token has changed, update auth and reconnect
    (socket.auth as any).token = token;
    socket.disconnect().connect();
  }
  return socket;
}

export function resetSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function joinUserRoom(userId?: string) {
  const s = getSocket();
  if (s.connected) {
    s.emit("joinUser", userId);
  } else {
    s.once("connect", () => {
      s.emit("joinUser", userId);
    });
  }
}

export function joinRideRoom(rideId: string) {
  const s = getSocket();
  if (s.connected) {
    s.emit("joinRide", rideId);
  } else {
    s.once("connect", () => {
      s.emit("joinRide", rideId);
    });
  }
}

export function joinConversationRoom(convId: string) {
  const s = getSocket();
  if (s.connected) {
    s.emit("joinConversation", convId);
  } else {
    s.once("connect", () => {
      s.emit("joinConversation", convId);
    });
  }
}

export function joinTripRoom(tripId: string) {
  const s = getSocket();
  if (s.connected) {
    s.emit("joinTrip", tripId);
  } else {
    s.once("connect", () => {
      s.emit("joinTrip", tripId);
    });
  }
}

export function joinSecurityHub() {
  const s = getSocket();
  if (s.connected) {
    s.emit("joinSecurityHub");
  } else {
    s.once("connect", () => {
      s.emit("joinSecurityHub");
    });
  }
}

