import React, { useState } from "react";
import { Era } from "../types";
import { HISTORICAL_ERAS } from "../data/eras";
import { Search, Sparkles, Shuffle, Calendar, Compass, MapPin, Zap } from "lucide-react";

interface EraSelectorProps {
  selectedEra: Era;
  onSelectEra: (era: Era) => void;
  customPrompt: string;
  onChangeCustomPrompt: (val: string) => void;
}

const CATEGORIES = [
  { id: "all", label: "All Eras" },
  { id: "ancient", label: "Ancient World" },
  { id: "medieval", label: "Medieval & Kings" },
  { id: "retro", label: "Retro 20th Century" },
  { id: "future", label: "Sci-Fi Future" },
  { id: "fantasy", label: "Myths & Steampunk" },
];

export const EraSelector: React.FC<EraSelectorProps> = ({
  selectedEra,
  onSelectEra,
  customPrompt,
  onChangeCustomPrompt,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredEras = HISTORICAL_ERAS.filter((era) => {
    const matchesCategory = activeCategory === "all" || era.category === activeCategory;
    const matchesSearch =
      era.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      era.period.toLowerCase().includes(searchQuery.toLowerCase()) ||
      era.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleRandomEra = () => {
    const random = HISTORICAL_ERAS[Math.floor(Math.random() * HISTORICAL_ERAS.length)];
    onSelectEra(random);
  };

  return (
    <div className="w-full bg-zinc-900/80 rounded-2xl border border-zinc-800 p-4 sm:p-6 shadow-2xl space-y-5">
      {/* Header & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2 font-serif">
            <Compass className="w-5 h-5 text-amber-400" />
            <span>Step 2: Choose Historical Destination</span>
          </h2>
          <p className="text-xs text-zinc-400">
            Select an era or enter your own custom time warp coordinates below.
          </p>
        </div>

        <button
          onClick={handleRandomEra}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30 transition-colors"
        >
          <Shuffle className="w-3.5 h-3.5 text-amber-400" />
          <span>Surprise Time Jump</span>
        </button>
      </div>

      {/* Category Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? "bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20"
                  : "bg-zinc-950/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search era or year..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 text-zinc-200 text-xs pl-8 pr-3 py-1.5 rounded-xl border border-zinc-800 focus:border-amber-500/60 focus:outline-none"
          />
        </div>
      </div>

      {/* Era Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[380px] overflow-y-auto pr-1">
        {filteredEras.map((era) => {
          const isSelected = selectedEra.id === era.id;
          return (
            <div
              key={era.id}
              onClick={() => onSelectEra(era)}
              className={`group relative rounded-xl border p-3 cursor-pointer transition-all duration-200 flex flex-col justify-between select-none ${
                isSelected
                  ? "bg-gradient-to-br from-amber-950/60 via-zinc-900 to-zinc-900 border-amber-500 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/40"
                  : "bg-zinc-950/70 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60"
              }`}
            >
              <div>
                {/* Era Header */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-amber-400 font-serif group-hover:text-amber-300">
                    {era.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-700 text-[10px] font-mono text-zinc-300 font-semibold">
                    {era.yearDisplay}
                  </span>
                </div>

                {/* Description */}
                <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed mb-3">
                  {era.description}
                </p>
              </div>

              {/* Card Footer */}
              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500">
                <span className="truncate max-w-[140px] text-zinc-400">
                  👔 {era.sampleOutfit}
                </span>
                {isSelected && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-500 text-zinc-950 font-bold text-[9px] uppercase tracking-wider">
                    Selected
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Warp Prompt Input */}
      <div className="p-3 bg-zinc-950/90 rounded-xl border border-zinc-800/90 space-y-2">
        <label className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Custom Directives or Alternate Time Warp (Optional):</span>
        </label>
        <input
          type="text"
          value={customPrompt}
          onChange={(e) => onChangeCustomPrompt(e.target.value)}
          placeholder={`e.g., "Add a glowing gold crown, make me holding a golden goblet in ${selectedEra.name}"`}
          className="w-full bg-zinc-900 text-zinc-200 text-xs px-3 py-2 rounded-lg border border-zinc-800 focus:border-amber-500 focus:outline-none placeholder:text-zinc-600"
        />
      </div>
    </div>
  );
};
