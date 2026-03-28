# Bubloo — Technical Specification

**Status:** Final Draft for Ralphthon
**Date:** 2026-03-28
**Stack:** Next.js 14 (App Router) + Supabase (PostgreSQL) + Tailwind CSS + OpenAI Responses API
**Auth:** None for demo, `device_id` stored in `localStorage`
**Deployment:** Vercel

---

## Table of Contents

1. [Product Summary](#1-product-summary)
2. [Hackathon Fit](#2-hackathon-fit)
3. [Tech Stack](#3-tech-stack)
4. [Navigation Structure](#4-navigation-structure)
5. [Database Schema](#5-database-schema)
6. [API Endpoints](#6-api-endpoints)
7. [Screen Specifications](#7-screen-specifications)
8. [AI Integration](#8-ai-integration)
9. [Voice Note (STT)](#9-voice-note-stt)
10. [Data Model (TypeScript)](#10-data-model-typescript)
11. [Component Tree](#11-component-tree)
12. [Acceptance Criteria](#12-acceptance-criteria)
13. [Demo Seed Data](#13-demo-seed-data)
14. [Environment Variables](#14-environment-variables)
15. [Open Items](#15-open-items)

---

## 1. Product Summary

Bubloo is a low-anxiety care logging and caregiver handoff app for newborn parents. Parents leave tiny care notes in seconds. Bubloo turns sparse logs into a calm, caregiver-ready handoff for the next caregiver.

**This is not a tracking dashboard. It is a reassurance and handoff tool.**

Core product behavior:

- `Now` shows only the most important current state
- `Log` makes care events extremely fast to record
- `Timeline` shows recent raw context
- `Handoff` is where Codex interprets sparse logs into a calm handoff

---

## 2. Hackathon Fit

Bubloo is designed to fit:

- **Statement 1: Codex-Powered Services**
  - Codex is the engine behind the handoff experience
  - The product value comes from Codex interpreting sparse baby-care logs into caregiver-ready summaries
- **Statement 3: AI Applications**
  - Bubloo is a polished AI-powered consumer app with a clear real-world use case

Codex is not a garnish or optional feature. The `Handoff` tab is the primary product surface where Codex output is shown.

---

## 3. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Database | Supabase (PostgreSQL) |
| Styling | Tailwind CSS |
| AI (Handoff) | OpenAI Responses API with `gpt-5.2-codex` |
| STT (Voice Notes) | OpenAI Audio Transcriptions API with `gpt-4o-mini-transcribe` |
| Auth | None — localStorage `device_id` |
| Deployment | Vercel |
| Language | TypeScript |

Notes:

- Responses API is used for all new AI generation flows
- Codex powers the `Handoff` tab generation flow
- STT is optional for demo, but supported for note input

---

## 4. Navigation Structure

**Bottom Tab Bar (left to right):**

| Index | Tab | Route | Description |
|-------|-----|-------|-------------|
| 0 | Now | `/` | Minimal current-state surface |
| 1 | Log | `/log` | Fast care-event entry |
| 2 | Timeline | `/timeline` | Reverse-chronological recent logs |
| 3 | Handoff | `/handoff` | Codex-generated caregiver handoff |

Rules:

- Bottom tab bar is always visible
- Tab tap jumps directly to screen
- Swipe navigation is optional, not required for MVP
- No separate Settings tab in bottom nav
- Optional caregiver/settings entry can live in the top-right header area

---

## 5. Database Schema

### Table: `devices`

Identifies a demo device. No real auth.

```sql
CREATE TABLE devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Table: `care_logs`

All care events in one table.

```sql
CREATE TABLE care_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('feeding', 'sleep_start', 'wake', 'diaper', 'note')),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- optional feeding field
  amount_ml INTEGER,

  -- optional free-form note
  note TEXT,

  -- metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_care_logs_device_timestamp ON care_logs(device_id, timestamp DESC);
CREATE INDEX idx_care_logs_device_type ON care_logs(device_id, type);
```

### Table: `handoffs`

Stores Codex-generated handoff results.

```sql
CREATE TABLE handoffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,

  headline TEXT NOT NULL,
  summary_text TEXT NOT NULL,
  keep_in_mind_today JSONB NOT NULL DEFAULT '[]'::jsonb,
  why_this_summary JSONB NOT NULL DEFAULT '[]'::jsonb,
  suggested_next_step TEXT NOT NULL,
  copy_text TEXT,

  source_log_count INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_handoffs_device_created ON handoffs(device_id, created_at DESC);
```

### Supabase RLS

For the demo, RLS may remain disabled. All reads and writes are filtered by `device_id`.

---

## 6. API Endpoints

All endpoints are implemented as Next.js Route Handlers under `/app/api/`.

### POST `/api/device`

Create a device record for first-time demo usage.

**Response**
```json
{ "id": "uuid" }
```

### POST `/api/logs`

Create a care log entry.

**Request**
```json
{
  "device_id": "uuid",
  "type": "feeding",
  "timestamp": "2026-03-28T14:30:00Z",
  "amount_ml": 120,
  "note": "a little fussy before sleep"
}
```

Allowed `type` values:

- `feeding`
- `sleep_start`
- `wake`
- `diaper`
- `note`

### GET `/api/logs?device_id={uuid}&range=8h&limit=20&offset=0`

Get reverse-chronological logs for the `Timeline` tab.

### GET `/api/current-state?device_id={uuid}`

Return minimal current-state data for the `Now` tab.

Server logic:

1. Look at logs from the last 6 hours
2. Find latest feed
3. Derive sleep status from latest `sleep_start` / `wake`
4. Find latest diaper
5. Find most recent note
6. Return reassurance copy

**Response**
```json
{
  "lastFeed": { "timestamp": "ISO", "amount_ml": 120, "relative_text": "40m ago" },
  "sleepStatusText": "Asleep for 25m",
  "lastDiaper": { "timestamp": "ISO", "relative_text": "1h ago" },
  "recentNote": { "timestamp": "ISO", "note": "A little fussy before sleep" },
  "reassuranceText": "Today, this is enough."
}
```

### POST `/api/handoff`

Generate a Codex-powered handoff.

**Request**
```json
{
  "device_id": "uuid"
}
```

Server logic:

1. Query logs from the last 8 hours
2. Normalize them into a compact handoff context
3. Call OpenAI Responses API with `gpt-5.2-codex`
4. Ask Codex to return structured JSON
5. Save output into `handoffs`
6. Return generated handoff

**Response**
```json
{
  "id": "uuid",
  "headline": "Bubloo update",
  "summary_text": "Recently fed, diaper changed, and baby fell asleep after being a little fussy.",
  "keep_in_mind_today": [
    "May wake soon",
    "Soothing may help before the next feed"
  ],
  "why_this_summary": [
    "Last feed: 40m ago",
    "Sleep started: 25m ago",
    "Recent note: a little fussy before sleep"
  ],
  "suggested_next_step": "If awake, soothe first and then prepare for the next feed.",
  "copy_text": "Bubloo update: recently fed, diaper changed, and baby fell asleep after being a little fussy...",
  "source_log_count": 6,
  "created_at": "ISO"
}
```

### GET `/api/handoff/latest?device_id={uuid}`

Return the latest saved handoff for the device.

### POST `/api/transcribe`

Optional voice note transcription endpoint.

**Input**
- `multipart/form-data`
- `audio`
- `device_id`

**Output**
```json
{ "text": "transcribed text" }
```

---

## 7. Screen Specifications

### Screen 1: Now (`/`)

Purpose:

- show only the most important current state
- reassure the caregiver
- provide the fastest path to logging

Layout:

1. **Header**
   - Bubloo wordmark
   - short reassuring subcopy
2. **Current State Card**
   - last feed
   - sleep status
   - last diaper
   - recent note
3. **Reassurance line**
   - example: "Today, this is enough."
4. **Quick Actions**
   - Feed
   - Sleep
   - Wake
   - Diaper
   - Note

Important:

- No recent timeline preview here
- No analytics
- No create-handoff CTA here
- Screen should be glanceable in under 5 seconds

### Screen 2: Log (`/log`)

Purpose:

- make care-event logging extremely fast

Layout:

1. **Header** — "Quick Log"
2. **Type Actions**
   - Feed
   - Sleep
   - Wake
   - Diaper
   - Note
3. **Dynamic Input Surface**
   - Feed: optional amount + optional note
   - Sleep: one-tap `sleep_start`
   - Wake: one-tap `wake`
   - Diaper: one-tap `diaper`
   - Note: text area and optional voice transcription
4. **Primary Action**
   - `Save log`

Rules:

- Sleep, Wake, Diaper can be instant-save or near one-tap
- Feed and Note can use bottom sheets
- All logging flows should finish in 5 to 10 seconds

### Screen 3: Timeline (`/timeline`)

Purpose:

- show the recent flow of raw care events
- provide context before the handoff

Layout:

1. **Header** — "Timeline"
2. **Range Filter**
   - 3h
   - 6h
   - 8h
3. **Event List**
   - reverse chronological
   - event type
   - absolute or relative time
   - optional short detail
4. **Bottom CTA**
   - optional `Open handoff`

Avoid:

- charts
- graphs
- percentages
- long-term analytics

### Screen 4: Handoff (`/handoff`)

Purpose:

- generate the core Codex-powered handoff moment
- show how Codex interprets sparse logs into a caregiver-ready summary
- help the next caregiver understand what matters in under 10 seconds

Layout:

1. **Header**
   - title: `Handoff`
   - subtitle indicating this is a Codex-generated handoff
2. **Primary AI Summary Card**
   - headline
   - calm summary paragraph
3. **What to keep in mind today**
   - 2 to 3 calm, practical handoff points
4. **Suggested next step**
   - one non-medical next action
5. **Why this summary**
   - 2 to 3 source-context items used by Codex
6. **Actions**
   - Copy handoff
   - Refresh with latest logs

Rules:

- This tab must feel clearly different from `Now`
- `Now` shows state
- `Handoff` shows Codex interpretation
- No full timeline here
- No scores, charts, or analytics
- No chatbot UI

---

## 8. AI Integration

### Why Codex

Codex is the engine behind Bubloo's handoff experience. Bubloo uses Codex to:

- read sparse logs
- decide what matters most
- transform fragmented events into a caregiver-ready handoff
- explain why that handoff was generated
- stay calm and non-medical

### API Choice

Use the **Responses API** for all new AI generation. It is the recommended API for new model-response workflows.

### Model

- **Handoff generation:** `gpt-5.2-codex`
- **Voice transcription:** `gpt-4o-mini-transcribe`

### Handoff Prompt Shape

**Developer instructions**

```text
You are Bubloo's calm handoff engine.

Your job is to read sparse baby-care logs and produce a caregiver-ready handoff.

Rules:
- Write in a calm, warm, low-anxiety tone
- Never give medical advice or diagnoses
- Never invent facts not supported by logs or notes
- Focus on what the next caregiver should know now
- Keep the output brief and mobile-friendly
- "What to keep in mind today" should be practical and gentle
- "Suggested next step" must be a single, non-medical action
- "Why this summary" should show 2-3 source-context items in plain language

Return valid JSON only.
```

**Expected structured output**

```json
{
  "headline": "Bubloo update",
  "summary_text": "Recently fed, diaper changed, and baby fell asleep after being a little fussy.",
  "keep_in_mind_today": [
    "May wake soon",
    "Soothing may help before the next feed"
  ],
  "why_this_summary": [
    "Last feed: 40m ago",
    "Sleep started: 25m ago",
    "Recent note: a little fussy before sleep"
  ],
  "suggested_next_step": "If awake, soothe first and then prepare for the next feed."
}
```

---

## 9. Voice Note (STT)

Voice note transcription is optional for MVP but can strengthen the demo.

Flow:

1. User taps mic in Note input
2. Browser records audio using `MediaRecorder`
3. Client uploads audio to `/api/transcribe`
4. Server calls the OpenAI transcription API
5. Returned text populates the note field
6. User edits if needed, then saves

Constraints:

- Max recording length: 60 seconds
- Supported formats: `webm`, `wav`, `m4a`, `mp3`
- Failure fallback: manual typing

---

## 10. Data Model (TypeScript)

```ts
type CareLogType = "feeding" | "sleep_start" | "wake" | "diaper" | "note";

interface CareLogEntry {
  id: string;
  device_id: string;
  type: CareLogType;
  timestamp: string;
  amount_ml?: number | null;
  note?: string | null;
  created_at: string;
}

interface CurrentStateResponse {
  lastFeed: {
    timestamp: string;
    amount_ml: number | null;
    relative_text: string;
  } | null;
  sleepStatusText: string;
  lastDiaper: {
    timestamp: string;
    relative_text: string;
  } | null;
  recentNote: {
    timestamp: string;
    note: string;
  } | null;
  reassuranceText: string;
}

interface Handoff {
  id: string;
  device_id: string;
  headline: string;
  summary_text: string;
  keep_in_mind_today: string[];
  why_this_summary: string[];
  suggested_next_step: string;
  copy_text?: string | null;
  source_log_count: number;
  created_at: string;
}

interface AppClientState {
  deviceId: string | null;
  currentState: CurrentStateResponse | null;
  latestHandoff: Handoff | null;
  activeTab: 0 | 1 | 2 | 3;
}
```

---

## 11. Component Tree

```text
app/
├── layout.tsx
├── page.tsx                      # Now
├── log/
│   └── page.tsx
├── timeline/
│   └── page.tsx
├── handoff/
│   └── page.tsx
├── api/
│   ├── device/route.ts
│   ├── logs/route.ts
│   ├── current-state/route.ts
│   ├── handoff/
│   │   ├── route.ts
│   │   └── latest/route.ts
│   └── transcribe/route.ts
└── components/
    ├── BottomTabBar.tsx
    ├── CurrentStateCard.tsx
    ├── ReassuranceText.tsx
    ├── QuickActionButton.tsx
    ├── FeedInputSheet.tsx
    ├── NoteInputSheet.tsx
    ├── VoiceRecorder.tsx
    ├── TimelineList.tsx
    ├── TimelineRow.tsx
    ├── HandoffSummaryCard.tsx
    ├── KeepInMindList.tsx
    ├── WhyThisSummary.tsx
    ├── SuggestedNextStep.tsx
    ├── PrimaryButton.tsx
    └── LoadingSkeleton.tsx
```

---

## 12. Acceptance Criteria

### AC-01: Device Bootstrapping

- [ ] First app load creates or restores `device_id`
- [ ] Subsequent requests reuse the same `device_id`

### AC-02: Now Tab

- [ ] Shows only last feed, sleep status, last diaper, recent note
- [ ] Shows reassurance copy
- [ ] Shows 5 quick action buttons
- [ ] Contains no charts, no timeline preview, and no handoff CTA

### AC-03: Quick Log

- [ ] Feed, Sleep, Wake, Diaper, Note can all be logged
- [ ] One-tap events save quickly
- [ ] Feed amount is optional
- [ ] Note supports manual text
- [ ] Voice transcription is supported or gracefully skipped

### AC-04: Timeline

- [ ] Shows reverse-chronological logs
- [ ] Supports 3h / 6h / 8h ranges
- [ ] Shows raw context without analytics

### AC-05: Handoff Generation

- [ ] Handoff tab generates a Codex-powered summary from recent logs
- [ ] Output includes `summary_text`
- [ ] Output includes `keep_in_mind_today`
- [ ] Output includes `suggested_next_step`
- [ ] Output includes `why_this_summary`
- [ ] Output fits within a single mobile view

### AC-06: Calm Tone

- [ ] Output is warm and non-judgmental
- [ ] No diagnostic language
- [ ] No warning-heavy phrasing
- [ ] Missing data is handled gently

### AC-07: Sparse Logs

- [ ] With only 2 to 3 logs, handoff generation still works
- [ ] Codex does not invent unsupported facts

### AC-08: Demo Readiness

- [ ] App works without signup
- [ ] Seed data can quickly populate realistic logs
- [ ] Core flow works on mobile Safari and Chrome

---

## 13. Demo Seed Data

Suggested recent logs:

- Feed 40m ago
- Diaper 55m ago
- Note 30m ago: "A little fussy before falling asleep"
- Sleep start 25m ago

Expected handoff result:

- Summary says baby was recently fed, diaper changed, and fell asleep after a little fussiness
- `What to keep in mind today` mentions likely waking soon and soothing first
- `Why this summary` cites the recent feed, sleep start, and note

---

## 14. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# OpenAI
OPENAI_API_KEY=sk-...

# App
NEXT_PUBLIC_APP_NAME=Bubloo
```

---

## 15. Open Items

- [ ] Finalize whether voice transcription ships in MVP or demo-only
- [ ] Confirm caregiver/settings surface outside bottom tabs
- [ ] Tune Codex prompt after first live test
- [ ] Finalize empty-state copy
- [ ] Finalize Tailwind theme from design system
