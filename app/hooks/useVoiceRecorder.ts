"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Category, ExtractedData } from "../types/memo";
import { useErrorHandler } from "../components/ErrorBoundary";

// Full API response type (includes more than TranscriptionResponse)
interface TranscribeApiResponse {
  transcript: string;
  memos_created: number;
  memo_ids: string[];
  transcription_id: string;
  memos: Array<{
    id: string;
    category: Category;
    confidence: number;
    needs_review: boolean;
    extracted: ExtractedData | null;
    tags: string[] | null;
    starred: boolean;
    transcript_excerpt: string | null;
  }>;
  language?: string;
  duration?: number | null;
  provider?: string;
  processingTime?: number;
  events?: unknown[];
  enrichmentTasks?: unknown[];
}

interface UseVoiceRecorderReturn {
  isRecording: boolean;
  isProcessing: boolean;
  error: string | null;
  transcription: string | null;
  category: Category | null;
  confidence: number | null;
  needsReview: boolean;
  extracted: ExtractedData | null;
  tags: string[];
  memoId: string | null;
  memosCreated: number;
  recordingTime: number;
  audioStream: MediaStream | null;
  maxRecordingTime: number;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  cancelRecording: () => void;
  clearTranscription: () => void;
}

// Configuration
const MAX_RECORDING_TIME = 300; // 5 minutes in seconds
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000; // 2 seconds

export function useVoiceRecorder(username?: string): UseVoiceRecorderReturn {
  const handleError = useErrorHandler();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);

  // Phase 8: Categorization state
  const [category, setCategory] = useState<Category | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [needsReview, setNeedsReview] = useState(false);
  const [extracted, setExtracted] = useState<ExtractedData | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [memoId, setMemoId] = useState<string | null>(null);
  const [memosCreated, setMemosCreated] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const shouldProcessRef = useRef(true); // Flag to control whether to process on stop

  // Define stopRecording early so it can be used in useEffect
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      // Discard recordings less than 1.5 seconds
      if (recordingTime < 1.5) {
        shouldProcessRef.current = false; // Don't process
        mediaRecorderRef.current.stop();
        setIsRecording(false);

        // Clean up immediately
        if (audioStream) {
          audioStream.getTracks().forEach((track) => track.stop());
          setAudioStream(null);
        }
        audioChunksRef.current = [];
        return;
      }

      shouldProcessRef.current = true; // Process this recording
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording, recordingTime, audioStream]);

  // Cancel recording without saving
  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      shouldProcessRef.current = false; // Don't process this recording
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Clean up immediately
      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop());
        setAudioStream(null);
      }
      audioChunksRef.current = [];
    }
  }, [isRecording, audioStream]);

  // Helper function to upload with retry logic
  const uploadWithRetry = useCallback(
    async (audioBlob: Blob, attempt = 1): Promise<TranscribeApiResponse> => {
      try {
        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.webm");
        if (username) {
          formData.append("username", username);
        }

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
            // Wait before retry
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
            return uploadWithRetry(audioBlob, attempt + 1);
          }

          throw new Error(errorData.error || "Failed to transcribe audio");
        }

        return await response.json();
      } catch (err) {
        if (attempt < MAX_RETRY_ATTEMPTS && !(err instanceof TypeError)) {
          // Wait before retry
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
          return uploadWithRetry(audioBlob, attempt + 1);
        }
        throw err;
      }
    },
    [username]
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

      // Try to use optimized settings for smaller file sizes
      const getOptimalRecorderOptions = ():
        | MediaRecorderOptions
        | undefined => {
        // Check if browser supports audioBitsPerSecond
        if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
          return {
            mimeType: "audio/webm;codecs=opus",
            audioBitsPerSecond: 16000, // Lower bitrate = smaller files (16kbps is good for speech)
          };
        }
        // Fallback to default if not supported
        return undefined;
      };

      const options = getOptimalRecorderOptions();
      const mediaRecorder = new MediaRecorder(stream, options);
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
        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
        setAudioStream(null);

        // Only process if not cancelled
        if (!shouldProcessRef.current) {
          audioChunksRef.current = [];
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        // Upload audio and get transcription + categorization
        setIsProcessing(true);

        try {
          const data = await uploadWithRetry(audioBlob);
          // Handle response - API returns memos array and memo_ids array
          const memosArray = Array.isArray(data.memos) ? data.memos : [];
          const firstMemo = memosArray.length > 0 ? memosArray[0] : null;
          const createdCount = data.memos_created ?? memosArray.length ?? 0;

          setTranscription(data.transcript);
          setMemosCreated(createdCount);
          if (firstMemo) {
            setCategory(firstMemo.category || null);
            setConfidence(firstMemo.confidence ?? null);
            setNeedsReview(firstMemo.needs_review ?? false);
            setExtracted(firstMemo.extracted || null);
            setTags(firstMemo.tags || []);
          }
          setMemoId(data.memo_ids?.[0] || firstMemo?.id || null);
          retryCountRef.current = 0; // Reset retry count on success
        } catch (err) {
          const errorMessage =
            err instanceof Error
              ? err.message
              : "Failed to transcribe audio. Please try again.";
          setError(errorMessage);
          handleError(err, "Failed to transcribe audio");
        } finally {
          setIsProcessing(false);
        }
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
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
    // Phase 8: Clear categorization data
    setCategory(null);
    setConfidence(null);
    setNeedsReview(false);
    setExtracted(null);
    setTags([]);
    setMemoId(null);
    setMemosCreated(0);
  }, []);

  return {
    isRecording,
    isProcessing,
    error,
    transcription,
    category,
    confidence,
    needsReview,
    extracted,
    tags,
    memoId,
    memosCreated,
    recordingTime,
    maxRecordingTime: MAX_RECORDING_TIME,
    audioStream,
    startRecording,
    stopRecording,
    cancelRecording,
    clearTranscription,
  };
}
