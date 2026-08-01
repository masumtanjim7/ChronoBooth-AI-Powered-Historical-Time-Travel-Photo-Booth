import React from "react";
import { Clock, History, Volume2, VolumeX, Sparkles, Camera } from "lucide-react";
import { sounds } from "../utils/sound";

interface NavbarProps {
  savedCount: number;
  onOpenGallery: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onNewSession: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  savedCount,
  onOpenGallery,
  soundEnabled,
  onToggleSound,
  onNewSession,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 px-4 py-3 sm:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div
          onClick={onNewSession}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 p-0.5 shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform duration-200">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
              <Camera className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400 bg-clip-text text-transparent font-serif tracking-wide">
                ChronoBooth
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
                <Sparkles className="w-3 h-3" /> Time Travel
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-sans hidden sm:block">
              AI Historical Photo Booth
            </p>
          </div>
        </div>

        {/* Status Badge & Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-300">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-zinc-400">TEMPORAL GRID:</span>
            <span className="font-semibold text-amber-300">ONLINE</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              sounds.enabled = !soundEnabled;
              onToggleSound();
            }}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-amber-300 hover:border-amber-500/40 transition-colors"
            title={soundEnabled ? "Mute Sound Effects" : "Enable Sound Effects"}
            aria-label="Toggle sound effects"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-zinc-500" />
            )}
          </button>

          {/* Time Journal / Gallery Button */}
          <button
            onClick={onOpenGallery}
            className="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 text-amber-200 hover:bg-amber-500/20 transition-all font-medium text-xs sm:text-sm"
          >
            <History className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Time Journal</span>
            {savedCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-zinc-950 font-bold text-xs">
                {savedCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
