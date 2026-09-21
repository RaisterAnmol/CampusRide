import React from 'react';
import { Building2, BarChart3, ShieldCheck, Leaf, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DEMO_COLLEGES } from '../data/mockData';

export const CollegesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F5F6F3] text-[#111111] py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="max-w-3xl">
        <span className="text-xs font-mono uppercase tracking-widest text-[#1769FF] font-semibold block mb-3">
          INSTITUTIONAL MOBILITY PARTNERSHIPS
        </span>
        <h1 className="text-heading-clamp font-black text-[#111111] uppercase tracking-tight">
          CampusRide For<br />
          Universities.
        </h1>
        <p className="mt-4 text-base sm:text-lg text-[#646A67] leading-relaxed">
          Provide your student body with safe, coordinated everyday transit while cutting campus parking bottlenecks and carbon emissions.
        </p>
      </div>

      {/* Institutional Pillars */}
      <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-[#FFFFFF] p-8 rounded-2xl border border-[#DDE1DE] shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#1769FF] flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-[#111111]">1. Gate Transit Analytics</h3>
          <p className="text-sm text-[#646A67] leading-relaxed">
            Monitor real-time arrival peaks across campus gates to optimize security guard staffing, shuttle feeder buses, and traffic lights.
          </p>
        </div>

        <div className="bg-[#FFFFFF] p-8 rounded-2xl border border-[#DDE1DE] shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] text-[#18A66A] flex items-center justify-center">
            <Leaf className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-[#111111]">2. Quantifiable ESG / NAAC Metrics</h3>
          <p className="text-sm text-[#646A67] leading-relaxed">
            Generate verifiable carbon-offset reports detailing total vehicular emissions averted for institutional rankings and sustainability audits.
          </p>
        </div>

        <div className="bg-[#FFFFFF] p-8 rounded-2xl border border-[#DDE1DE] shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xl bg-[#F5F6F3] text-[#111111] flex items-center justify-center border border-[#DDE1DE]">
            <Building2 className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-[#111111]">3. 30%+ Parking Relief</h3>
          <p className="text-sm text-[#646A67] leading-relaxed">
            Consolidating single-occupant commuter cars into 3–4 student carpools reduces campus lot crowding without expanding asphalt parking lots.
          </p>
        </div>
      </div>

      {/* Active College Enclaves */}
      <div className="mt-14 bg-[#FFFFFF] p-8 sm:p-12 rounded-2xl border border-[#DDE1DE] shadow-xs">
        <h2 className="text-2xl font-black text-[#111111]">Active University Enclaves</h2>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {DEMO_COLLEGES.map((c, i) => (
            <div key={i} className="p-4 rounded-xl bg-[#F5F6F3] border border-[#DDE1DE]">
              <span className="text-xs font-mono uppercase text-[#1769FF] font-bold block">{c.hub}</span>
              <span className="font-bold text-[#111111] text-sm mt-1 block">{c.name}</span>
              <span className="text-xs text-[#18A66A] font-mono mt-1 block font-semibold">{c.activeStudents} active students</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

