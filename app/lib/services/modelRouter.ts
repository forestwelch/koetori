/**
 * Model Router - Selects the most efficient and cost-effective model
 * for each input type (text, audio, image)
 */

export interface ModelConfig {
  model: string;
  provider: string;
  fallback?: string; // Optional fallback model if primary fails
}

export interface TranscriptionModelConfig extends ModelConfig {
  // Audio-specific config
  language?: string;
  responseFormat?: string;
}

export interface VisionModelConfig extends ModelConfig {
  // Vision-specific config
  maxTokens?: number;
  temperature?: number;
}

/**
 * Router for selecting optimal models based on input type
 *
 * Cost/Performance considerations:
 * - Text: No transcription needed (free, instant)
 * - Audio: Whisper is specialized and cost-effective for audio
 * - Image: Vision models are needed, but vary in cost/speed
 */
export class ModelRouter {
  /**
   * Get the optimal model configuration for audio transcription
   * Uses Whisper which is specialized for speech-to-text
   */
  static getAudioModel(): TranscriptionModelConfig {
    return {
      model: "whisper-large-v3-turbo",
      provider: "groq-whisper-large-v3-turbo",
      language: "en",
      responseFormat: "json",
    };
  }

  /**
   * Get the optimal model configuration for image processing
   * Uses official Groq vision models as per https://console.groq.com/docs/vision
   */
  static getImageModel(): VisionModelConfig {
    // Official Groq vision models:
    // - meta-llama/llama-4-scout-17b-16e-instruct (primary)
    // - meta-llama/llama-4-maverick-17b-128e-instruct (fallback)

    const primaryModel =
      process.env.GROQ_VISION_MODEL ||
      "meta-llama/llama-4-scout-17b-16e-instruct";
    const fallbackModel =
      process.env.GROQ_VISION_FALLBACK ||
      "meta-llama/llama-4-maverick-17b-128e-instruct";

    return {
      model: primaryModel,
      provider: `groq-${primaryModel}`,
      fallback: fallbackModel,
      maxTokens: 1500,
      temperature: 0.3,
    };
  }

  /**
   * Get the optimal model configuration for text understanding/categorization
   * Uses the versatile model that's good for general text processing
   */
  static getTextModel(): ModelConfig {
    return {
      model: "llama-3.3-70b-versatile",
      provider: "groq-llama-3.3-70b-versatile",
    };
  }

  /**
   * Check if a model name is a vision-capable model
   */
  static isVisionModel(model: string): boolean {
    return (
      model.includes("vision") ||
      model.includes("maverick") ||
      model.includes("llama-4")
    );
  }

  /**
   * Get model info for logging/monitoring
   */
  static getModelInfo(inputType: "text" | "audio" | "image"): {
    model: string;
    provider: string;
    costTier: "free" | "low" | "medium" | "high";
  } {
    switch (inputType) {
      case "text":
        return {
          model: "direct",
          provider: "direct",
          costTier: "free", // No API call needed
        };
      case "audio":
        const audioConfig = this.getAudioModel();
        return {
          model: audioConfig.model,
          provider: audioConfig.provider,
          costTier: "low", // Whisper is cost-effective
        };
      case "image":
        const imageConfig = this.getImageModel();
        return {
          model: imageConfig.model,
          provider: imageConfig.provider,
          costTier: "medium", // Vision models are more expensive
        };
    }
  }
}
