import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import {
  Car,
  MapPin,
  Clock,
  Users,
  Shield,
  CheckCircle2,
  Calendar,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

const PRESET_LOCATIONS = [
  { text: "Campus Gate 1 (Main Entrance)", lat: 28.545, lng: 77.192 },
  { text: "North Campus Hostel Complex", lat: 28.552, lng: 77.185 },
  { text: "City Metro Station (Blue Line)", lat: 28.567, lng: 77.208 },
  { text: "Central Railway Station", lat: 28.58, lng: 77.22 },
  { text: "Cyber City Tech Park", lat: 28.495, lng: 77.089 },
  { text: "Airport Terminal 1", lat: 28.556, lng: 77.1 },
];

export const PostRidePage: React.FC = () => {
  const { user, switchDemoUser, activePersona } = useAuth();
  const navigate = useNavigate();

  // Wizard state (Steps 1 to 5)
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [originIndex, setOriginIndex] = useState(0);
  const [destIndex, setDestIndex] = useState(2);
  const [departureDate, setDepartureDate] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    return d.toISOString().slice(0, 16);
  });
  const [recurring, setRecurring] = useState(false);
  const [availableSeats, setAvailableSeats] = useState(3);
  const [vehicleType, setVehicleType] = useState<"car" | "bike">("car");
  const [vehicleModel, setVehicleModel] = useState("Honda City");
  const [plateLast4, setPlateLast4] = useState("4821");
  const [pricePerSeat, setPricePerSeat] = useState<number>(20);

  // Preferences
  const [musicAllowed, setMusicAllowed] = useState(true);
  const [smokingAllowed, setSmokingAllowed] = useState(false);
  const [womenOnlyDriver, setWomenOnlyDriver] = useState(
    user?.gender === "female",
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleNext = () => {
    if (currentStep === 1 && originIndex === destIndex) {
      setError("Origin and destination cannot be the same.");
      return;
    }
    setError("");
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const handleBack = () => {
    setError("");
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handlePublish = async () => {
    setError("");
    setLoading(true);

    try {
      const origin = PRESET_LOCATIONS[originIndex];
      const destination = PRESET_LOCATIONS[destIndex];

      await api.createRide({
        origin,
        destination,
        departureTime: new Date(departureDate).toISOString(),
        availableSeats,
        pricePerSeat: Math.max(10, pricePerSeat || 10),
        vehicle: {
          type: vehicleType,
          model: vehicleModel,
          capacity: availableSeats + 1,
          plateLast4,
        },
        preferences: {
          musicAllowed,
          smokingAllowed,
          womenOnlyDriver,
        },
      });

      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to post ride");
      setLoading(false);
    }
  };

  const stepsList = [
    { num: 1, title: "Route" },
    { num: 2, title: "Schedule" },
    { num: 3, title: "Seats" },
    { num: 4, title: "Preferences" },
    { num: 5, title: "Publish" },
  ];

  // Passenger Persona Guard: Passengers search & book rides, cannot post
  if (activePersona === 'passenger') {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-inner">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-blue-100 text-blue-800 uppercase tracking-wider border border-blue-300">
            Passenger Mode Active
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-3 tracking-tight">
            Passengers Search Rides
          </h2>
          <p className="text-slate-600 mt-2 text-sm leading-relaxed">
            You are logged in as <strong>{user?.name || 'Rahul Sharma'}</strong> (Passenger). In passenger mode, you can search and book seats on scheduled peer carpools. Posting a ride requires a verified vehicle driver persona.
          </p>
          <div className="mt-6 space-y-2.5">
            <button
              onClick={() => navigate('/search')}
              className="w-full py-3 px-4 rounded-xl bg-[#143D32] text-white font-semibold text-sm hover:bg-[#0f2e26] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Search Campus Rides</span>
            </button>
            <button
              onClick={async () => {
                await switchDemoUser('aditya');
                navigate('/post');
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-medium text-xs hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Switch to Driver Mode (Aditya Kumar)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Admin Persona Guard: Admin oversees operations, cannot post rides
  if (activePersona === 'admin') {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4 border border-amber-100 shadow-inner">
            <Shield className="w-8 h-8 text-amber-600" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-amber-100 text-amber-800 uppercase tracking-wider border border-amber-300">
            Admin Mode Active
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-3 tracking-tight">
            Security & Operations Center
          </h2>
          <p className="text-slate-600 mt-2 text-sm leading-relaxed">
            You are logged in as <strong>Campus Administrator</strong>. Administrators oversee live rides, revenue, pricing benchmarks, and safety audits from the Operations Dashboard.
          </p>
          <div className="mt-6 space-y-2.5">
            <button
              onClick={() => navigate('/admin')}
              className="w-full py-3 px-4 rounded-xl bg-[#143D32] text-white font-semibold text-sm hover:bg-[#0f2e26] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <Shield className="w-4 h-4" />
              <span>Open Admin Dashboard</span>
            </button>
            <button
              onClick={async () => {
                await switchDemoUser('aditya');
                navigate('/post');
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-medium text-xs hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Switch to Driver Mode (Aditya Kumar)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Wizard Header */}
      <div className="text-center mb-8">
        <span className="text-xs font-mono uppercase tracking-widest text-[#1769FF] font-semibold block mb-2">
          CAMPUSRIDE CARPOOL REGISTRATION
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#111111] uppercase tracking-tight">
          Offer Empty Seats.
        </h1>
        <p className="text-sm text-[#646A67] mt-1">
          Share your commute costs with verified classmates traveling your
          corridor.
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#DDE1DE] shadow-xs mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-[#DDE1DE] -translate-y-1/2 -z-0" />
          {stepsList.map((s) => {
            const isDone = currentStep > s.num;
            const isCurrent = currentStep === s.num;

            return (
              <div
                key={s.num}
                className="relative z-10 flex flex-col items-center"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                    isDone
                      ? "bg-[#18A66A] text-white"
                      : isCurrent
                        ? "bg-[#1769FF] text-white ring-4 ring-[#1769FF]/20"
                        : "bg-[#F5F6F3] text-[#646A67] border border-[#DDE1DE]"
                  }`}
                >
                  {isDone ? "✓" : `0${s.num}`}
                </div>
                <span
                  className={`text-[11px] font-mono mt-1 hidden sm:block ${isCurrent ? "font-bold text-[#111111]" : "text-[#646A67]"}`}
                >
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error notification */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-mono">
          ⚠️ {error}
        </div>
      )}

      {/* Step Content Card with Animated Transitions */}
      <div className="bg-[#FFFFFF] p-6 sm:p-10 rounded-2xl border border-[#DDE1DE] shadow-xs min-h-[380px] flex flex-col justify-between">
        <AnimatePresence mode="wait">
          {/* STEP 1: ROUTE */}
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="border-b border-[#DDE1DE] pb-3">
                <span className="text-xs font-mono text-[#1769FF] font-bold uppercase">
                  Step 01 / Route
                </span>
                <h2 className="text-xl font-black text-[#111111] mt-1">
                  Select Origin & Destination
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-mono text-[#646A67] uppercase block mb-2">
                    Pickup Location
                  </label>
                  <select
                    value={originIndex}
                    onChange={(e) => setOriginIndex(Number(e.target.value))}
                    className="w-full p-3 rounded-xl bg-[#F5F6F3] border border-[#DDE1DE] text-sm text-[#111111] focus:outline-none focus:border-[#1769FF]"
                  >
                    {PRESET_LOCATIONS.map((loc, i) => (
                      <option key={i} value={i}>
                        {loc.text}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-[#646A67] uppercase block mb-2">
                    Campus Destination
                  </label>
                  <select
                    value={destIndex}
                    onChange={(e) => setDestIndex(Number(e.target.value))}
                    className="w-full p-3 rounded-xl bg-[#F5F6F3] border border-[#DDE1DE] text-sm text-[#111111] focus:outline-none focus:border-[#1769FF]"
                  >
                    {PRESET_LOCATIONS.map((loc, i) => (
                      <option key={i} value={i}>
                        {loc.text}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: SCHEDULE */}
          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="border-b border-[#DDE1DE] pb-3">
                <span className="text-xs font-mono text-[#1769FF] font-bold uppercase">
                  Step 02 / Schedule
                </span>
                <h2 className="text-xl font-black text-[#111111] mt-1">
                  Departure Date & Time
                </h2>
              </div>

              <div>
                <label className="text-xs font-mono text-[#646A67] uppercase block mb-2">
                  Departure Slot
                </label>
                <input
                  type="datetime-local"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#F5F6F3] border border-[#DDE1DE] text-sm font-mono text-[#111111] focus:outline-none"
                />
              </div>

              <div className="p-4 rounded-xl bg-[#F5F6F3] border border-[#DDE1DE] flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-[#111111]">
                    Recurring Weekday Commute
                  </div>
                  <div className="text-xs text-[#646A67]">
                    Repeat this departure slot every Monday–Friday
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={recurring}
                  onChange={(e) => setRecurring(e.target.checked)}
                  className="w-5 h-5 rounded accent-[#1769FF]"
                />
              </div>
            </motion.div>
          )}

          {/* STEP 3: SEATS & VEHICLE */}
          {currentStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="border-b border-[#DDE1DE] pb-3">
                <span className="text-xs font-mono text-[#1769FF] font-bold uppercase">
                  Step 03 / Vehicle & Capacity
                </span>
                <h2 className="text-xl font-black text-[#111111] mt-1">
                  Vehicle Specifications
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-[#646A67] uppercase block mb-1.5">
                    Vehicle Type
                  </label>
                  <select
                    value={vehicleType}
                    onChange={(e) =>
                      setVehicleType(e.target.value as "car" | "bike")
                    }
                    className="w-full p-3 rounded-xl bg-[#F5F6F3] border border-[#DDE1DE] text-sm font-mono"
                  >
                    <option value="car">Car (Sedan / Hatchback / SUV)</option>
                    <option value="bike">Two-Wheeler / Bike</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-[#646A67] uppercase block mb-1.5">
                    Model Name
                  </label>
                  <input
                    type="text"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    placeholder="e.g. Honda City"
                    className="w-full p-3 rounded-xl bg-[#F5F6F3] border border-[#DDE1DE] text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-[#646A67] uppercase block mb-1.5">
                    License Plate (Last 4 Digits)
                  </label>
                  <input
                    type="text"
                    value={plateLast4}
                    onChange={(e) => setPlateLast4(e.target.value)}
                    maxLength={4}
                    placeholder="4821"
                    className="w-full p-3 rounded-xl bg-[#F5F6F3] border border-[#DDE1DE] text-sm font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-[#646A67] uppercase block mb-1.5">
                    Available Passenger Seats
                  </label>
                  <select
                    value={availableSeats}
                    onChange={(e) => setAvailableSeats(Number(e.target.value))}
                    className="w-full p-3 rounded-xl bg-[#F5F6F3] border border-[#DDE1DE] text-sm font-mono"
                  >
                    <option value={1}>1 passenger</option>
                    <option value={2}>2 passengers</option>
                    <option value={3}>3 passengers</option>
                    <option value={4}>4 passengers</option>
                  </select>
                </div>
              </div>

              {/* Price Per Seat Input (Minimum ₹10) */}
              <div className="p-4 rounded-xl bg-[#F5F6F3] border border-[#DDE1DE] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-[#111111] uppercase font-bold flex items-center gap-1.5">
                    <span>Fare Contribution Per Seat</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                      Campus Min: ₹10
                    </span>
                  </label>
                  <span className="text-xs font-mono text-slate-500">Local transit shared rate</span>
                </div>
                <div className="relative max-w-xs">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-700 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min={10}
                    value={pricePerSeat}
                    onChange={(e) => setPricePerSeat(Math.max(10, Number(e.target.value)))}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-white border border-[#DDE1DE] text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                    placeholder="20"
                  />
                </div>
                <p className="text-[11px] text-[#646A67]">
                  Helps offset fuel costs for your carpool. Admin minimum threshold is ₹10 per seat.
                </p>
              </div>
            </motion.div>
          )}

          {/* STEP 4: PREFERENCES */}
          {currentStep === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="border-b border-[#DDE1DE] pb-3">
                <span className="text-xs font-mono text-[#1769FF] font-bold uppercase">
                  Step 04 / Preferences
                </span>
                <h2 className="text-xl font-black text-[#111111] mt-1">
                  Commute Ground Rules
                </h2>
              </div>

              <div className="space-y-3">
                <label className="p-4 rounded-xl bg-[#F5F6F3] border border-[#DDE1DE] flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-sm font-bold text-[#111111] block">
                      Women-Only Carpool
                    </span>
                    <span className="text-xs text-[#646A67]">
                      Only match with verified female passengers
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={womenOnlyDriver}
                    onChange={(e) => setWomenOnlyDriver(e.target.checked)}
                    className="w-5 h-5 rounded accent-[#18A66A]"
                  />
                </label>

                <label className="p-4 rounded-xl bg-[#F5F6F3] border border-[#DDE1DE] flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-sm font-bold text-[#111111] block">
                      Music Allowed
                    </span>
                    <span className="text-xs text-[#646A67]">
                      Radio / AUX playback during commute
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={musicAllowed}
                    onChange={(e) => setMusicAllowed(e.target.checked)}
                    className="w-5 h-5 rounded accent-[#1769FF]"
                  />
                </label>
              </div>
            </motion.div>
          )}

          {/* STEP 5: REVIEW & PUBLISH */}
          {currentStep === 5 && (
            <motion.div
              key="step-5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="border-b border-[#DDE1DE] pb-3">
                <span className="text-xs font-mono text-[#18A66A] font-bold uppercase">
                  Step 05 / Review & Publish
                </span>
                <h2 className="text-xl font-black text-[#111111] mt-1">
                  Commute Pass Summary
                </h2>
              </div>

              <div className="p-5 rounded-xl bg-[#F5F6F3] border border-[#DDE1DE] space-y-3 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-[#646A67]">Route:</span>
                  <span className="font-bold text-[#111111]">
                    {PRESET_LOCATIONS[originIndex].text} →{" "}
                    {PRESET_LOCATIONS[destIndex].text}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#646A67]">Departure:</span>
                  <span className="font-bold text-[#1769FF]">
                    {new Date(departureDate).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#646A67]">Vehicle:</span>
                  <span className="font-bold text-[#111111]">
                    {vehicleModel} (••• {plateLast4})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#646A67]">Seats Open:</span>
                  <span className="font-bold text-[#18A66A]">
                    {availableSeats} seats
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wizard Footer Controls */}
        <div className="mt-8 pt-6 border-t border-[#DDE1DE] flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              onClick={handleBack}
              className="px-5 py-2.5 rounded-xl border border-[#DDE1DE] text-xs font-mono font-bold text-[#111111] hover:bg-[#F5F6F3] flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-[#1769FF] hover:bg-[#1D4ED8] text-white text-xs font-mono font-bold flex items-center gap-2 shadow-xs"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handlePublish}
              disabled={loading}
              className="px-8 py-3 rounded-xl bg-[#18A66A] hover:bg-[#15803D] text-white text-sm font-mono font-bold flex items-center gap-2 shadow-xs disabled:opacity-50"
            >
              {loading ? (
                <span>Publishing corridor...</span>
              ) : (
                <span>Publish Campus Commute →</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
