"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface UseVoiceRecorderReturn {
  isRecording: boolean;
  isProcessing: boolean;
  error: string | null;
  transcription: string | null;
  recordingTime: number;
  audioStream: MediaStream | null;
  maxRecordingTime: number;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  clearTranscription: () => void;
}

// Configuration
const MAX_RECORDING_TIME = 300; // 5 minutes in seconds
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000; // 2 seconds

export function useVoiceRecorder(): UseVoiceRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);

  // Define stopRecording early so it can be used in useEffect
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  // Helper function to upload with retry logic
  const uploadWithRetry = useCallback(
    async (audioBlob: Blob, attempt = 1): Promise<{ text: string }> => {
      try {
        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.webm");

        const response = await fetch("/api/transcribe", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();

          // Don't retry on client errors (4xx)
          if (response.status >= 400 && response.status < 500) {
            throw new Error(errorData.error || "Failed to transcribe audio");
          }

          // Retry on server errors (5xx)
          if (attempt < MAX_RETRY_ATTEMPTS) {
            console.log(
              `Retry attempt ${attempt} of ${MAX_RETRY_ATTEMPTS - 1}`
            );
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
            return uploadWithRetry(audioBlob, attempt + 1);
          }

          throw new Error(errorData.error || "Failed to transcribe audio");
        }

        return await response.json();
      } catch (err) {
        if (attempt < MAX_RETRY_ATTEMPTS && !(err instanceof TypeError)) {
          console.log(`Retry attempt ${attempt} of ${MAX_RETRY_ATTEMPTS - 1}`);
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
          return uploadWithRetry(audioBlob, attempt + 1);
        }
        throw err;
      }
    },
    []
  );

  // Timer effect with auto-stop at max duration
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;
          // Auto-stop at max duration
          if (newTime >= MAX_RECORDING_TIME) {
            stopRecording();
            setError(
              `Maximum recording time of ${MAX_RECORDING_TIME / 60} minutes reached. Recording stopped automatically.`
            );
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setRecordingTime(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, stopRecording]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);

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
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
        setAudioStream(null);

        // Upload audio and get transcription
        setIsProcessing(true);

        try {
          const data = await uploadWithRetry(audioBlob);
          setTranscription(data.text);
          retryCountRef.current = 0; // Reset retry count on success
        } catch (err) {
          console.error("Error uploading audio:", err);
          setError(
            err instanceof Error
              ? err.message
              : "Failed to transcribe audio. Please try again."
          );
        } finally {
          setIsProcessing(false);
        }
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      if (err instanceof DOMException) {
        if (err.name === "NotAllowedError") {
          setError(
            "Microphone permission denied. Please allow access to use this feature."
          );
        } else if (err.name === "NotFoundError") {
          setError(
            "No microphone found. Please connect a microphone and try again."
          );
        } else {
          setError(
            "Unable to access microphone. Please check your browser settings."
          );
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  }, [uploadWithRetry]);

  const clearTranscription = useCallback(() => {
    setTranscription(null);
    setError(null);
  }, []);

  return {
    isRecording,
    isProcessing,
    error,
    transcription,
    recordingTime,
    maxRecordingTime: MAX_RECORDING_TIME,
    audioStream,
    startRecording,
    stopRecording,
    clearTranscription,
  };
}
