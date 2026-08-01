import React, { useRef, useState, useEffect } from "react";
import { Camera, Upload, RefreshCw, Sparkles, AlertCircle, Image as ImageIcon, CheckCircle2, User, SwitchCamera } from "lucide-react";
import { sounds } from "../utils/sound";

interface CameraBoothProps {
  capturedImage: string | null;
  onCapture: (imageDataUrl: string) => void;
  onClear: () => void;
}

// Built-in portrait presets for instant time travel testing without webcam
const SAMPLE_PORTRAITS = [
  {
    id: "sample-1",
    name: "Alex",
    label: "Man in Jacket",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "sample-2",
    name: "Maya",
    label: "Woman Portrait",
    url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "sample-3",
    name: "Leo",
    label: "Bearded Portrait",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "sample-4",
    name: "Elena",
    label: "Smile Portrait",
    url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
  },
];

export const CameraBooth: React.FC<CameraBoothProps> = ({
  capturedImage,
  onCapture,
  onClear,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [isMirrored, setIsMirrored] = useState<boolean>(true);
  const [mode, setMode] = useState<"camera" | "upload">("camera");

  // Camera Devices
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");

  // Start webcam stream
  const startCamera = async (deviceId?: string) => {
    setCameraError(null);
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId }, width: { ideal: 1280 }, height: { ideal: 960 } }
          : { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } },
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Enumerate devices
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevs = allDevices.filter((d) => d.kind === "videoinput");
      setDevices(videoDevs);
    } catch (err: any) {
      console.warn("Camera start failed:", err);
      setCameraActive(false);
      setCameraError(
        err.name === "NotAllowedError"
          ? "Camera permission denied. You can upload a photo or select a preset model below!"
          : "Webcam unavailable. Upload a photo or pick a sample portrait to begin."
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (mode === "camera" && !capturedImage) {
      startCamera(selectedDeviceId);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [mode, capturedImage, selectedDeviceId]);

  // Handle shutter snap with countdown & flash
  const triggerSnap = () => {
    if (countdown !== null) return;

    let count = 3;
    setCountdown(count);
    sounds.playCountdownBeep(false);

    const timer = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
        sounds.playCountdownBeep(false);
      } else {
        clearInterval(timer);
        setCountdown(null);
        sounds.playCountdownBeep(true);
        sounds.playShutter();

        // Flash Effect
        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 250);

        // Capture frame from canvas
        if (videoRef.current && canvasRef.current) {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;

          const ctx = canvas.getContext("2d");
          if (ctx) {
            if (isMirrored) {
              ctx.translate(canvas.width, 0);
              ctx.scale(-1, 1);
            }
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
            onCapture(dataUrl);
            stopCamera();
          }
        }
      }
    }, 1000);
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        sounds.playShutter();
        onCapture(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Drag & Drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          sounds.playShutter();
          onCapture(dataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Sample Preset Selection
  const handlePresetSelect = async (presetUrl: string) => {
    sounds.playShutter();
    // Fetch preset and convert to base64
    try {
      const res = await fetch(presetUrl);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        onCapture(reader.result as string);
      };
      reader.readAsDataURL(blob);
    } catch (e) {
      onCapture(presetUrl);
    }
  };

  return (
    <div className="w-full bg-zinc-900/80 rounded-2xl border border-zinc-800 p-4 sm:p-6 shadow-2xl relative overflow-hidden">
      {/* Flash overlay */}
      {isFlashing && (
        <div className="absolute inset-0 bg-white z-50 animate-ping opacity-90 pointer-events-none" />
      )}

      {/* Hidden canvas for video captures */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Header Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2 font-serif">
            <Camera className="w-5 h-5 text-amber-400" />
            <span>Step 1: Capture Your Photo</span>
          </h2>
          <p className="text-xs text-zinc-400">
            For best results, look straight ahead with clear lighting.
          </p>
        </div>

        {/* Input Mode Selector */}
        {!capturedImage && (
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
            <button
              onClick={() => setMode("camera")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                mode === "camera"
                  ? "bg-amber-500 text-zinc-950 font-bold shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Webcam</span>
            </button>
            <button
              onClick={() => setMode("upload")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                mode === "upload"
                  ? "bg-amber-500 text-zinc-950 font-bold shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload / Samples</span>
            </button>
          </div>
        )}
      </div>

      {/* Captured Image Display */}
      {capturedImage ? (
        <div className="relative rounded-xl overflow-hidden bg-black border border-amber-500/40 aspect-[4/3] max-w-md mx-auto group">
          <img
            src={capturedImage}
            alt="Original Selfie"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 flex flex-col justify-end p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" /> Face Ready for Time Jump
              </div>
              <button
                onClick={onClear}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                <span>Retake Photo</span>
              </button>
            </div>
          </div>
        </div>
      ) : mode === "camera" ? (
        /* Camera Stream View */
        <div className="relative rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 aspect-[4/3] max-w-lg mx-auto flex items-center justify-center">
          {cameraActive ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${
                  isMirrored ? "scale-x-[-1]" : ""
                }`}
              />

              {/* Facial Alignment Overlay Guide */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-40">
                <div className="w-48 h-64 border-2 border-dashed border-amber-400/80 rounded-[50%] flex items-center justify-center">
                  <span className="text-[10px] text-amber-300 bg-zinc-950/80 px-2 py-0.5 rounded-full font-mono uppercase tracking-widest">
                    Align Face
                  </span>
                </div>
              </div>

              {/* Countdown overlay */}
              {countdown !== null && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-20">
                  <div className="text-7xl font-extrabold text-amber-400 font-serif animate-bounce">
                    {countdown}
                  </div>
                </div>
              )}

              {/* Camera Controls Bar */}
              <div className="absolute bottom-3 inset-x-3 flex items-center justify-between bg-zinc-950/80 backdrop-blur-md p-2 rounded-xl border border-zinc-800/80">
                <button
                  onClick={() => setIsMirrored(!isMirrored)}
                  className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs flex items-center gap-1 border border-zinc-700"
                  title="Toggle Mirror view"
                >
                  <SwitchCamera className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Flip</span>
                </button>

                {/* Shutter Snap Button */}
                <button
                  onClick={triggerSnap}
                  disabled={countdown !== null}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-zinc-950 font-bold text-sm shadow-lg shadow-orange-500/25 hover:scale-105 active:scale-95 transition-all"
                >
                  <Camera className="w-4 h-4 fill-zinc-950" />
                  <span>Snap Photo (3s)</span>
                </button>

                {devices.length > 1 && (
                  <select
                    value={selectedDeviceId}
                    onChange={(e) => setSelectedDeviceId(e.target.value)}
                    className="bg-zinc-900 text-zinc-300 text-xs px-2 py-1.5 rounded-lg border border-zinc-700"
                  >
                    {devices.map((d, idx) => (
                      <option key={d.deviceId} value={d.deviceId}>
                        {d.label || `Camera ${idx + 1}`}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </>
          ) : (
            /* Camera Unavailable / Error State */
            <div className="p-6 text-center max-w-sm">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
              <p className="text-sm text-zinc-300 mb-4">{cameraError || "Initializing webcam..."}</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  onClick={() => startCamera()}
                  className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/40"
                >
                  Retry Camera
                </button>
                <button
                  onClick={() => setMode("upload")}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700"
                >
                  Use Photo Upload / Samples
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Upload & Preset Selector View */
        <div className="space-y-4 max-w-lg mx-auto">
          {/* Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-zinc-700 hover:border-amber-500/60 rounded-xl p-6 text-center bg-zinc-950/60 transition-colors cursor-pointer relative group"
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <Upload className="w-8 h-8 text-amber-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-semibold text-zinc-200">
              Drag & Drop your photo here, or <span className="text-amber-400 underline">browse</span>
            </p>
            <p className="text-xs text-zinc-500 mt-1">Supports JPG, PNG, WEBP (Clear portrait photo recommended)</p>
          </div>

          {/* Sample Presets */}
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-400" />
              Or Test Instant Time Travel with Sample Models:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {SAMPLE_PORTRAITS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handlePresetSelect(p.url)}
                  className="group relative rounded-xl overflow-hidden border border-zinc-800 hover:border-amber-500/80 transition-all text-left aspect-square"
                >
                  <img
                    src={p.url}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-90 flex items-end p-2">
                    <span className="text-xs font-bold text-zinc-100 group-hover:text-amber-300">
                      {p.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
