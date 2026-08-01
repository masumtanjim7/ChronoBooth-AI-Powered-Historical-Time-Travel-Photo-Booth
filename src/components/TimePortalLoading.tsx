import React, { useState, useEffect } from "react";
import { Era } from "../types";
import { Compass, Sparkles, Clock, ShieldAlert } from "lucide-react";

interface TimePortalLoadingProps {
  era: Era;
}

const HISTORICAL_LOGS = [
  "Initializing quantum time portal continuum...",
  "Scanning facial topology & facial landmarks...",
  "Calculating temporal jump coordinates...",
  "Weaving period-accurate authentic fabrics...",
  "Distorting ambient illumination & shadow depth...",
  "Aligning background architecture with era records...",
  "Generating Time Traveler Identity Passport...",
  "Finalizing time jump rendering...",
];

export const TimePortalLoading: React.FC<TimePortalLoadingProps> = ({ era }) => {
  const [logIndex, setLogIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogIndex((prev) => (prev + 1) % HISTORICAL_LOGS.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-zinc-950/90 rounded-2xl border border-amber-500/40 p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[420px]">
      {/* Background Animated Glowing Vortex Rings */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
        <div className="w-96 h-96 rounded-full border border-amber-500/40 animate-ping" />
        <div className="absolute w-72 h-72 rounded-full border-2 border-dashed border-orange-500/60 animate-spin" style={{ animationDuration: '10s' }} />
        <div className="absolute w-48 h-48 rounded-full border border-yellow-400/80 animate-spin" style={{ animationDuration: '5s' }} />
      </div>

      {/* Center Quantum Clock Icon */}
      <div className="relative z-10 mb-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 p-0.5 shadow-2xl shadow-orange-500/30 animate-pulse">
          <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
            <Clock className="w-10 h-10 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
          </div>
        </div>
      </div>

      {/* Target Era Banner */}
      <div className="relative z-10 mb-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-widest mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Warping to {era.yearDisplay}
        </span>
        <h3 className="text-2xl sm:text-3xl font-extrabold font-serif text-zinc-100 bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400 bg-clip-text text-transparent">
          {era.name}
        </h3>
      </div>

      {/* Live Log Stream */}
      <div className="relative z-10 max-w-md w-full bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 mb-6">
        <p className="text-xs font-mono text-amber-300 animate-pulse flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          {HISTORICAL_LOGS[logIndex]}
        </p>
      </div>

      <p className="relative z-10 text-xs text-zinc-500 max-w-xs leading-relaxed">
        Gemini AI is processing your portrait features and crafting a high-fidelity historical masterpiece.
      </p>
    </div>
  );
};
