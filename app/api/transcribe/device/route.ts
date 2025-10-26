import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import {
  buildCategorizationPrompt,
  validateCategorizationResult,
} from "@/app/lib/categorization";
import { supabase } from "@/app/lib/supabase";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// App Router configuration
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Maximum file size (10MB) - devices should compress audio
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Groq API Daily Limits (based on on_demand tier)
const DAILY_LLM_TOKEN_LIMIT = 100000; // llama-3.3-70b-versatile
const DAILY_AUDIO_SECONDS_LIMIT = 28800; // whisper-large-v3-turbo (8 hours)
const LLM_FALLBACK_THRESHOLD = 0.9; // Switch to cheaper model at 90% usage

// Model configuration
const PRIMARY_LLM_MODEL = "llama-3.3-70b-versatile";
const FALLBACK_LLM_MODEL = "llama-3.1-8b-instant"; // 500K tokens/day fallback

// Allowed audio MIME types from M5StickC
const ALLOWED_TYPES = [
  "audio/wav",
  "audio/webm",
  "audio/mp3",
  "audio/mpeg",
  "audio/ogg",
  "application/octet-stream", // In case device sends binary without MIME type
];

function logRequest(
  level: "info" | "error" | "warn",
  message: string,
  data?: Record<string, unknown>
) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...data,
  };

  if (level === "error") {
    console.error(JSON.stringify(logEntry));
  } else if (level === "warn") {
    console.warn(JSON.stringify(logEntry));
  } else {
    console.log(JSON.stringify(logEntry));
  }
}

function getHoursUntilPSTMidnight(): number {
  const now = new Date();
  const pstOffset = -8 * 60; // PST is UTC-8 (in minutes)
  const localOffset = now.getTimezoneOffset();
  const pstTime = new Date(now.getTime() + (localOffset - pstOffset) * 60000);

  const midnight = new Date(pstTime);
  midnight.setHours(24, 0, 0, 0);

  const hoursUntilReset =
    (midnight.getTime() - pstTime.getTime()) / (1000 * 60 * 60);
  return Math.max(0, hoursUntilReset);
}

