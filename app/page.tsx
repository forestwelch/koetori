'use client';

import { useState, useRef } from 'react';

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      setError(null);
      
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create MediaRecorder instance
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      // Collect audio data
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      // Handle recording stop
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        // TODO: Upload audio and get transcription (Phase 4)
        setIsProcessing(true);
        // Simulating processing for now
        setTimeout(() => {
          setTranscription("Transcription will appear here once backend is connected.");
          setIsProcessing(false);
        }, 2000);
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      
    } catch (err) {
      console.error('Error accessing microphone:', err);
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          setError('Microphone permission denied. Please allow access to use this feature.');
        } else if (err.name === 'NotFoundError') {
          setError('No microphone found. Please connect a microphone and try again.');
        } else {
          setError('Unable to access microphone. Please check your browser settings.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="min-h-screen p-8 relative overflow-hidden">
      {/* Background gradient glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#6366f1]/10 via-transparent to-[#f43f5e]/10 pointer-events-none" />

      <div className="max-w-3xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-light mb-3 bg-gradient-to-r from-[#818cf8] via-[#c084fc] to-[#fb7185] bg-clip-text text-transparent">
            Koetori
          </h1>
          <p className="text-[#94a3b8] text-sm font-light">
            Voice Capture & Transcription
          </p>
        </div>

        {/* Main card with glass morphism */}
        <div className="relative group">
          {/* Glow effect behind card */}
          <div className={`absolute -inset-0.5 bg-gradient-to-r rounded-2xl blur transition duration-500 ${
            isRecording 
              ? 'from-[#f43f5e] to-[#fb7185] opacity-40 animate-pulse' 
              : 'from-[#6366f1] to-[#f43f5e] opacity-20 group-hover:opacity-30'
          }`} />

          {/* Glass card */}
          <div className="relative bg-[#14151f]/80 backdrop-blur-xl rounded-2xl border border-slate-700/30 shadow-2xl p-12">
            <div className="flex flex-col items-center text-center gap-6">
              {/* Recording button with glow */}
              <div className="relative">
                <div className={`absolute inset-0 rounded-full blur-xl opacity-50 transition-colors duration-300 ${
                  isRecording ? 'bg-[#f43f5e] animate-pulse' : 'bg-[#6366f1] animate-pulse'
                }`} />
                <button 
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isProcessing}
                  className={`relative w-20 h-20 rounded-full transition-all duration-300 flex items-center justify-center shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isRecording
                      ? 'bg-gradient-to-br from-[#f43f5e] to-[#fb7185] hover:from-[#e11d48] hover:to-[#f43f5e] shadow-[#f43f5e]/50 hover:shadow-xl hover:shadow-[#f43f5e]/70'
                      : 'bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] hover:from-[#4f46e5] hover:to-[#7c3aed] shadow-[#6366f1]/50 hover:shadow-xl hover:shadow-[#6366f1]/70'
                  }`}
                >
                  {isRecording ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="6" width="12" height="12" rx="2" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                      />
                    </svg>
                  )}
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-[#e2e8f0] text-lg font-light">
                  {isProcessing ? 'Processing...' : isRecording ? 'Recording...' : 'Ready to Record'}
                </p>
                <p className="text-[#64748b] text-sm font-light">
                  {isRecording 
                    ? 'Click the button to stop recording' 
                    : 'Click the microphone to start capturing audio'}
                </p>
              </div>
              
              {/* Error message */}
              {error && (
                <div className="w-full mt-4 p-4 bg-[#f43f5e]/10 border border-[#f43f5e]/30 rounded-xl">
                  <p className="text-[#fb7185] text-sm font-light">{error}</p>
                </div>
              )}
              
              {/* Transcription display */}
              {transcription && (
                <div className="w-full mt-4 p-6 bg-[#14151f]/60 backdrop-blur-xl rounded-xl border border-slate-700/30">
                  <h3 className="text-[#e2e8f0] text-sm font-light mb-3">Transcription</h3>
                  <p className="text-[#94a3b8] text-sm font-light leading-relaxed">{transcription}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          {[
            { icon: "🎙️", label: "High Quality" },
            { icon: "⚡", label: "Fast Processing" },
            { icon: "🔒", label: "Secure" },
          ].map((feature, index) => (
            <div key={index} className="relative group/feature">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6366f1]/20 to-[#f43f5e]/20 rounded-xl blur opacity-0 group-hover/feature:opacity-100 transition duration-300" />
              <div className="relative bg-[#14151f]/60 backdrop-blur-xl rounded-xl border border-slate-700/20 p-4 text-center">
                <div className="text-2xl mb-2">{feature.icon}</div>
                <p className="text-[#94a3b8] text-xs font-light">
                  {feature.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
