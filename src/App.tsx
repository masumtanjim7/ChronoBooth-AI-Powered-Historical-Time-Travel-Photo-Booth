import React, { useState, useEffect } from "react";
import { Era, TimeTravelResult, ImageStyle } from "./types";
import { HISTORICAL_ERAS } from "./data/eras";
import { Navbar } from "./components/Navbar";
import { CameraBooth } from "./components/CameraBooth";
import { EraSelector } from "./components/EraSelector";
import { StyleSelector } from "./components/StyleSelector";
import { TimePortalLoading } from "./components/TimePortalLoading";
import { ResultView } from "./components/ResultView";
import { GalleryDrawer } from "./components/GalleryDrawer";
import { sounds } from "./utils/sound";
import {
  Sparkles,
  Zap,
  RotateCcw,
  AlertCircle,
  Clock,
  Compass,
  ArrowRight,
} from "lucide-react";

export default function App() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedEra, setSelectedEra] = useState<Era>(HISTORICAL_ERAS[0]);
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>("photorealistic");
  const [aspectRatio, setAspectRatio] = useState<string>("1:1");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<TimeTravelResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Journal Persistence
  const [savedJournal, setSavedJournal] = useState<TimeTravelResult[]>(() => {
    try {
      const stored = localStorage.getItem("chronobooth_journal");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Persist Journal
  useEffect(() => {
    try {
      localStorage.setItem("chronobooth_journal", JSON.stringify(savedJournal));
    } catch (e) {}
  }, [savedJournal]);

  // Handle Initiating Time Jump
  const handleStartTravel = async () => {
    if (!capturedImage) {
      setErrorMessage("Please capture or upload a photo first!");
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);
    sounds.playTimePortalWarp();

    try {
      const response = await fetch("/api/time-travel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userImage: capturedImage,
          era: selectedEra,
          customPrompt,
          style: selectedStyle,
          aspectRatio,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Time travel warp calculation failed. Please try again.");
      }

      const newResult: TimeTravelResult = {
        id: `travel-${Date.now()}`,
        originalImage: capturedImage,
        resultImage: data.resultImage,
        era: selectedEra,
        customPrompt,
        style: selectedStyle,
        aspectRatio,
        faceAnalysis: data.faceAnalysis,
        passportCard: data.passportCard,
        timestamp: new Date().toISOString(),
      };

      setResult(newResult);
    } catch (err: any) {
      console.error("Time travel error:", err);
      setErrorMessage(
        err.message || "Temporal portal connection interrupted. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Re-run with prompt tweak
  const handleTweakPrompt = async (tweakText: string) => {
    setCustomPrompt(tweakText);
    if (!capturedImage && result?.originalImage) {
      setCapturedImage(result.originalImage);
    }
    setResult(null);

    // Trigger re-travel
    setTimeout(() => {
      handleStartTravel();
    }, 100);
  };

  // Save/Unsave Journal item
  const handleSaveToJournal = (itemToSave: TimeTravelResult) => {
    setSavedJournal((prev) => {
      const exists = prev.some((x) => x.id === itemToSave.id);
      if (exists) {
        return prev.filter((x) => x.id !== itemToSave.id);
      } else {
        return [itemToSave, ...prev];
      }
    });
  };

  // Reset Session
  const handleNewSession = () => {
    setCapturedImage(null);
    setResult(null);
    setErrorMessage(null);
    setCustomPrompt("");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-zinc-950 antialiased">
      {/* Top Header Navigation */}
      <Navbar
        savedCount={savedJournal.length}
        onOpenGallery={() => setIsGalleryOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onNewSession={handleNewSession}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-8 space-y-6">
        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="bg-rose-950/80 border border-rose-500/50 rounded-2xl p-4 text-rose-200 text-xs sm:text-sm flex items-start gap-3 shadow-lg animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block mb-0.5">Time Portal Warning</span>
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-rose-200 text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {isLoading ? (
          /* Time Portal Loading wormhole */
          <TimePortalLoading era={selectedEra} />
        ) : result ? (
          /* Result & Comparison View */
          <ResultView
            result={result}
            onSaveToJournal={handleSaveToJournal}
            isSaved={savedJournal.some((x) => x.id === result.id)}
            onNewSession={handleNewSession}
            onTweakPrompt={handleTweakPrompt}
          />
        ) : (
          /* Main Booth Controls Workspace */
          <div className="space-y-6">
            {/* Step 1: Camera & Photo Input */}
            <CameraBooth
              capturedImage={capturedImage}
              onCapture={(img) => {
                setCapturedImage(img);
                setErrorMessage(null);
              }}
              onClear={() => setCapturedImage(null)}
            />

            {/* Step 2: Historical Era Destination Selection */}
            <EraSelector
              selectedEra={selectedEra}
              onSelectEra={(era) => setSelectedEra(era)}
              customPrompt={customPrompt}
              onChangeCustomPrompt={setCustomPrompt}
            />

            {/* Step 3: Art Style & Framing Options */}
            <StyleSelector
              selectedStyle={selectedStyle}
              onSelectStyle={setSelectedStyle}
              aspectRatio={aspectRatio}
              onChangeAspectRatio={setAspectRatio}
            />

            {/* Launch Time Warp Button */}
            <div className="pt-2 flex justify-center">
              <button
                onClick={handleStartTravel}
                disabled={!capturedImage}
                className={`w-full max-w-md flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 shadow-2xl ${
                  capturedImage
                    ? "bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-zinc-950 shadow-orange-500/25 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    : "bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed opacity-60"
                }`}
              >
                <Sparkles className="w-5 h-5 fill-zinc-950" />
                <span>Travel to {selectedEra.name}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Gallery Side Drawer */}
      <GalleryDrawer
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        savedResults={savedJournal}
        onSelectResult={(selected) => {
          setResult(selected);
          setCapturedImage(selected.originalImage);
        }}
        onDeleteResult={(id) => {
          setSavedJournal((prev) => prev.filter((x) => x.id !== id));
        }}
        onClearAll={() => {
          setSavedJournal([]);
        }}
      />

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-6 text-center text-xs text-zinc-600">
        <p>ChronoBooth • AI-Powered Historical Photo Booth • Powered by Gemini AI</p>
      </footer>
    </div>
  );
}
