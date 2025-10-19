import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { rateLimit, getClientIdentifier } from "@/app/lib/rateLimit";
import {
  buildCategorizationPrompt,
  validateCategorizationResult,
} from "@/app/lib/categorization";
import { supabase } from "@/app/lib/supabase";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Configuration for the route
export const config = {
  api: {
    bodyParser: false,
  },
};

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
    // Get the form data
    const formData = await request.formData();
    const audioFile = formData.get("audio");

    // Validate that audio file exists
    if (!audioFile || !(audioFile instanceof Blob)) {
      logRequest("warn", "No audio file provided", { clientId });

      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400, headers }
      );
    }

    // Validate file size
    if (audioFile.size > MAX_FILE_SIZE) {
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
    if (audioFile.size > MAX_AUDIO_DURATION_ESTIMATE) {
      logRequest("warn", "File may exceed duration limit", {
        clientId,
        fileSize: audioFile.size,
        estimatedDuration: audioFile.size / (16 * 1024),
      });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(audioFile.type)) {
      logRequest("warn", "Invalid file type", {
        clientId,
        fileType: audioFile.type,
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
      fileType: audioFile.type,
      fileSize: audioFile.size,
    });

    // Convert Blob to File for Groq API
    const file = new File([audioFile], "recording.webm", {
      type: audioFile.type,
    });

    // Call Groq Whisper API for transcription
    const transcription = await groq.audio.transcriptions.create({
      file: file,
      model: "whisper-large-v3-turbo",
      language: "en", // Optional: specify language or let it auto-detect
      response_format: "json",
    });

    const transcript = transcription.text;

    // Phase 8: AI Categorization
    logRequest("info", "Starting categorization", {
      clientId,
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
      model: "llama-3.1-70b-versatile",
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const rawCategorization = JSON.parse(
      categorizationResponse.choices[0].message.content || "{}"
    );

    const categorization = validateCategorizationResult(rawCategorization);

    // Determine if needs review (confidence < 0.7)
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
      })
      .select()
      .single();

    if (supabaseError) {
      logRequest("error", "Failed to save memo to Supabase", {
        clientId,
        error: supabaseError.message,
      });
      // Don't fail the request, just log the error
    }

    const processingTime = Date.now() - startTime;

    logRequest("info", "Transcription and categorization successful", {
      clientId,
      processingTimeMs: processingTime,
      transcriptionLength: transcript.length,
      category: categorization.category,
      confidence: categorization.confidence,
      needsReview,
    });

    return NextResponse.json(
      {
        transcript,
        category: categorization.category,
        confidence: categorization.confidence,
        needs_review: needsReview,
        extracted: categorization.extracted,
        tags: categorization.tags,
        memo_id: memoData?.id || null,
        language: "en",
        duration: audioFile.size / 16000,
        processingTime: processingTime,
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
