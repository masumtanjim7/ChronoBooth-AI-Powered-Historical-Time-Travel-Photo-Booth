import React, { useState, useEffect, useRef } from "react";
import { TimeTravelResult, PhotoFrameType } from "../types";
import confetti from "canvas-confetti";
import {
  Download,
  Share2,
  BookmarkPlus,
  RefreshCw,
  Sparkles,
  Sliders,
  Award,
  BookOpen,
  Check,
  ShieldCheck,
  Camera,
  Layers,
  Zap,
} from "lucide-react";
import { sounds } from "../utils/sound";

interface ResultViewProps {
  result: TimeTravelResult;
  onSaveToJournal: (result: TimeTravelResult) => void;
  isSaved: boolean;
  onNewSession: () => void;
  onTweakPrompt: (customTweak: string) => void;
}

const FRAMES: { id: PhotoFrameType; name: string; icon: string }[] = [
  { id: "none", name: "Clean Photo", icon: "✨" },
  { id: "polaroid", name: "Vintage Polaroid", icon: "📸" },
  { id: "antique_gold", name: "Antique Gold", icon: "👑" },
  { id: "film_strip", name: "Film Strip", icon: "🎞️" },
  { id: "cyber_hud", name: "Cyber HUD", icon: "🤖" },
  { id: "renaissance", name: "Renaissance Wood", icon: "🪵" },
];

