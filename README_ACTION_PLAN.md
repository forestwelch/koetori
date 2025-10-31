# Koetori Night-Shift Roadmap

## Vision Snapshot

- Capture audio from anywhere (web, future Bluetooth stick), turn it into structured, actionable knowledge.
- Keep the interface calm: subtle icons, light gradients, power when you need it.
- Automate the busywork: surface reminders, media cards, shopping lists, and product ideas without manual triage.

## Guiding Principles

- **Modular services:** isolate capture ➝ transcription ➝ understanding ➝ enrichment ➝ storage.
- **Actionability first:** every memo should either trigger a surface (list, reminder, calendar) or clearly require review.
- **Background automation:** lean on scheduled jobs/queues so the UI stays instant while enrichment happens asynchronously.
- **Personal configuration:** Forest-alike admins can remix categories, icons, prompts, and power modes without code.

## Phase 0 — UI Tightening (in flight)

- [x] Align category icons with the star treatment (minimal, gradient-tinted, no heavy chrome).
- [x] Tone down review badges to a purple outline icon only.
- [x] Replace size selector showcase with a compact segmented control.
- [ ] Ship mobile/desktop QA pass once the current polish lands.

> Hardware refresh paused for now — sprinting directly into the modular backend work.

## Phase 2 — Modular Backend Services

Goal: treat each step as a callable service instance (think PDS client pattern).

| Stage                    | Responsibility                                           | Notes                                                       |
| ------------------------ | -------------------------------------------------------- | ----------------------------------------------------------- |
| **CaptureService**       | Persist raw audio, metadata, provenance.                 | Handles chunking, auth, dedupe, queues next step.           |
| **TranscriptionService** | Turn audio into text (OpenAI, Whisper, etc.).            | Tokenize long audio, retries, store transcripts & excerpts. |
| **UnderstandingService** | Intent, category, size, entities.                        | Compose prompt(s), surface confidence, flag review needs.   |
| **EnrichmentService**    | Media metadata, reminder detection, shopping extraction. | Async jobs kicked via queue/cron.                           |
| **MemoWriter**           | Persist memos, derived records, audit trails.            | Handles memo splitting & optimistic updates.                |

Actions:

- [ ] Draft TypeScript interfaces for each service (inputs, outputs, errors).
- [ ] Define shared DTOs: `CapturePayload`, `TranscriptionJob`, `UnderstandingResult`, `EnrichmentTask`, `MemoWriteRequest`.
- [ ] Prototype orchestrator (`CapturePipeline.run()`) that emits structured progress events for optimistic UI updates.
- [ ] Introduce queue abstraction (Supabase functions, Cloudflare queues, or custom worker) and route enrichment tasks through it.
- [ ] Refactor existing `transcribe` API routes to thin controllers that hand work to the pipeline.
- [ ] Establish logging/metrics contract (latency, retries, failure notification hooks).

## Phase 3 — Automated Surfaces

### 3A. Media Library

- Background job scans memos daily, identifies media mentions (movie, game, book, music).
- Enrichment fetches metadata (title, year, runtime, art, ratings, streaming platforms) via public APIs (OMDb, IGDB, Google Books, etc.).
- Persist normalized `media_items` table linked to originating memos.
- UI: gallery of cards with quick actions (watch trailer, mark consumed, share).
- [ ] Spec enrichment worker contract (input: memo IDs + text snippets, output: `media_items`).
- [ ] Wire up first API client (OMDb) with caching + rate limit fallbacks.
- [ ] Design database schema for `media_items`, `media_availability`, `media_consumptions`.
- [ ] Build gallery view with grouped filters (type, mood, backlog status).

### 3B. Reminders & Tasks

- Add `reminder` intent/category with configurable recurrence and urgency.
- Service detects phrases like “remind me”, “don’t forget”, schedule options (ASAP, defer, snooze).
- Surface reminders in a power inbox and optional push/email/text pipeline.
- Allow quick deferral (`Later today`, `Tomorrow`, custom date).
- [ ] Extend understanding service to emit `ReminderIntent` payloads (title, due date, cadence, channel, urgency score).
- [ ] Create `reminders` table + state machine (pending, scheduled, sent, acknowledged, dismissed).
- [ ] Integrate notification adapters (email, SMS, push) behind a common interface.
- [ ] Build inbox widget with keyboard shortcuts (mark done, snooze, defer) and review analytics.

### 3C. Shopping & Lists

- Extract purchase candidates into a `shopping_list` surface grouped by type (groceries, upgrade, treat).
- Allow one-click completion, export to notes, or sync with external lists later.
- [ ] Define taxonomy for shopping categories + optional price/quantity metadata.
- [ ] Enrichment rules to capture store preference, urgency, recurring cadence.
- [ ] Create list UI with drag-to-reorder, multi-select complete, and export/share options.

## Phase 4 — Personal Knowledge Modes

- **Power Inbox:** first screen lists review-needed, pending reminders, suggested actions.
- **Category Studio:** settings pane to add/rename categories, assign icons (manual upload or AI-generated SVG), toggle visibility.
- **Prompt Tuner:** UI to edit prompt fragments per category/intent for power users.
- **App Ideas Mode:** dedicated view for “app feature” memos; offer auto-generated implementation README scaffolds by inspecting the codebase.
- **Health & Wellbeing Focus:** flag memos tagged health/sleep, surface as a mini-dashboard.
- **Tarot Repository:** allow recordings + notes per card, build encyclopedia view over time.
- [ ] Draft IA for Power Inbox (sections, ordering rules, badges, quick actions).
- [ ] Define schema + storage for custom categories & icons (Supabase storage vs. inline SVG).
- [ ] Add prompt management UI with versioning + rollback support.
- [ ] Outline tarot repository data model (cards, spreads, journal entries, audio attachments).
- [ ] Explore AI-assisted README generation pipeline tied to `App Ideas` memos.

## Phase 5 — Background Intelligence

- Nightly cron (or Supabase scheduled job) to:
  - Re-scan new/updated memos for enrichments.
  - Refresh media metadata & availability.
  - Recalculate reminder priorities based on time sensitivity.
  - Suggest category merges/splits based on usage.
- Lightweight service worker to cache key data offline and enqueue captures when offline.
- [ ] Choose cron runner (Supabase Scheduler vs. external worker) and document deployment + rotation.
- [ ] Implement idempotent jobs with checkpoints to avoid duplicate enrichment.
- [ ] Ship metrics dashboard (queue depth, job latency, enrichment completion rate, reminder response time).
- [ ] Prototype offline-first memo capture with service worker + IndexedDB queue syncing to CaptureService.

## Open Questions & Research Threads

- What BLE stack best fits (off-the-shelf vs. custom microcontroller)?
- Preferred queue/cron infrastructure (Supabase Edge Functions, Vercel Cron, external worker)?
- Data privacy constraints for third-party media APIs?
- UX for confirming auto-created reminders/shopping items – opt-in inbox vs. silent add?
- How to gate power/admin modes for Forest while keeping default UX simple?

## Next Up Tonight

1. Finish QA on updated iconography & size selector.
2. Sketch service interfaces + DTOs for Phase 2.
3. Start enrichment schema drafts (media + reminders + shopping).

_Jot here as you make overnight progress so Forest wakes up to a clear snapshot._
