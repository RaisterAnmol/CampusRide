import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Car,
  MapPin,
  Calendar,
  Search,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import gsap from "gsap";

import { useAuth } from "../../context/AuthContext";

export const Hero: React.FC = () => {
  const { activePersona, user } = useAuth();
  const navigate = useNavigate();
  const [from, setFrom] = useState("Rohini Sector 14");
  const [to, setTo] = useState("DTU Main Campus");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [carProgress, setCarProgress] = useState(15);
  const heroRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);

  // Entrance choreography with GSAP
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".hero-badge", { opacity: 0, y: -10, duration: 0.5, delay: 0.1 })
        .from(
          ".hero-line",
          { opacity: 0, y: 24, stagger: 0.1, duration: 0.8 },
          "-=0.2",
        )
        .from(".hero-sub", { opacity: 0, y: 12, duration: 0.6 }, "-=0.4")
        .from(
          ".hero-cta",
          { opacity: 0, y: 12, stagger: 0.1, duration: 0.5 },
          "-=0.3",
        );
      if (heroRef.current?.querySelector(".hero-search")) {
        tl.from(".hero-search", { opacity: 0, y: 16, duration: 0.6 }, "-=0.3");
      }
      if (heroRef.current?.querySelector(".hero-map-frame")) {
        tl.from(".hero-map-frame", { opacity: 0, y: 20, duration: 0.8 }, "-=0.3");
      }
    }, heroRef);

    return () => ctx.revert();
  }, [activePersona]);

  // Traveling vehicle animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCarProgress((prev) => (prev >= 90 ? 10 : prev + 0.35));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(
      `/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}`,
    );
  };

  return (
    <section
      ref={heroRef}
      className="relative pt-10 pb-20 md:pt-16 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden"
    >
      <div className="flex flex-col items-center text-center">
        {/* Verification Pill */}
        <div className="hero-badge inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white text-slate-800 text-xs font-mono tracking-wider uppercase mb-8 border border-slate-200 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>CampusRide · University Commute Network</span>
          {activePersona === 'driver' && (
            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded font-bold ml-1">
              DRIVER ROLE
            </span>
          )}
          {activePersona === 'passenger' && (
            <span className="bg-blue-100 text-blue-800 px-2 py-0.2 rounded font-bold ml-1">
              PASSENGER ROLE
            </span>
          )}
          {activePersona === 'admin' && (
            <span className="bg-amber-100 text-amber-800 px-2 py-0.2 rounded font-bold ml-1">
              ADMIN ROLE
            </span>
          )}
        </div>

        {/* Hero Headline */}
        <h1
          ref={headlineRef}
          className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-slate-900 leading-[1.05] max-w-4xl"
        >
          <span className="hero-line block">Your daily campus commute,</span>
          <span className="hero-line block text-[#143D32]">
            {activePersona === 'driver'
              ? 'share your seats & save fuel.'
              : activePersona === 'admin'
              ? 'managed with campus-wide safety.'
              : 'shared with peers you trust.'}
          </span>
        </h1>

        {/* Supporting Copy */}
        <p className="hero-sub mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
          {activePersona === 'driver'
            ? 'Offer empty car/bike seats along your university route. Share commute expenses with verified student peers.'
            : activePersona === 'admin'
            ? 'Real-time university operations: live passenger tracking, incident monitoring, and campus mobility fare governance.'
            : 'Direct rides with university peers heading your direction. Verified college IDs, zero commercial surge, and scheduled carpools.'}
        </p>

        {/* CTA Buttons - Strictly Persona Separated */}
        <div className="hero-cta mt-8 flex flex-wrap items-center justify-center gap-3.5">
          {activePersona === 'driver' && (
            <>
              <Link
                to="/post"
                className="px-6 py-3.5 rounded-lg bg-[#143D32] hover:bg-[#0f2e26] text-white font-medium text-sm transition-all shadow-sm hover:shadow flex items-center gap-2 group"
              >
                <Car className="w-4 h-4 text-emerald-300" />
                <span>Post a Ride Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/dashboard"
                className="px-6 py-3.5 rounded-lg bg-white hover:bg-slate-50 text-slate-900 font-medium text-sm border border-slate-200 transition-all flex items-center gap-2"
              >
                <span>Driver Dashboard</span>
              </Link>
            </>
          )}

          {activePersona === 'passenger' && (
            <Link
              to="/search"
              className="px-6 py-3.5 rounded-lg bg-[#143D32] hover:bg-[#0f2e26] text-white font-medium text-sm transition-all shadow-sm hover:shadow flex items-center gap-2 group"
            >
              <Search className="w-4 h-4" />
              <span>Find a Ride</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}

          {activePersona === 'admin' && (
            <Link
              to="/admin"
              className="px-6 py-3.5 rounded-lg bg-[#143D32] hover:bg-[#0f2e26] text-white font-medium text-sm transition-all shadow-sm hover:shadow flex items-center gap-2 group"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Open Admin Dashboard</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>

        {/* Corridor Quick Search Bar - Passenger Only */}
        {activePersona === 'passenger' && (
          <div className="hero-search mt-10 w-full max-w-3xl">
            <form
              onSubmit={handleSearch}
              className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch gap-2"
            >
              <div className="flex-1 flex items-center gap-2.5 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus-within:border-[#143D32] focus-within:bg-white transition-colors">
                <MapPin className="w-4 h-4 text-[#143D32] shrink-0" />
                <div className="flex-1 text-left">
                  <label className="block text-[10px] font-mono uppercase text-slate-500">
                    From
                  </label>
                  <input
                    type="text"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    placeholder="Pickup area or metro"
                    className="w-full bg-transparent text-sm text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex-1 flex items-center gap-2.5 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus-within:border-[#143D32] focus-within:bg-white transition-colors">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="flex-1 text-left">
                  <label className="block text-[10px] font-mono uppercase text-slate-500">
                    To Campus
                  </label>
                  <input
                    type="text"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="Campus gate or college"
                    className="w-full bg-transparent text-sm text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="w-full md:w-36 flex items-center gap-2.5 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="flex-1 text-left">
                  <label className="block text-[10px] font-mono uppercase text-slate-500">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-transparent text-xs font-mono text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-[#143D32] hover:bg-[#0f2e26] text-white font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-sm shrink-0"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Hero Schematic Corridor Display */}
      <div className="hero-map-frame mt-12 max-w-5xl mx-auto bg-white rounded-xl border border-slate-200 p-6 sm:p-7 shadow-sm relative">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-slate-900 font-medium">Corridor 01:</span>
            <span>North Campus Artery</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[11px]">
            <span>Live Speed: 42 km/h</span>
            <span className="text-emerald-600 font-medium">
              Cost split only
            </span>
          </div>
        </div>

        {/* SVG Route Track */}
        <div className="relative h-36 sm:h-44 w-full mt-4 flex items-center">
          <svg
            className="w-full h-full overflow-visible"
            viewBox="0 0 840 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line
              x1="0"
              y1="40"
              x2="840"
              y2="40"
              stroke="#F1F5F9"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <line
              x1="0"
              y1="80"
              x2="840"
              y2="80"
              stroke="#F1F5F9"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <line
              x1="0"
              y1="120"
              x2="840"
              y2="120"
              stroke="#F1F5F9"
              strokeWidth="1"
              strokeDasharray="4 4"
            />

            {/* Base Route Track */}
            <path
              d="M 60 80 C 220 25, 340 135, 540 80 C 660 50, 720 80, 780 80"
              stroke="#E2E8F0"
              strokeWidth="5"
              strokeLinecap="round"
            />

            {/* Active Highlight Track */}
            <path
              d="M 60 80 C 220 25, 340 135, 540 80 C 660 50, 720 80, 780 80"
              stroke="#2563EB"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="8 8"
            />

            {/* Waypoint 1: Home */}
            <g transform="translate(60, 80)">
              <circle r="8" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
              <circle r="3" fill="#0F172A" />
              <text
                x="0"
                y="-16"
                textAnchor="middle"
                fill="#0F172A"
                fontSize="11"
                fontWeight="600"
              >
                Rohini Sec 14
              </text>
              <text
                x="0"
                y="22"
                textAnchor="middle"
                fill="#64748B"
                fontSize="10"
                fontFamily="monospace"
              >
                08:15 AM
              </text>
            </g>

            {/* Waypoint 2: Metro */}
            <g transform="translate(280, 55)">
              <circle r="6" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2" />
              <circle r="2.5" fill="#2563EB" />
              <text
                x="0"
                y="-14"
                textAnchor="middle"
                fill="#2563EB"
                fontSize="11"
                fontWeight="500"
              >
                Pitampura Metro
              </text>
              <text
                x="0"
                y="20"
                textAnchor="middle"
                fill="#64748B"
                fontSize="10"
                fontFamily="monospace"
              >
                Rahul S. (+1)
              </text>
            </g>

            {/* Waypoint 3: Outer Ring */}
            <g transform="translate(540, 80)">
              <circle r="6" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2" />
              <circle r="2.5" fill="#2563EB" />
              <text
                x="0"
                y="-14"
                textAnchor="middle"
                fill="#2563EB"
                fontSize="11"
                fontWeight="500"
              >
                Ring Road Junction
              </text>
              <text
                x="0"
                y="20"
                textAnchor="middle"
                fill="#64748B"
                fontSize="10"
                fontFamily="monospace"
              >
                Priya S. (+1)
              </text>
            </g>

            {/* Waypoint 4: Campus */}
            <g transform="translate(780, 80)">
              <circle r="10" fill="#FFFFFF" stroke="#059669" strokeWidth="3" />
              <circle r="4" fill="#059669" />
              <text
                x="0"
                y="-18"
                textAnchor="middle"
                fill="#065F46"
                fontSize="11"
                fontWeight="700"
              >
                DTU Main Gate
              </text>
              <text
                x="0"
                y="24"
                textAnchor="middle"
                fill="#059669"
                fontSize="10"
                fontWeight="600"
                fontFamily="monospace"
              >
                08:45 AM Arrival
              </text>
            </g>
          </svg>

          {/* Dynamically Traveling Vehicle Marker */}
          <div
            className="absolute top-1/2 -translate-y-1/2 transition-all duration-75 pointer-events-none"
            style={{ left: `${carProgress}%` }}
          >
            <div className="relative -top-4">
              <div className="bg-slate-900 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow-sm whitespace-nowrap flex items-center gap-1.5 border border-white/10">
                <span>Aditya</span>
                <span className="text-emerald-400">· ₹40</span>
              </div>
              <div className="w-1.5 h-1.5 bg-slate-900 rotate-45 mx-auto -mt-0.5" />
            </div>
          </div>
        </div>

        {/* Telemetry Strip */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-500 block text-[11px]">Distance</span>
            <span className="text-slate-900 font-semibold">
              14.2 km corridor
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">
              Detour impact
            </span>
            <span className="text-emerald-600 font-semibold">
              &lt; 4 mins total
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">
              Fare structure
            </span>
            <span className="text-slate-900 font-semibold">₹40 fuel split</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">
              Authentication
            </span>
            <span className="text-[#143D32] font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified IDs
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

// Backwards-compatible alias
export const EditorialHero = Hero;
