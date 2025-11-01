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

    return { request };
  }

  async transcribe(job: TranscriptionJob): Promise<TranscriptionResult> {
    const { request } = job;

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
}