function getTodayDatePST(): string {
  const now = new Date();
  const pstOffset = -8 * 60;
  const localOffset = now.getTimezoneOffset();
  const pstTime = new Date(now.getTime() + (localOffset - pstOffset) * 60000);
  return pstTime.toISOString().split("T")[0]; // YYYY-MM-DD
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Authentication: Check for device API key
    const apiKey = request.headers.get("x-api-key");
    const deviceApiKey = process.env.DEVICE_API_KEY;

    if (!deviceApiKey) {
      logRequest("error", "DEVICE_API_KEY not configured in environment");
      return NextResponse.json(
        { error: "Server configuration error", success: false },
        { status: 500 }
      );
    }

    if (!apiKey || apiKey !== deviceApiKey) {
      logRequest("warn", "Unauthorized device access attempt", {
        providedKey: apiKey ? "present" : "missing",
      });
      return NextResponse.json(
        { error: "Unauthorized", success: false },
        { status: 401 }
      );
    }

    // Get form data
    const formData = await request.formData();
    const audioFile = formData.get("audio");
    const deviceId = (formData.get("device_id") as string | null) || "unknown";
    const username = formData.get("username") as string | null;

    // Validate audio file
    if (!audioFile || !(audioFile instanceof Blob)) {
      logRequest("warn", "No audio file provided", { deviceId });
      return NextResponse.json(
        { error: "No audio file provided", success: false },
        { status: 400 }
      );
    }

    // Validate file size
    if (audioFile.size > MAX_FILE_SIZE) {
      logRequest("warn", "File size exceeds limit", {
        deviceId,
        fileSize: audioFile.size,
        maxSize: MAX_FILE_SIZE,
      });
      return NextResponse.json(
        { error: "File size exceeds 10MB limit", success: false },
        { status: 400 }
      );
    }

    // Validate file type
    if (audioFile.type && !ALLOWED_TYPES.includes(audioFile.type)) {
      logRequest("warn", "Invalid file type", {
        deviceId,
        fileType: audioFile.type,
      });
      return NextResponse.json(
        { error: `Invalid file type: ${audioFile.type}`, success: false },
        { status: 400 }
      );
    }

    // Validate or use default username
    const finalUsername = username?.trim().toLowerCase() || "forest";

    // Calculate recording duration and metadata
    const fileSizeBytes = audioFile.size;
    const durationSeconds = Math.max(0, (fileSizeBytes - 44) / (16000 * 2)); // 16kHz, 16-bit mono, minus 44-byte WAV header

    logRequest("info", "Processing device audio upload", {
      deviceId: deviceId || "unknown",
      fileType: audioFile.type,
      fileSize: audioFile.size,
      durationSeconds: durationSeconds.toFixed(1),
      username: finalUsername,
    });

    // Check today's usage before processing
    const today = getTodayDatePST();
    const { data: usageData } = await supabase
      .from("daily_usage")
      .select("llm_tokens_used, audio_seconds_used, requests_count")
      .eq("username", finalUsername)
      .eq("date", today)
      .single();

    const currentLLMTokens = usageData?.llm_tokens_used || 0;
    const currentAudioSeconds = usageData?.audio_seconds_used || 0;
    const hoursUntilReset = getHoursUntilPSTMidnight();

    // Check if audio quota exceeded
    if (currentAudioSeconds + durationSeconds > DAILY_AUDIO_SECONDS_LIMIT) {
      logRequest("warn", "Daily audio quota exceeded", {
        username: finalUsername,
        currentAudioSeconds,
        requestedSeconds: durationSeconds,
        limit: DAILY_AUDIO_SECONDS_LIMIT,
        hoursUntilReset,
      });
      return NextResponse.json(
        {
          success: false,
          error: "Daily audio quota exceeded",
          quota_type: "audio_seconds",
          quota: {
            audio: {
              seconds_used_today: currentAudioSeconds,
              daily_limit: DAILY_AUDIO_SECONDS_LIMIT,
              remaining: Math.max(
                0,
                DAILY_AUDIO_SECONDS_LIMIT - currentAudioSeconds
              ),
              percent_used: Math.min(
                100,
                Math.round(
                  (currentAudioSeconds / DAILY_AUDIO_SECONDS_LIMIT) * 100
                )
              ),
            },
            hours_until_reset: hoursUntilReset,
          },
        },
        { status: 429 }
      );
    }

    // Determine if we should use fallback LLM model
    const llmPercentUsed = currentLLMTokens / DAILY_LLM_TOKEN_LIMIT;
    const useFallbackModel = llmPercentUsed >= LLM_FALLBACK_THRESHOLD;
    const selectedModel = useFallbackModel
      ? FALLBACK_LLM_MODEL
      : PRIMARY_LLM_MODEL;

    if (useFallbackModel) {
      logRequest("info", "Using fallback LLM model due to high token usage", {
        username: finalUsername,
        currentTokens: currentLLMTokens,
        percentUsed: Math.round(llmPercentUsed * 100),
        fallbackModel: FALLBACK_LLM_MODEL,
      });
    }

    // Create FileLike object for Groq API by wrapping the Blob
    // Groq SDK needs an object with name, lastModified, and all Blob methods
    const file = new Proxy(audioFile, {
      get(target, prop) {
        if (prop === "name") return "recording.wav";
        if (prop === "lastModified") return Date.now();
        return target[prop as keyof typeof target];
      },
    });

    // Transcribe audio using Groq Whisper
    const transcription = await groq.audio.transcriptions.create({
      file: file,
      model: "whisper-large-v3-turbo",
      language: "en",
      response_format: "json",
    });

    const transcript = transcription.text;

    // Capture Whisper token usage (Groq may not return this, so estimate)
    // Note: x_groq is not in the official type but may be present at runtime
    const whisperTokens =
      (transcription as { x_groq?: { usage?: { total_tokens?: number } } })
        .x_groq?.usage?.total_tokens || Math.ceil(durationSeconds * 50); // Estimate: ~50 tokens/second

    if (!transcript || transcript.trim().length === 0) {
      logRequest("warn", "Transcription returned empty result", { deviceId });
      return NextResponse.json(
        { error: "Could not transcribe audio", success: false },
        { status: 400 }
      );
    }

    // Categorize the transcript
    logRequest("info", "Starting categorization", {
      deviceId,
      transcriptLength: transcript.length,
    });

    const categorizationPrompt = buildCategorizationPrompt(transcript);
    const categorizationResponse = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: categorizationPrompt,
        },
      ],
      model: selectedModel, // Use fallback model if approaching limit
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    // Capture LLM token usage
    const llmTokens = categorizationResponse.usage?.total_tokens || 0;
    const totalTokens = whisperTokens + llmTokens;

    const rawCategorization = JSON.parse(
      categorizationResponse.choices[0].message.content || "{}"
    );

    const categorization = validateCategorizationResult(rawCategorization);
    const needsReview = categorization.confidence < 0.7;

    // Save to Supabase
    const { data: memoData, error: supabaseError } = await supabase
      .from("memos")
      .insert({
        transcript,
        category: categorization.category,
        confidence: categorization.confidence,
        needs_review: needsReview,
        extracted: categorization.extracted,
        tags: categorization.tags,
        starred: categorization.starred || false,
        size: categorization.size || null,
        username: finalUsername,
        source: "device",
        input_type: "audio",
        device_id: deviceId,
      })
      .select()
      .single();

    if (supabaseError) {
      logRequest("error", "Failed to save memo to Supabase", {
        deviceId,
        error: supabaseError.message,
      });
      return NextResponse.json(
        { error: "Failed to save memo", success: false },
        { status: 500 }
      );
    }

    // Track daily usage - update the daily_usage table
    const newLLMTokensUsed = currentLLMTokens + llmTokens;
    const newAudioSecondsUsed = currentAudioSeconds + durationSeconds;
    const newRequestsCount = (usageData?.requests_count || 0) + 1;

    const { error: usageError } = await supabase.from("daily_usage").upsert(
      {
        username: finalUsername,
        date: today,
        llm_tokens_used: newLLMTokensUsed,
        audio_seconds_used: newAudioSecondsUsed,
        requests_count: newRequestsCount,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "username,date",
      }
    );

    if (usageError) {
      logRequest("warn", "Failed to update daily usage tracking", {
        username: finalUsername,
        error: usageError.message,
      });
    }

    // Calculate quota information
    const llmTokensRemaining = Math.max(
      0,
      DAILY_LLM_TOKEN_LIMIT - newLLMTokensUsed
    );
    const audioSecondsRemaining = Math.max(
      0,
      DAILY_AUDIO_SECONDS_LIMIT - newAudioSecondsUsed
    );
    const llmPercentUsedFinal = Math.min(
      100,
      Math.round((newLLMTokensUsed / DAILY_LLM_TOKEN_LIMIT) * 100)
    );
    const audioPercentUsed = Math.min(
      100,
      Math.round((newAudioSecondsUsed / DAILY_AUDIO_SECONDS_LIMIT) * 100)
    );

    const processingTime = Date.now() - startTime;

    logRequest("info", "Device upload processed successfully", {
      deviceId,
      processingTimeMs: processingTime,
      transcriptionLength: transcript.length,
      category: categorization.category,
      confidence: categorization.confidence,
      memoId: memoData?.id,
      modelUsed: selectedModel,
      tokensUsed: totalTokens,
      llmTokensRemaining,
      audioSecondsRemaining,
    });

    // Return enhanced response for device
    return NextResponse.json({
      success: true,
      memo_id: memoData?.id,
      category: categorization.category,
      confidence: categorization.confidence,
      needs_review: needsReview,
      processing_time_ms: processingTime,

      // Recording metadata
      recording: {
        duration_seconds: parseFloat(durationSeconds.toFixed(1)),
        file_size_bytes: fileSizeBytes,
        file_size_kb: Math.round(fileSizeBytes / 1024),
      },

      // Token usage
      tokens: {
        whisper_tokens: whisperTokens,
        llm_tokens: llmTokens,
        total: totalTokens,
        model_used: selectedModel,
      },

      // Daily quota info
      quota: {
        llm: {
          used_today: newLLMTokensUsed,
          daily_limit: DAILY_LLM_TOKEN_LIMIT,
          remaining: llmTokensRemaining,
          percent_used: llmPercentUsedFinal,
        },
        audio: {
          seconds_used_today: parseFloat(newAudioSecondsUsed.toFixed(1)),
          daily_limit: DAILY_AUDIO_SECONDS_LIMIT,
          remaining: parseFloat(audioSecondsRemaining.toFixed(1)),
          percent_used: audioPercentUsed,
        },
        hours_until_reset: parseFloat(hoursUntilReset.toFixed(1)),
      },
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;

    logRequest("error", "Device upload failed", {
      processingTimeMs: processingTime,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to process audio file",
      },
      { status: 500 }
    );
  }
}

// Health check endpoint for device to test connectivity
export async function GET() {
  return NextResponse.json({
    status: "healthy",
    message: "Device API endpoint is running",
    timestamp: new Date().toISOString(),
  });
}
