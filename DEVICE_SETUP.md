# M5StickC PLUS Device Setup Guide

This guide explains how to set up and test the device API endpoint for M5StickC PLUS voice recordings.

## Prerequisites

1. M5StickC PLUS 2 device (or PLUS 1)
2. Arduino IDE or PlatformIO installed
3. USB-C cable for programming

## Server Setup

### 1. Environment Variable Configuration

Add the following environment variable to your deployment (Vercel, Netlify, etc.) or local `.env.local` file:

```env
DEVICE_API_KEY=your-secure-random-key-here
```

**Generate a secure API key:**

```bash
# On macOS/Linux:
openssl rand -hex 32

# Or use Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. API Endpoint

The device endpoint is available at:

```
POST /api/transcribe/device
```

**Required Headers:**

- `x-api-key`: Your device API key

**Form Data:**

- `audio`: Audio file (WAV, MP3, WebM, or OGG)
- `device_id` (optional): Unique identifier for your device
- `username` (optional): User to associate memo with (defaults to "device_user")

**Response:**

```json
{
  "success": true,
  "memo_id": "uuid-here",
  "category": "journal",
  "confidence": 0.85,
  "needs_review": false,
  "processing_time_ms": 2500
}
```

## Testing Without Hardware

### Using curl

Test with an existing audio file:

```bash
# Health check
curl http://localhost:3000/api/transcribe/device

# Upload audio file
curl -X POST \
  -H "x-api-key: your-secure-random-key-here" \
  -F "audio=@test.wav" \
  -F "device_id=test-device-001" \
  -F "username=your-username" \
  http://localhost:3000/api/transcribe/device
```

### Using Node.js Test Script

See `test-device-api.js` for a complete testing example.

## M5StickC PLUS Setup

### Hardware Wiring

The M5StickC PLUS 2 has a built-in microphone (no additional wiring needed).

### Arduino Firmware

1. Install M5StickCPlus library in Arduino IDE
2. Configure WiFi credentials
3. Set DEVICE_API_KEY constant
4. Flash the firmware (see `m5stick-firmware` directory)

### Basic Firmware Flow

```cpp
// 1. Button press → Start recording
// 2. Record audio to buffer (SPM1423 mic)
// 3. Save to SPIFFS as WAV file
// 4. Check WiFi connection
// 5. POST audio file to API endpoint
// 6. Delete local file on success
// 7. Sleep until next button press
```

## Troubleshooting

### API Returns 401 Unauthorized

- Check that `DEVICE_API_KEY` environment variable is set
- Verify the `x-api-key` header matches the environment variable

### API Returns 400 Bad Request

- Check audio file format (WAV, MP3, WebM, OGG supported)
- Verify file size is under 10MB
- Ensure audio file is not corrupted

### Device Cannot Connect to WiFi

- Verify WiFi credentials in firmware
- Check WiFi signal strength
- Try mobile hotspot as alternative

### Audio Not Transcribing

- Test with a longer recording (at least 2-3 seconds)
- Speak clearly and at normal volume
- Check microphone is not obstructed

## Production Deployment

1. Deploy your Next.js app with the new endpoint
2. Set `DEVICE_API_KEY` in production environment
3. Update firmware with production API URL
4. Test end-to-end before deploying to device

## Security Notes

- **Never commit** the `DEVICE_API_KEY` to version control
- Rotate the API key periodically
- Consider rate limiting if deploying multiple devices
- Use HTTPS in production (required for security)

## Next Steps

Once hardware arrives:

1. Install Arduino IDE and M5Stack libraries
2. Write firmware to handle button press → record → upload
3. Flash firmware to device
4. Test full end-to-end flow
5. Optimize battery life (deep sleep between recordings)
