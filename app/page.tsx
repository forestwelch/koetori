'use client';

import { useVoiceRecorder } from './hooks/useVoiceRecorder';
import { RecordButton } from './components/RecordButton';
import { StatusMessage } from './components/StatusMessage';
import { ErrorAlert } from './components/ErrorAlert';
import { TranscriptionDisplay } from './components/TranscriptionDisplay';
import { FeatureCards } from './components/FeatureCards';

export default function Home() {
  const { 
    isRecording, 
    isProcessing, 
    error, 
    transcription, 
    startRecording, 
    stopRecording 
  } = useVoiceRecorder();

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
              <RecordButton
                isRecording={isRecording}
                isProcessing={isProcessing}
                onStart={startRecording}
                onStop={stopRecording}
              />
              
              <StatusMessage isRecording={isRecording} isProcessing={isProcessing} />
              
              {error && <ErrorAlert message={error} />}
              
              {transcription && <TranscriptionDisplay text={transcription} />}
            </div>
          </div>
        </div>

        {/* Feature cards */}
        <div className="mt-8">
          <FeatureCards />
        </div>
      </div>
    </div>
  );
}
