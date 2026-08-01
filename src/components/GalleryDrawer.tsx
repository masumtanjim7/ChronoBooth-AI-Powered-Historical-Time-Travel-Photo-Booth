import React from "react";
import { TimeTravelResult } from "../types";
import { X, Trash2, Calendar, Download, Eye, Sparkles, History } from "lucide-react";

interface GalleryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedResults: TimeTravelResult[];
  onSelectResult: (result: TimeTravelResult) => void;
  onDeleteResult: (id: string) => void;
  onClearAll: () => void;
}

export const GalleryDrawer: React.FC<GalleryDrawerProps> = ({
  isOpen,
  onClose,
  savedResults,
  onSelectResult,
  onDeleteResult,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-md bg-zinc-950 border-l border-zinc-800 h-full flex flex-col p-4 sm:p-6 shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-zinc-100 font-serif">Time Journal</h2>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs">
              {savedResults.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Saved List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {savedResults.length === 0 ? (
            <div className="text-center py-16 text-zinc-500 space-y-3">
              <History className="w-12 h-12 mx-auto text-zinc-700" />
              <p className="text-sm">Your time journal is currently empty.</p>
              <p className="text-xs text-zinc-600 max-w-xs mx-auto">
                Snap or upload a photo, travel to any era, and click "Save Journal" to bookmark your favorite historical transformations!
              </p>
            </div>
          ) : (
            savedResults.map((item) => (
              <div
                key={item.id}
                className="group relative flex items-center gap-3 p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/50 transition-all cursor-pointer"
                onClick={() => {
                  onSelectResult(item);
                  onClose();
                }}
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-zinc-700 bg-zinc-950">
                  <img
                    src={item.resultImage}
                    alt={item.era.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Meta Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs font-bold text-zinc-200 truncate group-hover:text-amber-300">
                      {item.era.name}
                    </h4>
                    <span className="text-[10px] font-mono text-amber-400 font-semibold">
                      {item.era.period}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                    {item.passportCard?.alias || "Time Traveler"}
                  </p>
                  <span className="text-[9px] text-zinc-600 block mt-1 font-mono">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteResult(item.id);
                    }}
                    className="p-1.5 rounded-lg hover:bg-rose-500/20 text-zinc-500 hover:text-rose-400 transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        {savedResults.length > 0 && (
          <div className="pt-4 border-t border-zinc-800 mt-4">
            <button
              onClick={onClearAll}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-rose-950/30 text-zinc-400 hover:text-rose-300 text-xs font-medium border border-zinc-800 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Journal History</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
