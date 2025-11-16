"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, X, Upload } from "lucide-react";
import { BaseModal } from "./ui/BaseModal";
import { Button } from "./ui/Button";
import { optimizeImageForGroq } from "@/app/lib/services/imageOptimizer";

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => Promise<void>;
}

export function CameraModal({ isOpen, onClose, onCapture }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Start camera when modal opens
  useEffect(() => {
    if (isOpen && !stream) {
      startCamera();
    }

    return () => {
      // Cleanup: stop camera when modal closes
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Prefer back camera on mobile
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to access camera. Please check permissions.";
      setError(errorMessage);
      console.error("Camera access error:", err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setCapturedImage(dataUrl);
    setIsCapturing(true);
    stopCamera();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      // Optimize image before upload
      const optimizedBlob = await optimizeImageForGroq(file);
      const optimizedFile = new File([optimizedBlob], file.name, {
        type: optimizedBlob.type,
      });

      await onCapture(optimizedFile);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process image");
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!capturedImage) return;

    try {
      setIsProcessing(true);
      setError(null);

      // Convert data URL to File
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const file = new File([blob], `photo-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      // Optimize image before upload
      const optimizedBlob = await optimizeImageForGroq(file);
      const optimizedFile = new File([optimizedBlob], file.name, {
        type: optimizedBlob.type,
      });

      await onCapture(optimizedFile);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process image");
      setIsProcessing(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setIsCapturing(false);
    startCamera();
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    setError(null);
    setIsCapturing(false);
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Take a Photo"
      size="lg"
      showCloseButton
    >
      <div className="space-y-4 relative">
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {isProcessing && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg -m-4">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-white text-sm">Processing image...</p>
            </div>
          </div>
        )}

        {capturedImage ? (
          // Show captured image
          <div className="space-y-4 relative">
            <div className="relative w-full bg-black rounded-lg overflow-hidden">
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-auto max-h-[60vh] object-contain"
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleRetake}
                variant="secondary"
                className="flex-1"
                disabled={isProcessing}
              >
                Retake
              </Button>
              <Button
                onClick={handleSave}
                variant="primary"
                className="flex-1"
                isLoading={isProcessing}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Save Memo"}
              </Button>
            </div>
          </div>
        ) : (
          // Show camera preview or file upload
          <div className="space-y-4">
            {stream && videoRef.current?.srcObject ? (
              <div className="relative w-full bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-auto max-h-[60vh] object-contain"
                />
              </div>
            ) : (
              <div className="relative w-full aspect-video bg-slate-900 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-700">
                <div className="text-center">
                  <Camera className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">
                    Camera not available. Use file upload instead.
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="secondary"
                className="flex-1"
                leftIcon={<Upload className="w-4 h-4" />}
              >
                Upload Photo
              </Button>
              {stream && videoRef.current?.srcObject && (
                <Button
                  onClick={capturePhoto}
                  variant="primary"
                  className="flex-1"
                  leftIcon={<Camera className="w-4 h-4" />}
                >
                  Capture
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </BaseModal>
  );
}
