import React from "react";
import { useNavigate } from "react-router-dom";
import { Hero } from "../components/landing/Hero";
import { RouteStory } from "../components/landing/RouteStory";
import { NetworkMap } from "../components/landing/NetworkMap";
import { RideCards } from "../components/landing/RideCards";
import { CommuteTimeline } from "../components/landing/CommuteTimeline";
import { TrustVerificationSection } from "../components/landing/TrustVerificationSection";
import { StatusBanner } from "../components/landing/StatusBanner";
import { Footer } from "../components/landing/Footer";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, Car, Users, ShieldAlert } from "lucide-react";

export const LandingPage: React.FC = () => {
  const { switchDemoUser } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col antialiased selection:bg-[#143D32] selection:text-white">
      {/* Hero Section */}
      <Hero />

      {/* Signature Continuous Route Runway */}
      <RouteStory />

      {/* Interactive Network Map Corridor Explorer */}
      <NetworkMap />

      {/* Daily Commute Passes */}
      <RideCards />

      {/* Weekly Commute Interactive Timeline */}
      <CommuteTimeline />

      {/* Trust & Safety Verification */}
      <TrustVerificationSection />

      {/* Demo Persona Switcher for Senior Reviewer */}
      <section className="py-12 px-4 max-w-5xl mx-auto w-full">
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm text-left">
          <p className="text-xs font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1.5 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Switch Active Persona & Access Restricted Interface
          </p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <button
              onClick={async () => {
                await switchDemoUser("aditya");
                navigate("/post");
              }}
              className="p-3.5 bg-slate-50 hover:bg-emerald-50/50 rounded-xl border border-slate-200 hover:border-emerald-300 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 font-semibold text-slate-900 group-hover:text-emerald-900">
                <Car className="w-3.5 h-3.5 text-emerald-600" />
                <span>Aditya (Driver)</span>
              </div>
              <div className="text-slate-500 text-[11px] mt-1">
                Post empty carpool seats only (No search)
              </div>
            </button>

            <button
              onClick={async () => {
                await switchDemoUser("rahul");
                navigate("/search");
              }}
              className="p-3.5 bg-slate-50 hover:bg-blue-50/50 rounded-xl border border-slate-200 hover:border-blue-300 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 font-semibold text-slate-900 group-hover:text-blue-900">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>Rahul (Passenger)</span>
              </div>
              <div className="text-slate-500 text-[11px] mt-1">
                Search & book rides only (No post)
              </div>
            </button>

            <button
              onClick={async () => {
                await switchDemoUser("priya");
                navigate("/search");
              }}
              className="p-3.5 bg-slate-50 hover:bg-rose-50/50 rounded-xl border border-slate-200 hover:border-rose-300 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 font-semibold text-slate-900 group-hover:text-rose-900">
                <Users className="w-3.5 h-3.5 text-rose-600" />
                <span>Priya (Passenger)</span>
              </div>
              <div className="text-slate-500 text-[11px] mt-1">
                Search women-only verified rides
              </div>
            </button>

            <button
              onClick={async () => {
                await switchDemoUser("admin");
                navigate("/admin");
              }}
              className="p-3.5 bg-slate-50 hover:bg-amber-50/50 rounded-xl border border-slate-200 hover:border-amber-300 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 font-semibold text-slate-900 group-hover:text-amber-900">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                <span>Campus Admin</span>
              </div>
              <div className="text-slate-500 text-[11px] mt-1">
                Live dashboard, telemetry & pricing
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Live Campus Telemetry with Viewport Counters */}
      <StatusBanner />

      {/* Footer */}
      <Footer />
    </div>
  );
};
