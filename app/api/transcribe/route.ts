import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

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

// Allowed audio MIME types
const ALLOWED_TYPES = [
  "audio/webm",
  "audio/wav",
  "audio/mp3",
  "audio/mpeg",
  "audio/mp4",
  "audio/ogg",
];

export async function POST(request: NextRequest) {
  try {
    // Get the form data
    const formData = await request.formData();
    const audioFile = formData.get("audio");

    // Validate that audio file exists
    if (!audioFile || !(audioFile instanceof Blob)) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    // Validate file size
    if (audioFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(audioFile.type)) {
      return NextResponse.json(
        {
          error: `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    console.log(
      `Processing audio file: ${audioFile.type}, size: ${audioFile.size} bytes`
    );

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

    return NextResponse.json({
      text: transcription.text,
      language: "en",
      duration: audioFile.size / 16000,
    });
  } catch (error) {
    console.error("Error processing audio:", error);
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
