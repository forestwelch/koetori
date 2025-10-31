import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";
import { createDefaultPipeline } from "@/app/lib/pipeline/createPipeline";
import { createRequestId } from "@/app/lib/pipeline/pipeline";
import { CaptureRequest } from "@/app/lib/pipeline/types";

// App Router configuration
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Maximum file size (10MB) - devices should compress audio
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Usage limits (estimates until dynamic telemetry is available)
const DAILY_LLM_TOKEN_LIMIT = 100000; // Estimated llama tokens per day
const DAILY_AUDIO_SECONDS_LIMIT = 28800; // 8 hours of audio per day

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

    const pipeline = createDefaultPipeline();
    const captureRequest: CaptureRequest = {
      metadata: {
        username: finalUsername,
        source: "device",
        deviceId,
        inputType: "audio",
        clientId: deviceId,
        requestId: createRequestId(),
      },
      audioFile,
      contentType: audioFile.type,
      originalFilename: "device-upload.wav",
    };

    const pipelineResult = await pipeline.run(captureRequest);

    // Track daily usage - update the daily_usage table
    const whisperTokens = Math.ceil(durationSeconds * 50);
    const llmTokensEstimate = Math.ceil(
      (pipelineResult.transcript.length || 0) / 4
    );
    const totalTokens = whisperTokens + llmTokensEstimate;

    const newLLMTokensUsed = currentLLMTokens + llmTokensEstimate;
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
    const memoIds = pipelineResult.memos.map((memo) => memo.id);

    logRequest("info", "Device upload processed successfully", {
      deviceId,
      processingTimeMs: processingTime,
      transcriptionLength: pipelineResult.transcript.length,
      memosCreated: pipelineResult.memos.length,
      memoIds,
      tokensUsed: totalTokens,
      llmTokensRemaining,
      audioSecondsRemaining,
    });

    // Return enhanced response for device
    return NextResponse.json({
      success: true,
      memos_created: pipelineResult.memos.length,
      memo_ids: memoIds,
      transcription_id: pipelineResult.transcriptionId,
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
        llm_tokens: llmTokensEstimate,
        total: totalTokens,
        model_used: pipelineResult.provider,
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
