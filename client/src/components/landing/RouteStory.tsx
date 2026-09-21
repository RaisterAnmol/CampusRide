import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck, MapPin, Users, Key, Sparkles, Navigation } from 'lucide-react';

interface StepData {
  id: string;
  stepNumber: string;
  title: string;
  tagline: string;
  description: string;
  specPill: string;
  telemetry: {
    label: string;
    value: string;
  }[];
}

const STEPS: StepData[] = [
  {
    id: 'step-1',
    stepNumber: '01',
    title: 'Choose your route',
    tagline: 'Set your regular morning or evening corridor',
    description:
      'Pin your hostel, apartment, or metro station along with your target class time. CampusRide instantly computes matching corridors across hundreds of student drivers.',
    specPill: 'GIS Corridors & Geo-Fencing',
    telemetry: [
      { label: 'Detour limit', value: '< 600 meters' },
      { label: 'Time tolerance', value: '±15 mins' },
      { label: 'Corridors active', value: '42 routes' },
    ],
  },
  {
    id: 'step-2',
    stepNumber: '02',
    title: 'Find people heading your way',
    tagline: 'Connect directly with verified students',
    description:
      'Our deterministic detour engine evaluates route overlap, mutual university departments, and driver safety ratings to deliver verified peers with 85%+ trajectory match.',
    specPill: 'Multi-Factor Matching Engine',
    telemetry: [
      { label: 'Matching score', value: '92% match' },
      { label: 'Driver rating', value: '4.8+ / 5.0' },
      { label: 'Seat availability', value: '1 to 3 seats' },
    ],
  },
  {
    id: 'step-3',
    stepNumber: '03',
    title: 'Share the journey',
    tagline: 'Secure OTP validation before wheels roll',
    description:
      'Coordinate in real-time with zero phone number exposure. Upon driver arrival, the driver reveals a 4-digit OTP that passenger enters to verify the correct student vehicle.',
    specPill: 'Zero-Leak In-App Protocol',
    telemetry: [
      { label: 'Auth mode', value: '4-Digit OTP' },
      { label: 'Location updates', value: 'Socket.IO Live' },
      { label: 'Emergency share', value: '1-Click SOS' },
    ],
  },
  {
    id: 'step-4',
    stepNumber: '04',
    title: 'Arrive together',
    tagline: 'Direct college drop-off with mutual trust ratings',
    description:
      'Drop off directly at the departmental gate on time. Split fuel costs transparently with zero platform commission or surge multipliers, and leave mutual peer reviews.',
    specPill: 'Zero Surge / Zero Commission',
    telemetry: [
      { label: 'Avg cost saved', value: '₹140 / day' },
      { label: 'CO₂ offset', value: '1.4 kg / trip' },
      { label: 'Community trust', value: '4.9★ verified' },
    ],
  },
];

