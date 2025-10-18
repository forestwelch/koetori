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

### 🚧 Phase 6: UI Polish (In Progress)

- [ ] Add recording visualization (waveform/pulse animation)
- [ ] Create transcription history component
- [ ] Add copy-to-clipboard functionality
- [ ] Improve mobile responsiveness
- [ ] Add keyboard shortcuts
- [ ] Implement accessibility (ARIA labels)
- [ ] Add loading animations

### ⏳ Phase 7: Error Handling & Production

- [ ] Comprehensive error handling
- [ ] Input validation
- [ ] File size/duration limits
- [ ] Rate limiting
- [ ] Logging and monitoring
- [ ] Cleanup temporary files
- [ ] Performance optimization

---

## Quick Start

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`
