// Environment variable validation

export function validateEnv() {
  const required = ["GROQ_API_KEY"];
  const missing: string[] = [];

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}\n` +
        `Please check your .env.local file.`
    );
  }

  return true;
}

export function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];

  if (!value) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is not set`);
  }

  return value;
}

// Validate on import in development
if (process.env.NODE_ENV === "development") {
  try {
    validateEnv();
    console.log("✅ Environment variables validated");
  } catch (error) {
    console.error("❌ Environment validation failed:");
    console.error(error);
  }
}
