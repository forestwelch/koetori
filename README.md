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

### 🚧 Phase 2: Voice Recording (In Progress)

- [ ] Add client-side component with 'use client'
- [ ] Request microphone permissions
- [ ] Implement MediaRecorder API
- [ ] Add start/stop recording functionality
- [ ] Store audio chunks and create Blob
- [ ] Display recording state (idle/recording/processing)
- [ ] Add visual feedback (animated button)
- [ ] Handle errors (no permissions, unsupported browser)

### ⏳ Phase 3: Backend API

- [ ] Create `/api/transcribe/route.ts`
- [ ] Handle multipart/form-data uploads
- [ ] Validate file type and size
- [ ] Add error handling
- [ ] Create health check endpoint

### ⏳ Phase 4: Audio Upload

- [ ] Convert audio Blob to FormData
- [ ] POST to `/api/transcribe` endpoint
- [ ] Show loading/processing state
- [ ] Display transcription result
- [ ] Handle upload errors with user-friendly messages

### ⏳ Phase 5: Transcription Service

- [ ] Choose transcription service (OpenAI Whisper API recommended)
- [ ] Add API keys to environment variables
- [ ] Implement transcription wrapper
- [ ] Handle audio format conversion if needed
- [ ] Add rate limiting and error handling

### ⏳ Phase 6: UI Polish

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
