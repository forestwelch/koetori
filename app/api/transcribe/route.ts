import { NextRequest, NextResponse } from "next/server";

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

    // TODO: Phase 5 - Integrate with transcription service
    // For now, return a mock response
    console.log(
      `Received audio file: ${audioFile.type}, size: ${audioFile.size} bytes`
    );

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock transcription response
    return NextResponse.json({
      text: "This is a mock transcription. The backend is working! Phase 5 will integrate with a real transcription service like OpenAI Whisper.",
      language: "en",
      duration: audioFile.size / 16000, // Rough estimate
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
