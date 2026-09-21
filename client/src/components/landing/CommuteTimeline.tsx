import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight, ShieldCheck, MapPin, CheckCircle2 } from 'lucide-react';

interface DaySchedule {
  key: string;
  day: string;
  fullDay: string;
  time: string;
  driver: string;
  vehicle: string;
  route: string;
  status: string;
  fare: string;
  avatar: string;
  co2Saved: string;
}

const WEEK_DAYS: DaySchedule[] = [
  {
    key: 'mon',
    day: 'MON',
    fullDay: 'Monday',
    time: '08:15 AM',
    driver: 'Aditya Kumar',
    vehicle: 'Honda City',
    route: 'Premnagar Chowk → UIT Mechanical Block',
    status: 'Confirmed Weekly Seat',
    fare: '₹40',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&q=80',
    co2Saved: '1.4 kg CO₂',
  },
  {
    key: 'tue',
    day: 'TUE',
    fullDay: 'Tuesday',
    time: '08:30 AM',
    driver: 'Ananya Verma',
    vehicle: 'Hyundai i20',
    route: 'Suddhowala PG Hub → UU Gate 1',
    status: 'Confirmed Weekly Seat',
    fare: '₹35',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    co2Saved: '1.2 kg CO₂',
  },
  {
    key: 'wed',
    day: 'WED',
    fullDay: 'Wednesday',
    time: '08:15 AM',
    driver: 'Aditya Kumar',
    vehicle: 'Honda City',
    route: 'Premnagar Chowk → UIT Mechanical Block',
    status: 'Confirmed Weekly Seat',
    fare: '₹40',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&q=80',
    co2Saved: '1.4 kg CO₂',
  },
  {
    key: 'thu',
    day: 'THU',
    fullDay: 'Thursday',
    time: '08:30 AM',
    driver: 'Ananya Verma',
    vehicle: 'Hyundai i20',
    route: 'Suddhowala PG Hub → UU Gate 1',
    status: 'Confirmed Weekly Seat',
    fare: '₹35',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    co2Saved: '1.2 kg CO₂',
  },
  {
    key: 'fri',
    day: 'FRI',
    fullDay: 'Friday',
    time: '08:20 AM',
    driver: 'Siddharth Rao',
    vehicle: 'Maruti Baleno',
    route: 'Ballupur Chowk → UIT Campus Gate',
    status: 'Confirmed Weekly Seat',
    fare: '₹50',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    co2Saved: '1.6 kg CO₂',
  },
];

