/**
 * Test script for M5StickC device API endpoint
 *
 * Usage:
 *   node test-device-api.js <audio-file-path> [api-key]
 *
 * Example:
 *   node test-device-api.js ./test-audio.wav my-secret-api-key
 */

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

// Configuration
const API_URL = process.env.API_URL || "http://localhost:3000";
const API_KEY = process.argv[3] || process.env.DEVICE_API_KEY || "test-api-key";
const AUDIO_FILE = process.argv[2];
const DEVICE_ID = "test-device-001";
const USERNAME = "test-user";

// Colors for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function testHealthCheck() {
  log("\n📡 Testing health check endpoint...", colors.blue);

  const url = new URL("/api/transcribe/device", API_URL);
  const protocol = url.protocol === "https:" ? https : http;

  return new Promise((resolve, reject) => {
    protocol
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode === 200) {
            log("✓ Health check passed", colors.green);
            console.log(JSON.parse(data));
            resolve(true);
          } else {
            log(`✗ Health check failed (${res.statusCode})`, colors.red);
            reject(new Error(`Status: ${res.statusCode}`));
          }
        });
      })
      .on("error", reject);
  });
}

async function uploadAudio(audioPath) {
  log(`\n🎤 Uploading audio file: ${audioPath}`, colors.blue);

  if (!fs.existsSync(audioPath)) {
    throw new Error(`Audio file not found: ${audioPath}`);
  }

  const stats = fs.statSync(audioPath);
  log(`   File size: ${(stats.size / 1024).toFixed(2)} KB`, colors.yellow);

  const audioBuffer = fs.readFileSync(audioPath);
  const boundary =
    "----WebKitFormBoundary" + Math.random().toString(36).substring(2);

  // Build multipart form data
  const parts = [];

  // Add audio file
  parts.push(`--${boundary}\r\n`);
  parts.push(
    `Content-Disposition: form-data; name="audio"; filename="${path.basename(audioPath)}"\r\n`
  );
  parts.push(`Content-Type: ${getContentType(audioPath)}\r\n\r\n`);
  parts.push(audioBuffer);
  parts.push("\r\n");

  // Add device_id
  parts.push(`--${boundary}\r\n`);
  parts.push(`Content-Disposition: form-data; name="device_id"\r\n\r\n`);
  parts.push(DEVICE_ID + "\r\n");

  // Add username
  parts.push(`--${boundary}\r\n`);
  parts.push(`Content-Disposition: form-data; name="username"\r\n\r\n`);
  parts.push(USERNAME + "\r\n");

  // End boundary
  parts.push(`--${boundary}--\r\n`);

  // Combine all parts
  const body = Buffer.concat(
    parts.map((part) =>
      Buffer.isBuffer(part) ? part : Buffer.from(part, "utf8")
    )
  );

  const url = new URL("/api/transcribe/device", API_URL);
  const protocol = url.protocol === "https:" ? https : http;

  const options = {
    hostname: url.hostname,
    port: url.port,
    path: url.pathname,
    method: "POST",
    headers: {
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
      "Content-Length": body.length,
      "x-api-key": API_KEY,
    },
  };

  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const req = protocol.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        const duration = Date.now() - startTime;

        try {
          const response = JSON.parse(data);

          if (res.statusCode === 200 && response.success) {
            log("\n✓ Upload successful!", colors.green);
            log(`   Processing time: ${duration}ms`, colors.yellow);
            log(`   Memo ID: ${response.memo_id}`, colors.yellow);
            log(`   Category: ${response.category}`, colors.yellow);
            log(
              `   Confidence: ${(response.confidence * 100).toFixed(1)}%`,
              colors.yellow
            );
            log(
              `   Needs review: ${response.needs_review ? "Yes" : "No"}`,
              colors.yellow
            );
            resolve(response);
          } else {
            log(`\n✗ Upload failed (${res.statusCode})`, colors.red);
            console.log(response);
            reject(new Error(response.error || "Upload failed"));
          }
        } catch (e) {
          log("\n✗ Invalid response format", colors.red);
          console.log(data);
          reject(e);
        }
      });
    });

    req.on("error", (error) => {
      log("\n✗ Request failed", colors.red);
      reject(error);
    });

    req.write(body);
    req.end();
  });
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    ".wav": "audio/wav",
    ".mp3": "audio/mpeg",
    ".webm": "audio/webm",
    ".ogg": "audio/ogg",
  };
  return types[ext] || "application/octet-stream";
}

// Main execution
async function main() {
  log("\n🚀 M5StickC Device API Test", colors.bright);
  log("================================", colors.bright);
  log(`API URL: ${API_URL}`, colors.yellow);
  log(`API Key: ${API_KEY.substring(0, 8)}...`, colors.yellow);
  log(`Device ID: ${DEVICE_ID}`, colors.yellow);
  log(`Username: ${USERNAME}`, colors.yellow);

  if (!AUDIO_FILE) {
    log("\n❌ Error: No audio file specified", colors.red);
    log(
      "\nUsage: node test-device-api.js <audio-file-path> [api-key]",
      colors.yellow
    );
    log(
      "Example: node test-device-api.js ./test.wav my-secret-key\n",
      colors.yellow
    );
    process.exit(1);
  }

  try {
    // Test health check
    await testHealthCheck();

    // Upload audio
    await uploadAudio(AUDIO_FILE);

    log("\n✅ All tests passed!", colors.green);
    log("================================\n", colors.bright);
    process.exit(0);
  } catch (error) {
    log(`\n❌ Test failed: ${error.message}`, colors.red);
    if (error.stack) {
      console.error(error.stack);
    }
    log("================================\n", colors.bright);
    process.exit(1);
  }
}

main();
