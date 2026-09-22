import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Camera,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  Upload,
  UserCheck,
} from "lucide-react";

interface SelfieCaptureResult {
  file: File;
  previewUrl: string;
  embedding?: number[];
  qualityScore: number;
}

interface SelfieCaptureProps {
  onCapture: (result: SelfieCaptureResult | null) => void;
  disabled?: boolean;
}

export const SelfieCapture: React.FC<SelfieCaptureProps> = ({
  onCapture,
  disabled = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);

  // Human AI instance & state
  const humanRef = useRef<any>(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [faceStatus, setFaceStatus] = useState<
    "NO_FACE" | "MULTIPLE_FACES" | "TOO_FAR" | "GOOD" | "PROCESSING"
  >("NO_FACE");
  const [qualityScore, setQualityScore] = useState<number>(0);
  const [capturedData, setCapturedData] = useState<SelfieCaptureResult | null>(null);

  // Initialize Human AI instance lazily
  const initHuman = useCallback(async () => {
    if (humanRef.current) return humanRef.current;
    try {
      setIsModelLoading(true);
      const humanModule = await import("@vladmandic/human");
      const HumanClass = humanModule.default || humanModule.Human;
      const human = new HumanClass({
        backend: "webgl",
        modelBasePath: "https://vladmandic.github.io/human-models/models/",
        face: {
          enabled: true,
          detector: { enabled: true, rotation: true },
          description: { enabled: true },
          iris: { enabled: false },
          emotion: { enabled: false },
          gear: { enabled: false },
          antispoof: { enabled: false },
          liveness: { enabled: false },
        },
        body: { enabled: false },
        hand: { enabled: false },
        object: { enabled: false },
        gesture: { enabled: false },
      });
      await human.load();
      humanRef.current = human;
      return human;
    } catch (err) {
      console.warn("[SelfieCapture] Human AI initialization warning:", err);
      return null;
    } finally {
      setIsModelLoading(false);
    }
  }, []);

  // Real-time detection loop
  useEffect(() => {
    let animationFrameId: number;
    let isActive = true;

    const detectLoop = async () => {
      if (
        isActive &&
        isCameraActive &&
        videoRef.current &&
        videoRef.current.readyState >= 2 &&
        humanRef.current
      ) {
        try {
          const result = await humanRef.current.detect(videoRef.current);
          if (result && result.face) {
            const faces = result.face;
            if (faces.length === 0) {
              setFaceStatus("NO_FACE");
              setQualityScore(0);
            } else if (faces.length > 1) {
              setFaceStatus("MULTIPLE_FACES");
              setQualityScore(20);
            } else {
              const face = faces[0];
              const box = face.box || [0, 0, 0, 0];
              const faceWidth = box[2];
              const videoWidth = videoRef.current.videoWidth || 640;
              const ratio = faceWidth / videoWidth;

              if (ratio < 0.2) {
                setFaceStatus("TOO_FAR");
                setQualityScore(40);
              } else {
                setFaceStatus("GOOD");
                const score = Math.min(
                  100,
                  Math.round((face.score || 0.8) * 100)
                );
                setQualityScore(score);
              }
            }
          }
        } catch (_) {}
      }
      if (isActive && isCameraActive) {
        animationFrameId = requestAnimationFrame(detectLoop);
      }
    };

    if (isCameraActive) {
      detectLoop();
    }

    return () => {
      isActive = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isCameraActive]);

  const startCamera = async () => {
    if (!consentGiven) {
      setCameraError("Please accept the biometric verification consent first.");
      return;
    }
    setCameraError(null);
    try {
      await initHuman();
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 640 },
          facingMode: "user",
        },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error("[SelfieCapture] Camera access failed:", err);
      setCameraError(
        "Could not access camera. Please allow camera permissions or upload a selfie file below."
      );
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  }, [stream]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const handleCapturePhoto = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 640;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw frame (mirror horizontal for natural selfie view)
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Extract face embedding using Human AI if available
    let embedding: number[] | undefined;
    let score = qualityScore || 85;
    if (humanRef.current) {
      try {
        const detectRes = await humanRef.current.detect(canvas);
        if (detectRes?.face?.[0]?.embedding) {
          embedding = Array.from(detectRes.face[0].embedding);
        }
      } catch (err) {
        console.warn("[SelfieCapture] Face embedding extraction warning:", err);
      }
    }

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `selfie_${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        const previewUrl = URL.createObjectURL(blob);
        const result: SelfieCaptureResult = {
          file,
          previewUrl,
          embedding,
          qualityScore: score,
        };
        setCapturedData(result);
        onCapture(result);
        stopCamera();
      },
      "image/jpeg",
      0.92
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const previewUrl = URL.createObjectURL(file);

    let embedding: number[] | undefined;
    let score = 80;

    const human = await initHuman();
    if (human) {
      try {
        const img = new Image();
        img.src = previewUrl;
        await new Promise((res) => {
          img.onload = res;
        });
        const detectRes = await human.detect(img);
        if (detectRes?.face?.length === 1) {
          if (detectRes.face[0].embedding) {
            embedding = Array.from(detectRes.face[0].embedding);
          }
          score = Math.round((detectRes.face[0].score || 0.8) * 100);
        }
      } catch (err) {
        console.warn("[SelfieCapture] File face check:", err);
      }
    }

    const result: SelfieCaptureResult = {
      file,
      previewUrl,
      embedding,
      qualityScore: score,
    };
    setCapturedData(result);
    onCapture(result);
  };

  const handleRetake = () => {
    setCapturedData(null);
    onCapture(null);
    setFaceStatus("NO_FACE");
    setQualityScore(0);
  };

  // Status badge styling
  const getStatusBadge = () => {
    switch (faceStatus) {
      case "GOOD":
        return {
          text: "Face Aligned & Ready",
          color: "border-emerald-500 text-emerald-700 bg-emerald-50",
        };
      case "TOO_FAR":
        return {
          text: "Move Closer to Camera",
          color: "border-amber-400 text-amber-700 bg-amber-50",
        };
      case "MULTIPLE_FACES":
        return {
          text: "Only 1 Person Allowed in Frame",
          color: "border-rose-400 text-rose-700 bg-rose-50",
        };
      case "NO_FACE":
      default:
        return {
          text: "Position Face in Center",
          color: "border-slate-300 text-slate-600 bg-slate-50",
        };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
          Live Verification Selfie
          <span className="text-[#143D32] font-bold">*</span>
        </label>
        {capturedData && (
          <span className="text-xs text-emerald-700 flex items-center gap-1 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Quality Score: {capturedData.qualityScore}%
          </span>
        )}
      </div>

      <p className="text-xs text-slate-500">
        A clear, forward-facing photo used by campus moderators to verify your
        student/driver badge.
      </p>

      {/* Biometric Consent */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-2.5">
        <input
          id="biometricConsent"
          type="checkbox"
          checked={consentGiven}
          onChange={(e) => setConsentGiven(e.target.checked)}
          disabled={disabled || isCameraActive || !!capturedData}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 bg-white text-[#143D32] focus:ring-[#143D32]"
        />
        <label
          htmlFor="biometricConsent"
          className="text-xs text-slate-600 leading-relaxed cursor-pointer select-none"
        >
          <span className="font-semibold text-slate-800">Biometric Consent:</span> I
          consent to capturing my selfie to verify my university identity. Facial
          features are processed securely on-device and stored encrypted for
          institutional identity verification only.
        </label>
      </div>

      {cameraError && (
        <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 p-2.5 rounded-xl">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Camera / Preview Viewport */}
      <div className="relative border border-slate-200 rounded-2xl bg-slate-50 overflow-hidden flex flex-col items-center justify-center min-h-[260px] p-4">
        {/* Captured state */}
        {capturedData ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-emerald-500 shadow-lg relative">
              <img
                src={capturedData.previewUrl}
                alt="Captured Selfie"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-1 right-1 bg-emerald-500 text-white p-1 rounded-full">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRetake}
                disabled={disabled}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retake Photo
              </button>
            </div>
          </div>
        ) : isCameraActive ? (
          /* Live Camera View */
          <div className="relative flex flex-col items-center">
            {/* Guide Oval */}
            <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 shadow-md transition-colors duration-200 bg-black flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
              {/* Overlay Oval Border */}
              <div
                className={`absolute inset-0 rounded-full border-4 pointer-events-none transition-colors duration-200 ${
                  faceStatus === "GOOD"
                    ? "border-emerald-500"
                    : faceStatus === "TOO_FAR"
                    ? "border-amber-400"
                    : faceStatus === "MULTIPLE_FACES"
                    ? "border-rose-500"
                    : "border-slate-400/60"
                }`}
              />
            </div>

            {/* Live Feedback pill */}
            <div
              className={`mt-3 px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-1.5 ${statusBadge.color}`}
            >
              {faceStatus === "GOOD" ? (
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5" />
              )}
              {statusBadge.text}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mt-4">
              <button
                type="button"
                onClick={handleCapturePhoto}
                disabled={faceStatus !== "GOOD" || disabled}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl shadow transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-[#143D32] hover:bg-[#0d2820] text-white"
              >
                <Camera className="w-4 h-4" />
                Capture Selfie
              </button>

              <button
                type="button"
                onClick={stopCamera}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          /* Idle Start Screen */
          <div className="flex flex-col items-center gap-3 text-center max-w-sm">
            <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[#143D32]">
              <Camera className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Take a Real-Time Selfie
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Ensure good lighting, look straight at the camera, and remove
                sunglasses or hats.
              </p>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={startCamera}
                disabled={!consentGiven || disabled || isModelLoading}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl shadow transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-[#143D32] hover:bg-[#0d2820] text-white"
              >
                {isModelLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Loading Model...
                  </>
                ) : (
                  <>
                    <Camera className="w-3.5 h-3.5" />
                    Start Camera
                  </>
                )}
              </button>

              {/* Upload fallback */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={!consentGiven || disabled}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Photo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};