export const CommuteTimeline: React.FC = () => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const active = WEEK_DAYS[selectedDayIndex];

  return (
    <section id="weekly-timeline" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#EAECF0]">
      {/* Section Header */}
      <div className="max-w-3xl">
        <p className="text-xs font-mono uppercase tracking-widest text-[#175CD3] font-semibold">
          Section 03 / Routine Commute Timetable
        </p>
        <h2 className="mt-2 text-3xl sm:text-5xl font-black text-[#101828] uppercase tracking-tight">
          Your Week.
        </h2>
        <p className="mt-3 text-base text-[#667085] leading-relaxed">
          Lock in your recurring college schedule. Hover or tap across your Monday–Friday timetable to inspect the automated carpool schedule.
        </p>
      </div>

      {/* Interactive Mon-Fri Scrubber Bar */}
      <div className="mt-12 bg-[#FFFFFF] rounded-2xl border border-[#EAECF0] p-6 sm:p-8 shadow-sm">
        {/* Timeline Header Track */}
        <div className="relative pb-6">
          {/* Connector Line */}
          <div className="absolute top-6 left-6 right-6 h-0.5 bg-[#EAECF0] hidden sm:block" />

          {/* Day Buttons */}
          <div className="grid grid-cols-5 gap-2 relative z-10">
            {WEEK_DAYS.map((d, idx) => {
              const isSelected = selectedDayIndex === idx;

              return (
                <button
                  key={d.key}
                  onClick={() => setSelectedDayIndex(idx)}
                  onMouseEnter={() => setSelectedDayIndex(idx)}
                  className={`flex flex-col items-center p-3 sm:p-4 rounded-xl transition-all ${
                    isSelected
                      ? 'bg-[#101828] text-white shadow-md scale-105'
                      : 'bg-[#F7F8FA] text-[#667085] hover:bg-[#EAECF0]/70'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-black font-mono tracking-wider">{d.day}</span>
                  <span className={`w-2.5 h-2.5 rounded-full my-2 transition-all ${
                    isSelected ? 'bg-[#12B76A] ring-4 ring-[#12B76A]/30' : 'bg-[#D0D5DD]'
                  }`} />
                  <span className={`text-[11px] font-mono ${isSelected ? 'text-[#D1E9FF]' : 'text-[#667085]'}`}>
                    {d.time}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-tight mt-1 hidden md:block">
                    CAMPUS
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Detail Card for Selected Day */}
        <div className="mt-6 pt-6 border-t border-[#EAECF0] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Day Details & Driver Profile */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-[#EFF8FF] text-[#175CD3] font-mono text-xs font-bold border border-[#D1E9FF]">
                {active.fullDay} Commute
              </span>
              <span className="text-xs font-mono text-[#12B76A] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {active.status}
              </span>
            </div>

            <h3 className="text-2xl font-bold text-[#101828]">
              {active.route}
            </h3>

            <div className="flex items-center gap-3 p-4 bg-[#F7F8FA] rounded-xl border border-[#EAECF0]">
              <img
                src={active.avatar}
                alt={active.driver}
                className="w-12 h-12 rounded-full object-cover border border-[#EAECF0]"
              />
              <div className="flex-1">
                <div className="flex items-center gap-1.5 font-bold text-sm text-[#101828]">
                  <span>{active.driver}</span>
                  <ShieldCheck className="w-4 h-4 text-[#12B76A]" />
                </div>
                <p className="text-xs text-[#667085]">{active.vehicle} • College Verified Peer</p>
              </div>
              <div className="text-right font-mono">
                <span className="text-lg font-black text-[#175CD3]">{active.fare}</span>
                <span className="text-[10px] text-[#667085] block">per trip</span>
              </div>
            </div>
          </div>

          {/* Right: SVG Route Preview & Sustainability Telemetry */}
          <div className="lg:col-span-6 bg-[#F7F8FA] p-6 rounded-xl border border-[#EAECF0] flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-mono text-[#667085]">
              <span>WEEKLY SCHEDULED METRICS</span>
              <span className="text-[#12B76A] font-bold">SAVING ~₹840 / WEEK</span>
            </div>

            {/* Dynamic Animated Route Path */}
            <div className="my-6">
              <div className="flex items-center justify-between text-xs font-mono text-[#101828] mb-2 font-semibold">
                <span>08:15 AM Pickup</span>
                <span className="text-[#175CD3]">14 km Transit</span>
                <span className="text-[#12B76A]">08:45 AM Arrival</span>
              </div>
              <div className="relative h-2 bg-[#EAECF0] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#175CD3] to-[#12B76A] rounded-full w-full animate-pulse" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-[#EAECF0]">
              <div>
                <span className="text-[#667085] block text-[11px]">Carbon Offset</span>
                <span className="font-mono font-bold text-[#101828]">{active.co2Saved} saved</span>
              </div>
              <div>
                <span className="text-[#667085] block text-[11px]">Pickup Window</span>
                <span className="font-mono font-bold text-[#175CD3]">Precise 3-min buffer</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA for Weekly Recurring Setup */}
        <div className="mt-8 pt-6 border-t border-[#EAECF0] flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-[#667085]">
            <span className="font-bold text-[#101828]">Want a stress-free semester?</span> Schedule your Monday–Friday class schedule in 2 minutes.
          </div>
          <Link
            to="/search"
            className="px-5 py-2.5 rounded-lg bg-[#101828] hover:bg-slate-800 text-white font-semibold text-xs font-mono flex items-center gap-2 transition-colors"
          >
            <span>Lock your weekly commute</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};



// Backwards-compatible alias
export const WeeklyCommuteTimeline = CommuteTimeline;