export const ResultView: React.FC<ResultViewProps> = ({
  result,
  onSaveToJournal,
  isSaved,
  onNewSession,
  onTweakPrompt,
}) => {
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [isComparing, setIsComparing] = useState<boolean>(true);
  const [selectedFrame, setSelectedFrame] = useState<PhotoFrameType>("none");
  const [activeTab, setActiveTab] = useState<"photo" | "passport">("photo");
  const [copied, setCopied] = useState<boolean>(false);
  const [tweakInput, setTweakInput] = useState<string>("");

  const imageContainerRef = useRef<HTMLDivElement | null>(null);

  // Trigger celebration confetti on mount
  useEffect(() => {
    sounds.playSuccessFanfare();
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#f59e0b", "#d97706", "#ec4899", "#3b82f6"],
      });
    } catch (e) {}
  }, []);

  // Handle Download Photo with Frame
  const handleDownload = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Dimensions
      const padding = selectedFrame === "polaroid" ? 60 : selectedFrame === "none" ? 0 : 40;
      const bottomPadding = selectedFrame === "polaroid" ? 140 : padding;

      canvas.width = img.width + padding * 2;
      canvas.height = img.height + padding + bottomPadding;

      // Draw Frame background
      if (selectedFrame === "polaroid") {
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (selectedFrame === "antique_gold") {
        ctx.fillStyle = "#271c0c";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "#d97706";
        ctx.lineWidth = 20;
        ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
      } else if (selectedFrame === "cyber_hud") {
        ctx.fillStyle = "#020617";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "#06b6d4";
        ctx.lineWidth = 8;
        ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
      } else if (selectedFrame === "film_strip") {
        ctx.fillStyle = "#09090b";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = "#18181b";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Draw Main Image
      ctx.drawImage(img, padding, padding, img.width, img.height);

      // Draw Polaroid text
      if (selectedFrame === "polaroid") {
        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 32px Georgia, serif";
        ctx.textAlign = "center";
        ctx.fillText(
          `${result.era.name} (${result.era.period})`,
          canvas.width / 2,
          canvas.height - 50
        );
      }

      // Export
      const link = document.createElement("a");
      link.download = `ChronoBooth-${result.era.id}-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = result.resultImage;
  };

  // Copy Image or Link
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-zinc-900/90 rounded-2xl border border-zinc-800 p-4 sm:p-6 shadow-2xl space-y-6">
      {/* Top Banner & Tab Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {result.era.yearDisplay}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-zinc-100">
              {result.era.name}
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Time Travel Transformation Complete • Rendered via Gemini AI
          </p>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
          <button
            onClick={() => setActiveTab("photo")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === "photo"
                ? "bg-amber-500 text-zinc-950 font-bold shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Time Portrait</span>
          </button>
          <button
            onClick={() => setActiveTab("passport")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === "passport"
                ? "bg-amber-500 text-zinc-950 font-bold shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Traveler Passport</span>
          </button>
        </div>
      </div>

      {activeTab === "photo" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Photo Display Frame */}
          <div className="lg:col-span-8 flex flex-col items-center">
            {/* Compare Toggle Header */}
            <div className="w-full max-w-lg flex items-center justify-between mb-3 text-xs text-zinc-400">
              <span className="flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                {isComparing ? "Drag slider to compare Original vs Era" : "Time Travel Portrait"}
              </span>
              <button
                onClick={() => setIsComparing(!isComparing)}
                className="text-amber-400 hover:underline font-medium"
              >
                {isComparing ? "View Result Only" : "Compare Original"}
              </button>
            </div>

            {/* Photo Frame Wrapper */}
            <div
              className={`relative max-w-lg w-full transition-all duration-300 ${
                selectedFrame === "polaroid"
                  ? "bg-slate-100 text-slate-900 p-4 pb-14 rounded-md shadow-2xl rotate-[-1deg]"
                  : selectedFrame === "antique_gold"
                  ? "p-5 bg-gradient-to-r from-amber-900 via-amber-700 to-amber-950 rounded-xl border-4 border-amber-500 shadow-2xl"
                  : selectedFrame === "cyber_hud"
                  ? "p-4 bg-slate-950 rounded-xl border-2 border-cyan-500 shadow-2xl shadow-cyan-500/20"
                  : selectedFrame === "film_strip"
                  ? "p-4 bg-zinc-950 rounded-xl border-x-8 border-dashed border-zinc-700 shadow-2xl"
                  : "rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl"
              }`}
            >
              <div
                ref={imageContainerRef}
                className="relative overflow-hidden aspect-square select-none rounded-lg bg-zinc-950"
              >
                {/* Result Image */}
                <img
                  src={result.resultImage}
                  alt={result.era.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />

                {/* Compare Overlay */}
                {isComparing && result.originalImage && (
                  <div
                    className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-amber-400 shadow-xl"
                    style={{ width: `${sliderPos}%` }}
                  >
                    <img
                      src={result.originalImage}
                      alt="Original"
                      className="absolute inset-0 w-full h-full object-cover max-w-none"
                      style={{ width: imageContainerRef.current?.clientWidth || "100%" }}
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-2 left-2 bg-zinc-950/80 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded border border-amber-500/30">
                      ORIGINAL
                    </span>
                  </div>
                )}

                {/* Slider Handle */}
                {isComparing && (
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderPos}
                    onChange={(e) => setSliderPos(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                  />
                )}
              </div>

              {/* Polaroid Handwritten Caption */}
              {selectedFrame === "polaroid" && (
                <div className="absolute bottom-3 left-0 right-0 text-center font-serif text-slate-800 text-sm font-bold tracking-wide">
                  {result.era.name} • {result.era.period}
                </div>
              )}
            </div>

            {/* Frame Selector Pills */}
            <div className="mt-5 w-full max-w-lg">
              <span className="text-[11px] font-semibold text-zinc-400 block mb-2">
                Select Photo Frame Style:
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {FRAMES.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFrame(f.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                      selectedFrame === f.id
                        ? "bg-amber-500 text-zinc-950 font-bold border-amber-500"
                        : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200"
                    }`}
                  >
                    <span>{f.icon}</span>
                    <span>{f.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Controls Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            {/* Quick Action Buttons */}
            <div className="p-4 bg-zinc-950/80 rounded-xl border border-zinc-800 space-y-3">
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Action Options
              </h3>

              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 font-bold text-xs sm:text-sm shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Framed Photo</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onSaveToJournal(result)}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                    isSaved
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-amber-500/40"
                  }`}
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>{isSaved ? "Saved!" : "Save Journal"}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 text-zinc-300 border border-zinc-700 hover:border-amber-500/40 text-xs font-semibold transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied!" : "Share Link"}</span>
                </button>
              </div>

              <button
                onClick={onNewSession}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-medium transition-colors"
              >
                <Camera className="w-3.5 h-3.5 text-amber-400" />
                <span>Take Another Photo / Jump Era</span>
              </button>
            </div>

            {/* Prompt Adjustment Form */}
            <div className="p-4 bg-zinc-950/80 rounded-xl border border-zinc-800 space-y-2.5">
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Tweak & Re-render Image:</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Add a crown, change background lighting..."
                value={tweakInput}
                onChange={(e) => setTweakInput(e.target.value)}
                className="w-full bg-zinc-900 text-zinc-200 text-xs px-3 py-2 rounded-lg border border-zinc-800 focus:border-amber-500 focus:outline-none"
              />
              <button
                onClick={() => {
                  if (tweakInput.trim()) {
                    onTweakPrompt(tweakInput);
                  }
                }}
                disabled={!tweakInput.trim()}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/40 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-render with Adjustment</span>
              </button>
            </div>

            {/* Face Analysis Badge */}
            {result.faceAnalysis && (
              <div className="p-3 bg-zinc-950/50 rounded-xl border border-zinc-800/80 text-[11px] text-zinc-400 leading-relaxed">
                <span className="font-semibold text-amber-400 block mb-1">
                  🔍 AI Facial Feature Preservation Note:
                </span>
                {result.faceAnalysis}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Passport ID Card View */
        <div className="max-w-2xl mx-auto space-y-6">
          {result.passportCard ? (
            <div className="bg-gradient-to-br from-amber-950/80 via-zinc-950 to-stone-950 border-2 border-amber-500/50 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              {/* Watermark Logo */}
              <div className="absolute top-4 right-4 text-amber-500/10 font-serif font-extrabold text-6xl select-none pointer-events-none">
                PASSPORT
              </div>

              {/* Passport Header */}
              <div className="flex items-center justify-between border-b border-amber-500/30 pb-4 mb-6">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-amber-400/80 uppercase block">
                    INTERDIMENSIONAL TEMPORAL AUTHORITY
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold font-serif text-amber-200">
                    {result.passportCard.alias || "Chronos Voyager"}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold">
                    {result.passportCard.year}
                  </span>
                </div>
              </div>

              {/* Passport Main Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                {/* Photo Portrait */}
                <div className="sm:col-span-1">
                  <div className="aspect-[3/4] rounded-xl overflow-hidden border-2 border-amber-500/60 shadow-lg">
                    <img
                      src={result.resultImage}
                      alt="Passport Portrait"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                {/* Particulars */}
                <div className="sm:col-span-2 space-y-3 text-xs">
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-mono">Assigned Role:</span>
                    <span className="font-semibold text-zinc-100">{result.passportCard.assignedRole}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-mono">Location:</span>
                    <span className="font-semibold text-amber-300">{result.passportCard.location}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-mono">Garments:</span>
                    <span className="text-zinc-300">{result.passportCard.outfitDescription}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-mono">Survival Score:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-800">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full"
                          style={{ width: `${result.passportCard.survivalScore || 85}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-emerald-400">
                        {result.passportCard.survivalScore}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Survival Tip */}
              {result.passportCard.survivalTip && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-200 mb-6 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Temporal Survival Tip:</span>
                    <span>{result.passportCard.survivalTip}</span>
                  </div>
                </div>
              )}

              {/* Historical Facts */}
              {result.passportCard.historicalFacts && result.passportCard.historicalFacts.length > 0 && (
                <div className="space-y-2 border-t border-amber-500/30 pt-4">
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" /> Era Records & Historical Context
                  </h4>
                  <ul className="space-y-1.5 text-xs text-zinc-300">
                    {result.passportCard.historicalFacts.map((fact, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Motto Quote */}
              {result.passportCard.quote && (
                <div className="mt-6 pt-4 border-t border-zinc-800 text-center italic text-xs text-amber-300/80 font-serif">
                  "{result.passportCard.quote}"
                </div>
              )}
            </div>
          ) : (
            <div className="text-center p-8 bg-zinc-950 rounded-xl text-zinc-400 text-xs">
              Passport details generated along with your time jump!
            </div>
          )}
        </div>
      )}
    </div>
  );
};
