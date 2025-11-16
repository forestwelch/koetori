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

// Allowed image MIME types
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
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

    // Get form data
    const formData = await request.formData();
    const imageFile = formData.get("image");
    const username = formData.get("username");

    // Validate username
    if (!username || typeof username !== "string" || !username.trim()) {
      logRequest("warn", "No username provided", { clientId });

      return NextResponse.json(
        { error: "No username provided" },
        { status: 400, headers }
      );
    }

    const finalUsername = username.trim().toLowerCase();

    // Validate image file
    if (!imageFile || !(imageFile instanceof Blob)) {
      logRequest("warn", "No image file provided", { clientId });

      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400, headers }
      );
    }

    // Validate file size
    if (imageFile.size > MAX_FILE_SIZE) {
      logRequest("warn", "File size exceeds limit", {
        clientId,
        fileSize: imageFile.size,
        maxSize: MAX_FILE_SIZE,
      });

      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400, headers }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(imageFile.type)) {
      logRequest("warn", "Invalid file type", {
        clientId,
        fileType: imageFile.type,
      });

      return NextResponse.json(
        {
          error: `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(", ")}`,
        },
        { status: 400, headers }
      );
    }

    logRequest("info", "Processing image request", {
      clientId,
      fileType: imageFile.type,
      fileSize: imageFile.size,
    });

    const pipeline = createDefaultPipeline();
    const captureRequest: CaptureRequest = {
      metadata: {
        username: finalUsername,
        source: "app",
        deviceId: null,
        inputType: "image",
        clientId,
        requestId: createRequestId(),
      },
      imageFile,
      contentType: imageFile.type,
      originalFilename:
        ("name" in imageFile &&
          typeof (imageFile as unknown as { name?: string }).name ===
            "string" &&
          (imageFile as unknown as { name?: string }).name) ||
        "photo.jpg",
    };

    const pipelineResult = await pipeline.run(captureRequest);

    const processingTime = Date.now() - startTime;

    logRequest("info", "Image pipeline completed", {
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
        processingTime,
        events: pipelineResult.events,
        enrichmentTasks: pipelineResult.enrichmentTasks ?? [],
      },
      { headers }
    );
  } catch (error) {
    const processingTime = Date.now() - startTime;

    logRequest("error", "Image processing failed", {
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
            : "Failed to process image file",
      },
      { status: 500 }
    );
  }
}
