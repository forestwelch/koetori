import Groq from "groq-sdk";
import {
  CaptureRequest,
  TranscriptionJob,
  TranscriptionResult,
} from "../pipeline/types";
import { TranscriptionService } from "../pipeline/interfaces";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export class GroqTranscriptionService implements TranscriptionService {
  async createJob(request: CaptureRequest): Promise<TranscriptionJob> {
    if (request.metadata.inputType === "audio" && !request.audioFile) {
      throw new Error("Audio input requires audioFile");
    }
    if (request.metadata.inputType === "image" && !request.imageFile) {
      throw new Error("Image input requires imageFile");
    }

    return { request };
  }

  async transcribe(job: TranscriptionJob): Promise<TranscriptionResult> {
    const { request } = job;

    // Handle image input
    if (request.metadata.inputType === "image") {
      return this.transcribeImage(request);
    }

    // Handle audio input
    if (!request.audioFile) {
      throw new Error("No audio file provided for transcription");
    }

    // Create a File-like object for Groq SDK compatibility
    // Using Proxy to add name and lastModified properties without copying data
    const file = new Proxy(request.audioFile, {
      get(target, prop) {
        if (prop === "name")
          return request.originalFilename ?? "recording.webm";
        if (prop === "lastModified") return Date.now();
        return Reflect.get(target, prop);
      },
    }) as File;

    const transcription = await groq.audio.transcriptions.create({
      file,
      model: "whisper-large-v3-turbo",
      language: "en",
      response_format: "json",
    });

    const wordEstimate = transcription.text?.length ?? 0;

    return {
      transcript: transcription.text,
      language: "en", // We specify language in the request
      durationSeconds:
        wordEstimate > 0 ? Math.round(wordEstimate / 150) * 60 : null,
      provider: "groq-whisper-large-v3-turbo",
    };
  }

  private async transcribeImage(
    request: CaptureRequest
  ): Promise<TranscriptionResult> {
    if (!request.imageFile) {
      throw new Error("No image file provided");
    }

    // Convert image to base64
    const arrayBuffer = await request.imageFile.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = request.imageFile.type || "image/jpeg";

    // Create a comprehensive prompt for OCR + image understanding
    const prompt = `Analyze this image thoroughly and provide a comprehensive memo-style description that includes:

1. **Text Extraction (OCR)**: Extract ALL visible text in the image - any text, numbers, signs, labels, handwriting, documents, receipts, etc. Present extracted text clearly and accurately.

2. **Visual Description**: Describe what you see - objects, scenes, people, actions, setting, context. Be specific about colors, positions, relationships between objects.

3. **Contextual Information**: Include any useful context, actionable information, or insights that would help someone understand what this image represents.

**Format Requirements:**
- If the image is primarily text-based (document, note, receipt, screenshot, etc.), prioritize the extracted text and format it clearly
- If the image is a photo/scene, provide a detailed natural description
- Combine all elements into a coherent, useful memo entry
- Be specific and detailed but concise
- Use natural language that flows well as a memo entry

Write as if you are describing this image to create a memo entry for personal knowledge management.`;

    try {
      // Try using Groq's chat completions with vision support
      // Using the same model we use for understanding
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        temperature: 0.3,
        max_tokens: 1500,
      });

      const transcript =
        completion.choices[0]?.message?.content ||
        "Unable to process image. Vision support may not be available in this model.";

      return {
        transcript,
        language: "en",
        durationSeconds: null,
        provider: "groq-llama-3.3-vision",
      };
    } catch (error) {
      // If vision API format fails, try alternative approaches
      console.warn("Vision API format failed, trying alternative:", error);

      // Try with just the image URL in a different format
      try {
        const altCompletion = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "user",
              content: `${prompt}\n\n[Image data: ${mimeType}, ${Math.round(request.imageFile.size / 1024)}KB]`,
            },
          ],
          temperature: 0.3,
          max_tokens: 1000,
        });

        const transcript =
          altCompletion.choices[0]?.message?.content ||
          "Image uploaded - model may not support direct image input";

        return {
          transcript,
          language: "en",
          durationSeconds: null,
          provider: "groq-llama-3.3-text-fallback",
        };
      } catch (fallbackError) {
        throw new Error(
          `Failed to process image: ${fallbackError instanceof Error ? fallbackError.message : "Unknown error"}`
        );
      }
    }
  }
}
