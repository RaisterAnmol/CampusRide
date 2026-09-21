import React, { useState } from 'react';
import { IMatchResult } from '../types';
import { Sparkles, ChevronDown, ChevronUp, MapPin, Clock, Navigation, CheckCircle2 } from 'lucide-react';

import { AnimatedNumber } from './common/AnimatedNumber';

interface MatchScoreBadgeProps {
  match?: IMatchResult;
  showBreakdown?: boolean;
}

export const MatchScoreBadge: React.FC<MatchScoreBadgeProps> = ({ match, showBreakdown = false }) => {
  const [expanded, setExpanded] = useState(false);

  if (!match) return null;

  const pct = match.percentage;

  // Visual color coding
  let badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  let barColor = 'bg-emerald-500';
  if (pct < 60) {
    badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
    barColor = 'bg-amber-500';
  } else if (pct < 80) {
    badgeColor = 'bg-[#E8F4F0] text-[#143D32] border-[#20594B]/30';
    barColor = 'bg-[#143D32]';
  }

  return (
    <div className="inline-block text-left">
      <div
        onClick={() => setExpanded(!expanded)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border cursor-pointer select-none transition-all shadow-sm ${badgeColor}`}
        title="Click to view AI Route & Time match score breakdown"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <AnimatedNumber value={pct} suffix="% Match" />
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </div>

      {(expanded || showBreakdown) && (
        <div className="mt-2 p-3 bg-white rounded-lg border border-slate-200 shadow-lg text-xs space-y-2.5 w-64">
          <div className="flex items-center justify-between font-semibold text-slate-800 border-b pb-1.5">
            <span>Algorithm Breakdown</span>
            <span className="text-emerald-600 font-bold">{pct}% Total</span>
          </div>

          {/* Route Overlap (50%) */}
          <div className="space-y-1">
            <div className="flex justify-between text-slate-600">
              <span className="flex items-center gap-1">
                <Navigation className="w-3 h-3 text-emerald-500" /> Route Overlap (50%)
              </span>
              <span className="font-medium">{Math.round(match.breakdown.routeOverlap * 100)}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full"
                style={{ width: `${match.breakdown.routeOverlap * 100}%` }}
              />
            </div>
          </div>

          {/* Time Match (30%) */}
          <div className="space-y-1">
            <div className="flex justify-between text-slate-600">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-blue-500" /> Time Match (30%)
              </span>
              <span className="font-medium">{Math.round(match.breakdown.timeMatch * 100)}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-500 h-1.5 rounded-full"
                style={{ width: `${match.breakdown.timeMatch * 100}%` }}
              />
            </div>
          </div>

          {/* Pickup Proximity (15%) */}
          <div className="space-y-1">
            <div className="flex justify-between text-slate-600">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-indigo-500" /> Pickup Proximity (15%)
              </span>
              <span className="font-medium">
                {Math.round(match.breakdown.pickupProximity * 100)}% ({match.breakdown.pickupDistanceKm.toFixed(1)} km)
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-indigo-500 h-1.5 rounded-full"
                style={{ width: `${match.breakdown.pickupProximity * 100}%` }}
              />
            </div>
          </div>

          {/* Seat Bonus (5%) */}
          <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-slate-100">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Seat Capacity Bonus
            </span>
            <span className="font-medium text-emerald-600">+5%</span>
          </div>

          <div className="text-[10px] text-slate-400 italic pt-1">
            Detour distance: {match.breakdown.detourDistanceKm.toFixed(2)} km
          </div>
        </div>
      )}
    </div>
  );
};

