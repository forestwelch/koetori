import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIdentifier } from "@/app/lib/rateLimit";
import { createDefaultPipeline } from "@/app/lib/pipeline/createPipeline";
import { createRequestId } from "@/app/lib/pipeline/pipeline";
import { CaptureRequest } from "@/app/lib/pipeline/types";

// App Router configuration
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Maximum audio duration (5 minutes = 300 seconds)
// Estimate: 1 second of audio ~= 16KB at 16kHz
const MAX_AUDIO_DURATION_ESTIMATE = 5 * 60 * 16 * 1024;

// Allowed audio MIME types
const ALLOWED_TYPES = [
  "audio/webm",
  "audio/wav",
  "audio/mp3",
  "audio/mpeg",
  "audio/mp4",
  "audio/ogg",
];

// Rate limit: 10 requests per minute per IP
const RATE_LIMIT_CONFIG = {
  maxRequests: 10,
  windowMs: 60 * 1000,
};

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

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const clientId = getClientIdentifier(request);

  try {
    // Rate limiting
    const rateLimitResult = rateLimit(clientId, RATE_LIMIT_CONFIG);

    // Add rate limit headers
    const headers = {
      "X-RateLimit-Limit": rateLimitResult.limit.toString(),
      "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
      "X-RateLimit-Reset": new Date(rateLimitResult.reset).toISOString(),
    };

    if (!rateLimitResult.success) {
      logRequest("warn", "Rate limit exceeded", {
        clientId,
        limit: rateLimitResult.limit,
      });

      return NextResponse.json(
        {
          error: "Too many requests. Please try again later.",
          retryAfter: new Date(rateLimitResult.reset).toISOString(),
        },
        { status: 429, headers }
      );
    }

    // Check if this is a text-only request
    const contentType = request.headers.get("content-type");
    let transcript: string | undefined;
    let username: string;
    let inputType: "audio" | "text" = "audio";
    let audioFile: Blob | undefined;
    let originalFilename: string | undefined;

    if (contentType?.includes("application/json")) {
      // Handle text input
      inputType = "text";
      const body = await request.json();

      if (!body.text || typeof body.text !== "string" || !body.text.trim()) {
        logRequest("warn", "No text provided", { clientId });
        return NextResponse.json(
          { error: "No text provided" },
          { status: 400, headers }
        );
      }

      if (
        !body.username ||
        typeof body.username !== "string" ||
        !body.username.trim()
      ) {
        logRequest("warn", "No username provided", { clientId });
        return NextResponse.json(
          { error: "No username provided" },
          { status: 400, headers }
        );
      }

      transcript = body.text.trim();
      username = body.username.trim().toLowerCase();

      logRequest("info", "Processing text input", {
        clientId,
        textLength: transcript.length,
        username,
      });
    } else {
      // Handle audio file (existing logic)
      const formData = await request.formData();
      const audioFileField = formData.get("audio");
      const usernameField = formData.get("username");

      // Validate that audio file exists
      if (!audioFileField || !(audioFileField instanceof Blob)) {
        logRequest("warn", "No audio file provided", { clientId });

        return NextResponse.json(
          { error: "No audio file provided" },
          { status: 400, headers }
        );
      }

      if (
        !usernameField ||
        typeof usernameField !== "string" ||
        !usernameField.trim()
      ) {
        logRequest("warn", "No username provided", { clientId });
        return NextResponse.json(
          { error: "No username provided" },
          { status: 400, headers }
        );
      }

      username = usernameField.trim().toLowerCase();

      // Validate that audio file exists
      if (!audioFile || !(audioFile instanceof Blob)) {
        logRequest("warn", "No audio file provided", { clientId });

        return NextResponse.json(
          { error: "No audio file provided" },
          { status: 400, headers }
        );
      }

      // Validate file size
      if (audioFileField.size > MAX_FILE_SIZE) {
        logRequest("warn", "File size exceeds limit", {
          clientId,
          fileSize: audioFile.size,
          maxSize: MAX_FILE_SIZE,
        });

        return NextResponse.json(
          { error: "File size exceeds 10MB limit" },
          { status: 400, headers }
        );
      }

      // Warn if file might exceed duration limit (estimate only)
      if (audioFileField.size > MAX_AUDIO_DURATION_ESTIMATE) {
        logRequest("warn", "File may exceed duration limit", {
          clientId,
          fileSize: audioFileField.size,
          estimatedDuration: audioFileField.size / (16 * 1024),
        });
      }

      // Validate file type
      if (!ALLOWED_TYPES.includes(audioFileField.type)) {
        logRequest("warn", "Invalid file type", {
          clientId,
          fileType: audioFileField.type,
        });

        return NextResponse.json(
          {
            error: `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(", ")}`,
          },
          { status: 400, headers }
        );
      }

      logRequest("info", "Processing transcription request", {
        clientId,
        fileType: audioFileField.type,
        fileSize: audioFileField.size,
      });

      audioFile = audioFileField;
      originalFilename =
        ("name" in audioFileField &&
          typeof (audioFileField as unknown as { name?: string }).name ===
            "string" &&
          (audioFileField as unknown as { name?: string }).name) ||
        "recording.webm";
    }

    const pipeline = createDefaultPipeline();
    const captureRequest: CaptureRequest = {
      metadata: {
        username,
        source: "app",
        deviceId: null,
        inputType,
        clientId,
        requestId: createRequestId(),
      },
      transcript,
      audioFile,
      contentType: audioFile?.type ?? contentType,
      originalFilename,
    };

    const pipelineResult = await pipeline.run(captureRequest);

    const processingTime = Date.now() - startTime;

    logRequest("info", "Transcription pipeline completed", {
      clientId,
      processingTimeMs: processingTime,
      transcriptionId: pipelineResult.transcriptionId,
      memoCount: pipelineResult.memos.length,
    });

    return NextResponse.json(
      {
        transcript: pipelineResult.transcript,
        memos_created: pipelineResult.memos.length,
        memo_ids: pipelineResult.memos.map((m) => m.id),
        transcription_id: pipelineResult.transcriptionId,
        memos: pipelineResult.memos,
        language: pipelineResult.language ?? "en",
        duration: pipelineResult.durationSeconds ?? null,
        provider: pipelineResult.provider,
        processingTime,
        events: pipelineResult.events,
        enrichmentTasks: pipelineResult.enrichmentTasks ?? [],
      },
      { headers }
    );
  } catch (error) {
    const processingTime = Date.now() - startTime;

    logRequest("error", "Transcription failed", {
      clientId,
      processingTimeMs: processingTime,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to process audio file",
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: "healthy",
    message: "Transcription API is running",
    timestamp: new Date().toISOString(),
  });
}
