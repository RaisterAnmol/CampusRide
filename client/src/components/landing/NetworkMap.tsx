import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navigation, Users, Clock, ShieldCheck, ArrowRight, MapPin, Zap } from 'lucide-react';

interface ActiveVehicle {
  id: string;
  driver: string;
  car: string;
  route: string;
  departure: string;
  eta: string;
  fare: string;
  seats: number;
  corridor: 'north' | 'west' | 'east';
  x: number;
  y: number;
  progress: number;
  verified: boolean;
}

const VEHICLES: ActiveVehicle[] = [
  {
    id: 'v-1',
    driver: 'Aditya Kumar',
    car: 'Honda City (DL 8C 4920)',
    route: 'Rohini Sector 14 → DTU',
    departure: '08:15 AM',
    eta: '8 mins to campus',
    fare: '₹40',
    seats: 2,
    corridor: 'north',
    x: 280,
    y: 120,
    progress: 45,
    verified: true,
  },
  {
    id: 'v-2',
    driver: 'Ananya Verma',
    car: 'Hyundai i20 (DL 3C 8112)',
    route: 'Pitampura Metro → DTU',
    departure: '08:30 AM',
    eta: '14 mins to campus',
    fare: '₹35',
    seats: 1,
    corridor: 'north',
    x: 460,
    y: 180,
    progress: 68,
    verified: true,
  },
  {
    id: 'v-3',
    driver: 'Siddharth Rao',
    car: 'Maruti Baleno (DL 1Z 7721)',
    route: 'Janakpuri West → Campus',
    departure: '08:20 AM',
    eta: '18 mins to campus',
    fare: '₹55',
    seats: 3,
    corridor: 'west',
    x: 220,
    y: 310,
    progress: 35,
    verified: true,
  },
  {
    id: 'v-4',
    driver: 'Pooja Mehrotra',
    car: 'Tata Nexon EV (DL 2C 5430)',
    route: 'Civil Lines → DTU Gate 2',
    departure: '08:25 AM',
    eta: '11 mins to campus',
    fare: '₹45',
    seats: 2,
    corridor: 'east',
    x: 640,
    y: 260,
    progress: 52,
    verified: true,
  },
];

