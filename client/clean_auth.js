const fs = require("fs");
const path = require("path");

const authFile = path.join(__dirname, "src/context/AuthContext.tsx");
const content = `import React, { createContext, useContext, useState, useEffect } from "react";
import { IUser } from "../types";
import { api } from "../services/api";
import { joinUserRoom } from "../services/socket";

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  switchDemoUser: (
    persona: "aditya" | "rahul" | "priya" | "ananya" | "rohan" | "kabir" | "meera" | "tanvi" | "admin" | "moderator",
  ) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const DEMO_PASSWORD = "CampusRide#2025";

const DEMO_USERS = {
  aditya: { email: "aditya.kumar@college.edu", password: DEMO_PASSWORD },
  rahul: { email: "rahul.sharma@college.edu", password: DEMO_PASSWORD },
  priya: { email: "priya.singh@college.edu", password: DEMO_PASSWORD },
  ananya: { email: "ananya.verma@college.edu", password: DEMO_PASSWORD },
  rohan: { email: "rohan.mehta@college.edu", password: DEMO_PASSWORD },
  kabir: { email: "kabir.sharma@college.edu", password: DEMO_PASSWORD },
  meera: { email: "meera.nair@college.edu", password: DEMO_PASSWORD },
  tanvi: { email: "tanvi.sharma@college.edu", password: DEMO_PASSWORD },
  admin: { email: "admin@campusride.edu", password: DEMO_PASSWORD },
  moderator: { email: "moderator@campusride.edu", password: DEMO_PASSWORD },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("campusride_token"),
  );
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const data = await api.getMe();
      if (data?.user) {
        setUser(data.user);
        joinUserRoom(data.user._id);
      }
    } catch (err) {
      console.warn("[Auth] Failed to refresh user profile:", err);
      // If token invalid, clear
      localStorage.removeItem("campusride_token");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      refreshUser();
    } else {
      // Auto-login as Aditya Kumar for instant local demo experience
      switchDemoUser("aditya");
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, password = DEMO_PASSWORD) => {
    setLoading(true);
    try {
      const res = await api.login(email, password);
      localStorage.setItem("campusride_token", res.token);
      setToken(res.token);
      setUser(res.user);
      joinUserRoom(res.user._id);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    setLoading(true);
    try {
      const res = await api.register(userData);
      localStorage.setItem("campusride_token", res.token);
      setToken(res.token);
      setUser(res.user);
      joinUserRoom(res.user._id);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("campusride_token");
    setToken(null);
    setUser(null);
  };

  const switchDemoUser = async (
    persona: "aditya" | "rahul" | "priya" | "ananya" | "rohan" | "kabir" | "meera" | "tanvi" | "admin" | "moderator",
  ) => {
    const creds = DEMO_USERS[persona];
    if (creds) {
      await login(creds.email, creds.password);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        switchDemoUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
`;

fs.writeFileSync(authFile, content, "utf8");
console.log("Wrote clean AuthContext.tsx");

