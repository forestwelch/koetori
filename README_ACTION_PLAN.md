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

## Phase 1 — Capture Hardware & Ingestion

1. **Retire M5C Plus flow**
   - Document pain points (battery, latency, file length limits).
   - Archive current device API usage for reference.
2. **Plan Bluetooth stick replacement**
   - Research off-the-shelf BLE audio recorders that can stream or bulk-send >15 min audio.
   - Decide on custom firmware vs. mobile relay approach.
3. **Unified ingestion endpoint**
   - Define a single `/api/capture` surface that accepts: web uploads, device pushes, future SDK clients.
   - Normalize payload shape (metadata, source, auth, chunk strategy).

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

- [ ] Sketch TypeScript interfaces + folder layout for each service.
- [ ] Add lightweight orchestrator (e.g., `CapturePipeline.run()` calling services).
- [ ] Introduce queue abstraction (Supabase functions, Cloudflare queues, etc.) for enrichment.

## Phase 3 — Automated Surfaces

### 3A. Media Library

- Background job scans memos daily, identifies media mentions (movie, game, book, music).
- Enrichment fetches metadata (title, year, runtime, art, ratings, streaming platforms) via public APIs (OMDb, IGDB, Google Books, etc.).
- Persist normalized `media_items` table linked to originating memos.
- UI: gallery of cards with quick actions (watch trailer, mark consumed, share).

### 3B. Reminders & Tasks

- Add `reminder` intent/category with configurable recurrence and urgency.
- Service detects phrases like “remind me”, “don’t forget”, schedule options (ASAP, defer, snooze).
- Surface reminders in a power inbox and optional push/email/text pipeline.
- Allow quick deferral (`Later today`, `Tomorrow`, custom date).

### 3C. Shopping & Lists

- Extract purchase candidates into a `shopping_list` surface grouped by type (groceries, upgrade, treat).
- Allow one-click completion, export to notes, or sync with external lists later.

## Phase 4 — Personal Knowledge Modes

- **Power Inbox:** first screen lists review-needed, pending reminders, suggested actions.
- **Category Studio:** settings pane to add/rename categories, assign icons (manual upload or AI-generated SVG), toggle visibility.
- **Prompt Tuner:** UI to edit prompt fragments per category/intent for power users.
- **App Ideas Mode:** dedicated view for “app feature” memos; offer auto-generated implementation README scaffolds by inspecting the codebase.
- **Health & Wellbeing Focus:** flag memos tagged health/sleep, surface as a mini-dashboard.
- **Tarot Repository:** allow recordings + notes per card, build encyclopedia view over time.

## Phase 5 — Background Intelligence

- Nightly cron (or Supabase scheduled job) to:
  - Re-scan new/updated memos for enrichments.
  - Refresh media metadata & availability.
  - Recalculate reminder priorities based on time sensitivity.
  - Suggest category merges/splits based on usage.
- Lightweight service worker to cache key data offline and enqueue captures when offline.

## Open Questions & Research Threads

- What BLE stack best fits (off-the-shelf vs. custom microcontroller)?
- Preferred queue/cron infrastructure (Supabase Edge Functions, Vercel Cron, external worker)?
- Data privacy constraints for third-party media APIs?
- UX for confirming auto-created reminders/shopping items – opt-in inbox vs. silent add?
- How to gate power/admin modes for Forest while keeping default UX simple?

## Next Up Tonight

1. Finish QA on updated iconography & size selector.
2. Draft CaptureService/TranscriptionService interfaces.
3. Inventory existing memos to understand enrichment opportunities (media vs. tasks vs. app ideas).

_Jot here as you make overnight progress so Forest wakes up to a clear snapshot._
