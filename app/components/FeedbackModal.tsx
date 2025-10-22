"use client";

import React, { useState, useRef } from "react";
import { Bug, Upload, X, Image as ImageIcon } from "lucide-react";

import { FeedbackSubmission } from "../types/feedback";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: FeedbackSubmission) => Promise<void>;
}

export function FeedbackModal({
  isOpen,
  onClose,
  onSubmit,
}: FeedbackModalProps) {
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setDescription("");
    setImages([]);
    setIsSubmitting(false);
    onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    // Limit to 5 images max
    const newImages = [...images, ...imageFiles].slice(0, 5);
    setImages(newImages);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!description.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        description: description.trim(),
        images,
        user_agent: navigator.userAgent,
        url: window.location.href,
        username: localStorage.getItem("koetori_username") || undefined,
      });
      handleClose();
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center sm:p-4 overscroll-contain"
      onClick={handleClose}
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div
        className="w-full h-full sm:w-full sm:max-w-2xl sm:h-auto sm:max-h-[90vh] bg-[#0d0e14] sm:bg-[#0d0e14]/98 backdrop-blur-xl sm:border sm:border-slate-700/40 sm:rounded-2xl shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Bug className="w-5 h-5 text-amber-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">Report a Bug</h2>
            </div>
            <button
              onClick={handleClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800/20 hover:bg-slate-700/30 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Describe the bug
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What happened? What did you expect to happen instead?"
              className="w-full h-32 bg-[#1e1f2a]/60 border border-slate-700/30 rounded-lg p-4 text-white placeholder-slate-400 resize-none focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-colors"
              autoFocus
            />
          </div>

          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Screenshots (optional)
            </label>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={images.length >= 5}
              className="w-full p-4 border-2 border-dashed border-slate-600/50 hover:border-amber-500/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex flex-col items-center gap-2 text-slate-400">
                <Upload className="w-6 h-6" />
                <span className="text-sm">
                  {images.length === 0
                    ? "Click to upload screenshots"
                    : `${images.length}/5 images selected`}
                </span>
              </div>
            </button>

            {/* Image Preview */}
            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-slate-800/50 rounded-lg overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-1 left-1 bg-black/50 backdrop-blur-sm rounded px-2 py-1">
                      <ImageIcon className="w-3 h-3 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <button
              onClick={handleSubmit}
              disabled={!description.trim() || isSubmitting}
              className={`w-full sm:w-auto px-6 py-3 sm:py-2 rounded-lg font-medium transition-all ${
                !description.trim() || isSubmitting
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg"
              }`}
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Send Report"
              )}
            </button>
            <button
              onClick={handleClose}
              className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