export const NetworkMap: React.FC = () => {
  const [selectedCorridor, setSelectedCorridor] = useState<'all' | 'north' | 'west' | 'east'>('all');
  const [activeVehicleId, setActiveVehicleId] = useState<string>('v-1');
  const [simulatedTick, setSimulatedTick] = useState(0);

  // Animate dynamic vehicle movements along paths
  useEffect(() => {
    const timer = setInterval(() => {
      setSimulatedTick((t) => t + 1);
    }, 120);
    return () => clearInterval(timer);
  }, []);

  const filteredVehicles = selectedCorridor === 'all'
    ? VEHICLES
    : VEHICLES.filter((v) => v.corridor === selectedCorridor);

  const activeVehicle = VEHICLES.find((v) => v.id === activeVehicleId) || VEHICLES[0];

  return (
    <section id="live-map" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#EAECF0]">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ECFDF3] text-[#027A48] text-xs font-mono font-semibold border border-[#D1FADF]">
            <span className="w-2 h-2 rounded-full bg-[#12B76A] animate-pulse" />
            <span>24 STUDENTS ARE HEADING TOWARD CAMPUS RIGHT NOW</span>
          </div>
          <h2 className="mt-3 text-4xl sm:text-6xl font-black text-[#101828] uppercase tracking-tight">
            Find Your People.
          </h2>
          <p className="mt-2 text-base text-[#667085] max-w-xl">
            Live interactive transit schematic of active carpools operating across primary Delhi-NCR university corridors.
          </p>
        </div>

        {/* Corridor Selector Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#FFFFFF] rounded-xl border border-[#EAECF0] shadow-sm text-xs font-mono self-start md:self-auto">
          {(['all', 'north', 'west', 'east'] as const).map((corr) => (
            <button
              key={corr}
              onClick={() => setSelectedCorridor(corr)}
              className={`px-3 py-1.5 rounded-lg uppercase transition-all ${
                selectedCorridor === corr
                  ? 'bg-[#101828] text-white font-semibold shadow-sm'
                  : 'text-[#667085] hover:text-[#101828] hover:bg-[#F7F8FA]'
              }`}
            >
              {corr === 'all' ? 'All Corridors' : `${corr} Sector`}
            </button>
          ))}
        </div>
      </div>

      {/* Huge Interactive Schematic Transit Canvas */}
      <div className="mt-10 bg-[#FFFFFF] rounded-2xl border border-[#EAECF0] shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left / Main: Dynamic Schematic Map */}
        <div className="lg:col-span-8 p-6 sm:p-8 relative min-h-[480px] sm:min-h-[540px] flex flex-col justify-between bg-[radial-gradient(#E4E7EC_1px,transparent_1px)] [background-size:24px_24px]">
          {/* Top Status Bar in Map */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-3 bg-[#FFFFFF]/90 backdrop-blur px-3 py-1.5 rounded-lg border border-[#EAECF0] text-xs font-mono">
              <span className="text-[#101828] font-bold">TRANSIT MESH: DELHI TECH ARTERY</span>
              <span className="text-[#667085]">• 4 ACTIVE CORRIDORS</span>
            </div>
            <div className="bg-[#FFFFFF]/90 backdrop-blur px-3 py-1.5 rounded-lg border border-[#EAECF0] text-xs font-mono text-[#12B76A] font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#12B76A]" />
              <span>LIVE TRACKING ACTIVE</span>
            </div>
          </div>

          {/* SVG Schematic Network Curves */}
          <div className="absolute inset-0 w-full h-full flex items-center justify-center p-8 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 900 480" fill="none">
              {/* Corridor North: Cyan/Cobalt */}
              <path
                d="M 120 100 C 300 80, 480 160, 750 240"
                stroke="#D1E9FF"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d="M 120 100 C 300 80, 480 160, 750 240"
                stroke="#175CD3"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="6 6"
                className="route-dash-moving"
              />

              {/* Corridor West: Neutral */}
              <path
                d="M 100 380 C 260 360, 460 300, 750 240"
                stroke="#EAECF0"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d="M 100 380 C 260 360, 460 300, 750 240"
                stroke="#667085"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="6 6"
                className="route-dash-moving"
              />

              {/* Corridor East: Emerald */}
              <path
                d="M 850 420 C 780 340, 680 280, 750 240"
                stroke="#D1FADF"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d="M 850 420 C 780 340, 680 280, 750 240"
                stroke="#12B76A"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="6 6"
                className="route-dash-moving"
              />

              {/* Destination Hub: DTU Main Campus */}
              <g transform="translate(750, 240)">
                <circle r="36" fill="#EFF8FF" stroke="#175CD3" strokeWidth="2" strokeDasharray="4 4" className="animate-spin" style={{ animationDuration: '20s' }} />
                <circle r="22" fill="#FFFFFF" stroke="#12B76A" strokeWidth="4" />
                <circle r="10" fill="#12B76A" />
                <text x="0" y="-44" textAnchor="middle" fill="#101828" fontSize="13" fontWeight="800" fontFamily="Inter, sans-serif">
                  🎓 DTU MAIN CAMPUS
                </text>
                <text x="0" y="48" textAnchor="middle" fill="#667085" fontSize="10" fontWeight="600" fontFamily="monospace">
                  CENTRAL TRANSIT HUB
                </text>
              </g>

              {/* Waypoint 1: Rohini Sector 14 */}
              <g transform="translate(120, 100)">
                <circle r="10" fill="#FFFFFF" stroke="#175CD3" strokeWidth="3" />
                <circle r="4" fill="#175CD3" />
                <text x="0" y="-18" textAnchor="middle" fill="#101828" fontSize="11" fontWeight="700">
                  Rohini Sec 14
                </text>
              </g>

              {/* Waypoint 2: Pitampura Metro */}
              <g transform="translate(420, 150)">
                <circle r="8" fill="#FFFFFF" stroke="#175CD3" strokeWidth="2.5" />
                <circle r="3.5" fill="#175CD3" />
                <text x="0" y="-16" textAnchor="middle" fill="#175CD3" fontSize="10" fontWeight="600">
                  Pitampura Metro
                </text>
              </g>

              {/* Waypoint 3: Janakpuri */}
              <g transform="translate(100, 380)">
                <circle r="10" fill="#FFFFFF" stroke="#667085" strokeWidth="3" />
                <circle r="4" fill="#667085" />
                <text x="0" y="24" textAnchor="middle" fill="#101828" fontSize="11" fontWeight="700">
                  Janakpuri West
                </text>
              </g>

              {/* Waypoint 4: Civil Lines */}
              <g transform="translate(850, 420)">
                <circle r="10" fill="#FFFFFF" stroke="#12B76A" strokeWidth="3" />
                <circle r="4" fill="#12B76A" />
                <text x="0" y="24" textAnchor="middle" fill="#101828" fontSize="11" fontWeight="700">
                  Civil Lines
                </text>
              </g>
            </svg>
          </div>

          {/* Interactive Dynamic Vehicle Markers Placed on Map */}
          <div className="relative w-full h-full z-20 pointer-events-auto">
            {filteredVehicles.map((v, i) => {
              // Calculate slight offset based on simulatedTick
              const dx = Math.sin((simulatedTick + i * 15) * 0.1) * 8;
              const dy = Math.cos((simulatedTick + i * 15) * 0.1) * 4;
              const isSelected = v.id === activeVehicleId;

              return (
                <button
                  key={v.id}
                  onClick={() => setActiveVehicleId(v.id)}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 focus:outline-none group text-left"
                  style={{
                    left: `${(v.x / 900) * 100}%`,
                    top: `${(v.y / 480) * 100}%`,
                    transform: `translate(${dx}px, ${dy}px)`,
                  }}
                >
                  <div
                    className={`px-3 py-1.5 rounded-full shadow-md transition-all flex items-center gap-2 border ${
                      isSelected
                        ? 'bg-[#101828] text-white border-[#175CD3] ring-4 ring-[#175CD3]/20 scale-110'
                        : 'bg-[#FFFFFF] text-[#101828] border-[#EAECF0] hover:border-[#175CD3]'
                    }`}
                  >
                    <span className="text-sm">🚗</span>
                    <div className="text-[11px] leading-tight font-sans">
                      <div className="font-bold whitespace-nowrap">{v.driver}</div>
                      <div className={`text-[9px] font-mono ${isSelected ? 'text-[#12B76A]' : 'text-[#667085]'}`}>
                        {v.eta}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom Live Corridor Ticker */}
          <div className="z-10 mt-auto pt-4 border-t border-[#EAECF0]/80 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[#667085]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#12B76A]" />
              <span>LIVE GPS TELEMETRY: 4 CARPOOLS STREAMING</span>
            </div>
            <div className="flex items-center gap-4">
              <span>AVG FARE: ₹38</span>
              <span>MEDIAN DETOUR: 3.2 MIN</span>
            </div>
          </div>
        </div>

        {/* Right / Sidebar: Selected Vehicle Pass & Live Ride Details */}
        <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-[#EAECF0] p-6 sm:p-8 bg-[#FAFAFC] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-[#667085] pb-4 border-b border-[#EAECF0]">
              <span>ACTIVE CORRIDOR PASS</span>
              <span className="text-[#12B76A] font-semibold">{activeVehicle.eta}</span>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-bold text-[#101828] flex items-center gap-1.5">
                    <span>{activeVehicle.driver}</span>
                    {activeVehicle.verified && (
                      <span title="Verified DTU Student">
                        <ShieldCheck className="w-4 h-4 text-[#12B76A]" />
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-[#667085] font-mono mt-0.5">{activeVehicle.car}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-[#175CD3] font-mono">{activeVehicle.fare}</span>
                  <span className="text-[10px] text-[#667085] block">fuel split</span>
                </div>
              </div>

              {/* Route Timeline */}
              <div className="mt-6 p-4 rounded-xl bg-[#FFFFFF] border border-[#EAECF0] space-y-3 font-mono text-xs">
                <div className="flex items-center gap-2 text-[#101828]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#175CD3]" />
                  <span className="font-semibold">Pickup: {activeVehicle.route.split('→')[0]}</span>
                </div>
                <div className="w-px h-4 bg-[#EAECF0] ml-1.5" />
                <div className="flex items-center gap-2 text-[#101828]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#12B76A]" />
                  <span className="font-semibold">Drop: DTU Main Gate 1</span>
                </div>
              </div>

              {/* Specs */}
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#EAECF0]">
                  <span className="text-[#667085] block text-[10px] uppercase font-mono">Departure</span>
                  <span className="font-bold text-[#101828] font-mono mt-0.5 block">{activeVehicle.departure}</span>
                </div>
                <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#EAECF0]">
                  <span className="text-[#667085] block text-[10px] uppercase font-mono">Seats Open</span>
                  <span className="font-bold text-[#12B76A] font-mono mt-0.5 block">
                    {activeVehicle.seats} seat{activeVehicle.seats > 1 ? 's' : ''} left
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#EAECF0]">
            <Link
              to="/search"
              className="w-full py-3 px-4 rounded-xl bg-[#175CD3] hover:bg-[#1749C2] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <span>Book seat on this corridor</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="mt-2.5 text-center text-[11px] text-[#667085]">
              Instant booking with university verified identity
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};



// Backwards-compatible alias
export const InteractiveNetworkMap = NetworkMap;

