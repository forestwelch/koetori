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
    const deviceId = formData.get("device_id") as string | null;
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
    const finalUsername = username?.trim().toLowerCase() || "device_user";

    logRequest("info", "Processing device audio upload", {
      deviceId: deviceId || "unknown",
      fileType: audioFile.type,
      fileSize: audioFile.size,
      username: finalUsername,
    });

    // Convert Blob to File for Groq API
    const file = new File([audioFile], "recording.wav", {
      type: audioFile.type || "audio/wav",
    });

    // Transcribe audio using Groq Whisper
    const transcription = await groq.audio.transcriptions.create({
      file: file,
      model: "whisper-large-v3-turbo",
      language: "en",
      response_format: "json",
    });

    const transcript = transcription.text;

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
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

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

    const processingTime = Date.now() - startTime;

    logRequest("info", "Device upload processed successfully", {
      deviceId,
      processingTimeMs: processingTime,
      transcriptionLength: transcript.length,
      category: categorization.category,
      confidence: categorization.confidence,
      memoId: memoData?.id,
    });

    // Return minimal response for device (to save bandwidth)
    return NextResponse.json({
      success: true,
      memo_id: memoData?.id,
      category: categorization.category,
      confidence: categorization.confidence,
      needs_review: needsReview,
      processing_time_ms: processingTime,
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