export const RouteStory: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  // Vehicle coordinate along vertical route path
  const carOffsets = [12, 38, 64, 88];

  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#EAECF0]">
      {/* Editorial Typography Header */}
      <div className="max-w-4xl">
        <p className="text-xs font-mono uppercase tracking-widest text-[#175CD3] font-semibold">
          Section 01 / The Journey Sequence
        </p>
        <h2 className="mt-3 text-4xl sm:text-6xl font-black tracking-tight text-[#101828] uppercase leading-[0.95]">
          Commuting<br />
          Shouldn't Be<br />
          Complicated.
        </h2>
        <p className="mt-6 text-lg sm:text-xl text-[#667085] leading-relaxed max-w-2xl">
          CampusRide connects students travelling the same roads at the same time. No unpredictable cab surges. No standing in packed buses. No asking 14 friends on WhatsApp.
        </p>
      </div>

      {/* Signature Continuous Journey Container */}
      <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Continuous Vertical SVG Track & Interactive Step Scrubber */}
        <div className="lg:col-span-5 bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#EAECF0] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-[#EAECF0] text-xs font-mono text-[#667085]">
            <span>ROUTE RUNWAY: HOME → CAMPUS</span>
            <span className="text-[#175CD3] font-semibold">STEP {STEPS[activeStep].stepNumber} / 04</span>
          </div>

          <div className="relative mt-8 min-h-[460px] flex">
            {/* Continuous SVG Route Line on the left */}
            <div className="relative w-16 sm:w-20 shrink-0 flex justify-center">
              <svg className="h-full w-8 overflow-visible" viewBox="0 0 32 460" fill="none">
                {/* Background line */}
                <line x1="16" y1="10" x2="16" y2="450" stroke="#EAECF0" strokeWidth="4" strokeLinecap="round" />
                {/* Active illuminated path */}
                <line
                  x1="16"
                  y1="10"
                  x2="16"
                  y2={10 + (activeStep * 110)}
                  stroke="#175CD3"
                  strokeWidth="4"
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />

                {/* Waypoint Nodes */}
                {[0, 1, 2, 3].map((idx) => {
                  const cy = 20 + idx * 140;
                  const isCurrent = activeStep === idx;
                  const isPassed = activeStep >= idx;
                  return (
                    <g key={idx} transform={`translate(16, ${cy})`}>
                      <circle
                        r={isCurrent ? '9' : '6'}
                        fill="#FFFFFF"
                        stroke={isPassed ? '#175CD3' : '#D0D5DD'}
                        strokeWidth={isCurrent ? '3' : '2'}
                        className="transition-all duration-300"
                      />
                      {isPassed && <circle r="3" fill="#175CD3" />}
                    </g>
                  );
                })}
              </svg>

              {/* Physical Traveling Vehicle Marker */}
              <div
                className="absolute left-1/2 -translate-x-1/2 transition-all duration-500 z-20 pointer-events-none"
                style={{ top: `${carOffsets[activeStep]}%` }}
              >
                <div className="w-8 h-8 rounded-full bg-[#101828] text-white flex items-center justify-center text-sm shadow-lg ring-4 ring-[#175CD3]/20">
                  🚗
                </div>
              </div>
            </div>

            {/* Step Selection Buttons alongside the track */}
            <div className="flex-1 flex flex-col justify-between py-2 pl-2">
              {STEPS.map((step, idx) => {
                const isActive = activeStep === idx;
                return (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(idx)}
                    className={`text-left p-3.5 rounded-xl transition-all border ${
                      isActive
                        ? 'bg-[#F7F8FA] border-[#175CD3] shadow-sm'
                        : 'border-transparent hover:bg-[#F7F8FA]/60 text-[#667085]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                          isActive ? 'bg-[#175CD3] text-white' : 'bg-[#EAECF0] text-[#667085]'
                        }`}
                      >
                        {step.stepNumber}
                      </span>
                      <span className={`text-sm font-bold ${isActive ? 'text-[#101828]' : 'text-[#667085]'}`}>
                        {step.title}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#667085] line-clamp-1">{step.tagline}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#EAECF0] flex items-center justify-between text-xs text-[#667085]">
            <span>Click any step to inspect</span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={activeStep === 0}
                onClick={() => setActiveStep((p) => Math.max(0, p - 1))}
                className="px-2.5 py-1 rounded bg-[#F7F8FA] hover:bg-[#EAECF0] disabled:opacity-40 font-mono"
              >
                ← Prev
              </button>
              <button
                disabled={activeStep === 3}
                onClick={() => setActiveStep((p) => Math.min(3, p + 1))}
                className="px-2.5 py-1 rounded bg-[#175CD3] text-white hover:bg-[#1749C2] disabled:opacity-40 font-mono"
              >
                Next →
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Telemetry & Interactive State Preview */}
        <div className="lg:col-span-7 bg-[#FFFFFF] p-8 rounded-2xl border border-[#EAECF0] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-4">
              <span className="px-3 py-1 rounded-md bg-[#EFF8FF] text-[#175CD3] font-mono text-xs font-semibold border border-[#D1E9FF]">
                {STEPS[activeStep].specPill}
              </span>
              <span className="text-xs font-mono text-[#667085]">DTU · NSUT · DU COMMUTE PROTOCOL</span>
            </div>

            <h3 className="mt-6 text-3xl font-black text-[#101828] tracking-tight">
              {STEPS[activeStep].title}
            </h3>
            <p className="mt-2 text-base font-medium text-[#175CD3]">
              {STEPS[activeStep].tagline}
            </p>
            <p className="mt-4 text-base text-[#667085] leading-relaxed">
              {STEPS[activeStep].description}
            </p>

            {/* Technical Telemetry Matrix */}
            <div className="mt-8 grid grid-cols-3 gap-4 p-4 rounded-xl bg-[#F7F8FA] border border-[#EAECF0]">
              {STEPS[activeStep].telemetry.map((t, i) => (
                <div key={i} className="text-left">
                  <span className="text-[11px] font-mono text-[#667085] uppercase block">{t.label}</span>
                  <span className="text-sm font-bold font-mono text-[#101828] mt-0.5 block">{t.value}</span>
                </div>
              ))}
            </div>

            {/* Visual Interface Preview Mockup for active step */}
            <div className="mt-8 p-5 rounded-xl border border-[#EAECF0] bg-[#FFFFFF]">
              {activeStep === 0 && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between text-[#667085]">
                    <span>ORIGIN</span>
                    <span className="text-[#101828] font-bold">Sector 14, Rohini (Block C Gate)</span>
                  </div>
                  <div className="h-px bg-[#EAECF0]" />
                  <div className="flex items-center justify-between text-[#667085]">
                    <span>CAMPUS DEST</span>
                    <span className="text-[#175CD3] font-bold">DTU Mechanical Dept Portico</span>
                  </div>
                  <div className="h-px bg-[#EAECF0]" />
                  <div className="flex items-center justify-between text-[#667085]">
                    <span>DEPARTURE TIME</span>
                    <span className="text-[#12B76A] font-bold">08:15 AM (Morning Slot)</span>
                  </div>
                </div>
              )}

              {activeStep === 1 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#175CD3]/10 text-[#175CD3] flex items-center justify-center font-bold">
                        AK
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#101828] flex items-center gap-1.5">
                          <span>Aditya Kumar</span>
                          <span className="text-xs px-1.5 py-0.2 bg-[#ECFDF3] text-[#027A48] rounded font-mono">
                            DTU '25
                          </span>
                        </div>
                        <div className="text-xs text-[#667085]">Honda City • DL 8C AK 4920</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-[#12B76A]">94% OVERLAP</div>
                      <div className="text-xs text-[#667085]">2 mins detour</div>
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="space-y-3">
                  <div className="p-3 bg-[#101828] text-white rounded-lg flex items-center justify-between font-mono">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-[#12B76A]" />
                      <span className="text-xs text-[#98A2B3]">BOARDING OTP:</span>
                    </div>
                    <div className="text-xl font-bold tracking-widest text-[#12B76A]">4 8 2 1</div>
                  </div>
                  <p className="text-xs text-[#667085]">
                    Driver verifies code before departure. Instant notification triggers to emergency contact.
                  </p>
                </div>
              )}

              {activeStep === 3 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#027A48] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> COMPLETED AT CAMPUS GATE
                    </span>
                    <span className="text-[#101828] font-bold">₹40 Fuel Contribution</span>
                  </div>
                  <div className="p-3 bg-[#F7F8FA] rounded-lg text-xs text-[#667085]">
                    "Smooth ride, reached right on time for ME102 lecture!" — Rahul S. (Passenger)
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#EAECF0] flex items-center justify-between">
            <span className="text-xs text-[#667085]">Verified campus community only</span>
            <a
              href="#live-map"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#175CD3] hover:text-[#1749C2]"
            >
              <span>Explore live corridor network</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};



// Backwards-compatible alias
export const ContinuousRouteStory = RouteStory;

