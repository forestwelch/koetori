# Koetori - Voice Transcription App

A Next.js-based voice transcription application with a sleek dark theme design.

> **Koetori** (声取り) = **koe** (voice) + **tori** (take/capture). Also means "voice bird" 🐦

---

## Current Status

### ✅ Phase 1: Project Setup (Complete)

- [x] Initialize Next.js with TypeScript and Tailwind
- [x] Set up dark theme design system
- [x] Create basic UI structure
- [x] Initialize Git repository

### ✅ Phase 2: Voice Recording (Complete)

- [x] Add client-side component with 'use client'
- [x] Request microphone permissions
- [x] Implement MediaRecorder API
- [x] Add start/stop recording functionality
- [x] Store audio chunks and create Blob
- [x] Display recording state (idle/recording/processing)
- [x] Add visual feedback (animated button)
- [x] Handle errors (no permissions, unsupported browser)
- [x] Refactor into reusable components and hooks

### ✅ Phase 3: Backend API (Complete)

- [x] Create `/api/transcribe/route.ts`
- [x] Handle multipart/form-data uploads
- [x] Validate file type and size
- [x] Add error handling
- [x] Create health check endpoint

### ✅ Phase 4: Audio Upload (Complete)

- [x] Convert audio Blob to FormData
- [x] POST to `/api/transcribe` endpoint
- [x] Show loading/processing state
- [x] Display transcription result
- [x] Handle upload errors with user-friendly messages

### ✅ Phase 5: Transcription Service (Complete)

- [x] Choose transcription service (Groq Whisper)
- [x] Add API keys to environment variables
- [x] Implement transcription wrapper
- [x] Handle audio format conversion if needed
- [x] Add rate limiting and error handling

### ✅ Phase 6: UI Polish (Complete)

- [x] Add recording visualization (audio level meter with frequency analysis)
- [x] Add copy-to-clipboard functionality
- [x] Improve mobile responsiveness (responsive breakpoints for all components)
- [x] Add keyboard shortcuts (Space bar to start/stop recording)
- [x] Implement accessibility (ARIA labels, roles, live regions)
- [x] Add loading animations (pulse effects on record button)
- [x] Add recording timer (MM:SS format)
- [x] Add clear transcription button
- [x] Add keyboard shortcut hints

### ✅ Phase 7: Error Handling & Production (Complete)

- [x] Comprehensive error handling (retry logic with exponential backoff)
- [x] Input validation (file type, size, duration estimates)
- [x] File size/duration limits (10MB, 5 minutes)
- [x] Rate limiting (10 requests per minute per IP)
- [x] Logging and monitoring (structured JSON logging)
- [x] Performance optimization (retry logic, timeout handling)
- [x] Environment variable validation
- [x] Client-side recording limits with auto-stop

### ✅ Phase 8: Smart Categorization (Complete)

**Goal:** Add AI-powered categorization to transcriptions. Auto-save high-confidence results, flag low-confidence ones for review.

**Cost:** FREE (Groq for both transcription + categorization, Supabase free tier for storage)

#### Category System ✅

- **media**: Movie/book/show/podcast recommendations
- **event**: Calendar events, meetings, plans
- **journal**: Personal thoughts/reflections
- **therapy**: Therapy insights
- **tarot**: Tarot readings
- **todo**: Tasks/action items
- **idea**: Ideas to explore
- **other**: Catch-all

#### Features ✅

- [x] Set up Supabase database (free tier)
- [x] Create memos table schema
- [x] Add Groq-based AI categorization
- [x] Extract structured data (title, who, when, where, what)
- [x] Confidence scoring (0.0-1.0)
- [x] Auto-flag low-confidence items for review
- [x] Generate relevant tags
- [x] Save memos to database
- [x] Display category badges with color coding
- [x] Show confidence indicator
- [x] Display extracted structured data
- [x] Create history/review page
- [x] Filter by category and review status
- [x] Implement category-specific color themes

#### Extracted Data Fields ✅

- `title`: Main subject or item name
- `who`: People mentioned
- `when`: Date/time information
- `where`: Location mentioned
- `what`: Brief summary
- `actionable`: Requires follow-up action
- `tags`: Generated keywords

### ✅ Phase 9: User Authentication (Complete)

**Goal:** Add simple username-based authentication for multi-user support.

#### Features ✅

- [x] Simple username + secret word authentication
- [x] Local storage for seamless return visits
- [x] Multi-device support (same username, different secret words)
- [x] User isolation (users only see their own memos)
- [x] Friendly signup/login flow with fun interactions
- [x] Logout functionality
- [x] Database migration for existing data
- [x] Username availability checking
- [x] Interactive Koetori name explanation with Japanese etymology

#### User Experience ✅

- **First visit**: Enter username, set secret word if new
- **Return visits**: Auto-login from localStorage
- **Username taken**: Fun secret word challenge
- **Multi-device**: Same username works across devices with secret word
- **Clickable branding**: Interactive explanation of "Koetori" name and meaning

---

## Production Features

### Rate Limiting

- **10 requests per minute** per IP address
- Automatic rate limit headers in API responses
- Client-friendly error messages with retry timing

### Error Handling

- **Automatic retry** on server errors (up to 3 attempts)
- Exponential backoff with 2-second delays
- User-friendly error messages for all failure scenarios
- Structured error logging with stack traces

### Recording Limits

- **Maximum file size**: 10MB
- **Maximum duration**: 5 minutes (auto-stop)
- **Timer display**: Shows MM:SS format
- Client-side validation before upload

### Security & Validation

- File type validation (audio formats only)
- Size validation before processing
- Environment variable validation on startup
- Input sanitization

### Logging & Monitoring

- Structured JSON logging
- Request/response timing
- Client identification (IP-based)
- Error tracking with stack traces
- Rate limit monitoring

---

## Quick Start

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`
