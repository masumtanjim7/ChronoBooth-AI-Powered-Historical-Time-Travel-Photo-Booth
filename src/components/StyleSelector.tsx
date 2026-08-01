import React from "react";
import { ImageStyle } from "../types";
import { Palette, Maximize2, Sparkles, Layers } from "lucide-react";

interface StyleSelectorProps {
  selectedStyle: ImageStyle;
  onSelectStyle: (style: ImageStyle) => void;
  aspectRatio: string;
  onChangeAspectRatio: (ratio: string) => void;
}

const STYLES: { id: ImageStyle; name: string; desc: string; icon: string }[] = [
  { id: "photorealistic", name: "Photorealistic", desc: "Authentic camera photo with period lighting", icon: "📷" },
  { id: "oil_painting", name: "Classic Oil Painting", desc: "Master museum canvas with fine brushstrokes", icon: "🎨" },
  { id: "vintage_polaroid", name: "Vintage Polaroid", desc: "1970s film photo with analog color grain", icon: "🖼️" },
  { id: "steampunk", name: "Steampunk Brass", desc: "Warm sepia, clockwork gears & steam aesthetics", icon: "⚙️" },
  { id: "cyberpunk", name: "Cyberpunk Glow", desc: "Vibrant neon lighting with holographic HUDs", icon: "⚡" },
  { id: "comic_book", name: "Graphic Novel", desc: "Bold ink linework and cel-shaded coloring", icon: "🗯️" },
];

const ASPECT_RATIOS = [
  { id: "1:1", name: "Square", desc: "1:1", icon: "w-4 h-4" },
  { id: "3:4", name: "Portrait", desc: "3:4", icon: "w-3 h-4" },
  { id: "16:9", name: "Widescreen", desc: "16:9", icon: "w-5 h-3" },
];

export const StyleSelector: React.FC<StyleSelectorProps> = ({
  selectedStyle,
  onSelectStyle,
  aspectRatio,
  onChangeAspectRatio,
}) => {
  return (
    <div className="w-full bg-zinc-900/80 rounded-2xl border border-zinc-800 p-4 sm:p-6 shadow-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2 font-serif">
          <Palette className="w-4 h-4 text-amber-400" />
          <span>Step 3: Art Style & Photo Framing</span>
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {STYLES.map((st) => {
          const isSelected = selectedStyle === st.id;
          return (
            <button
              key={st.id}
              onClick={() => onSelectStyle(st.id)}
              className={`flex items-start gap-3 p-2.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? "bg-amber-500/10 border-amber-500 text-amber-200 shadow-md shadow-amber-500/10"
                  : "bg-zinc-950/70 border-zinc-800 hover:border-zinc-700 text-zinc-400"
              }`}
            >
              <span className="text-xl select-none">{st.icon}</span>
              <div>
                <div className="text-xs font-bold text-zinc-200 flex items-center gap-1">
                  <span>{st.name}</span>
                  {isSelected && <Sparkles className="w-3 h-3 text-amber-400" />}
                </div>
                <p className="text-[10px] text-zinc-500 leading-tight mt-0.5">{st.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Aspect Ratio Selector */}
      <div className="flex items-center gap-3 pt-2 border-t border-zinc-800/80">
        <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1">
          <Maximize2 className="w-3.5 h-3.5 text-amber-400" /> Aspect Ratio:
        </span>
        <div className="flex items-center gap-2">
          {ASPECT_RATIOS.map((ar) => (
            <button
              key={ar.id}
              onClick={() => onChangeAspectRatio(ar.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                aspectRatio === ar.id
                  ? "bg-amber-500 text-zinc-950 font-bold border-amber-500"
                  : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200"
              }`}
            >
              <span>{ar.name}</span>
              <span className="text-[10px] opacity-75 font-mono">({ar.desc})</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
