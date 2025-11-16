import Groq from "groq-sdk";
import {
  CaptureRequest,
  TranscriptionJob,
  TranscriptionResult,
} from "../pipeline/types";
import { TranscriptionService } from "../pipeline/interfaces";
import { ModelRouter } from "./modelRouter";

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

    // Get optimal audio model configuration
    const modelConfig = ModelRouter.getAudioModel();

    const transcription = await groq.audio.transcriptions.create({
      file,
      model: modelConfig.model,
      language: modelConfig.language ?? "en",
      response_format: (modelConfig.responseFormat ?? "json") as
        | "json"
        | "text"
        | "verbose_json",
    });

    const wordEstimate = transcription.text?.length ?? 0;

    return {
      transcript: transcription.text,
      language: "en", // We specify language in the request
      durationSeconds:
        wordEstimate > 0 ? Math.round(wordEstimate / 150) * 60 : null,
      provider: modelConfig.provider,
    };
  }

  private async transcribeImage(
    request: CaptureRequest
  ): Promise<TranscriptionResult> {
    if (!request.imageFile) {
      throw new Error("No image file provided");
    }

    // Get optimal vision model configuration
    const modelConfig = ModelRouter.getImageModel();

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

    // Try primary vision model
    try {
      const completion = await groq.chat.completions.create({
        model: modelConfig.model,
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
        temperature: modelConfig.temperature ?? 0.3,
        max_tokens: modelConfig.maxTokens ?? 1500,
      });

      const transcript =
        completion.choices[0]?.message?.content ||
        "Unable to process image. Vision support may not be available in this model.";

      return {
        transcript,
        language: "en",
        durationSeconds: null,
        provider: modelConfig.provider,
      };
    } catch (error) {
      // If primary model fails and we have a fallback, try it
      if (modelConfig.fallback) {
        console.warn(
          `Primary vision model ${modelConfig.model} failed, trying fallback ${modelConfig.fallback}:`,
          error
        );

        try {
          const fallbackCompletion = await groq.chat.completions.create({
            model: modelConfig.fallback,
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
            temperature: modelConfig.temperature ?? 0.3,
            max_tokens: modelConfig.maxTokens ?? 1500,
          });

          const transcript =
            fallbackCompletion.choices[0]?.message?.content ||
            "Unable to process image with fallback model.";

          return {
            transcript,
            language: "en",
            durationSeconds: null,
            provider: `groq-${modelConfig.fallback}`,
          };
        } catch (fallbackError) {
          throw new Error(
            `Failed to process image with both primary (${modelConfig.model}) and fallback (${modelConfig.fallback}) models: ${fallbackError instanceof Error ? fallbackError.message : "Unknown error"}`
          );
        }
      }

      // No fallback available, throw the original error
      throw new Error(
        `Failed to process image with model ${modelConfig.model}: ${error instanceof Error ? error.message : "Unknown error"}. Make sure you're using a vision-capable model.`
      );
    }
  }
}
