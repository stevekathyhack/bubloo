# Bubloo PRD

Status: Draft v0.1
Date: 2026-03-28
Audience: Hackathon team

## 1. Product Summary

Bubloo is a low-anxiety care logging and caregiver handoff app for newborn parents.

It helps parents leave tiny care notes in seconds, then turns sparse logs into a calm, useful summary for the next caregiver.

This is not a traditional baby tracker focused on perfect data capture, long-term analytics, or parental performance.

## 2. Problem Statement

During the newborn stage, parents are sleep-deprived, interrupted, and constantly switching context. Important details such as the last feed, sleep, diaper change, or a small behavior note often become fragmented across memory, chat, and verbal updates.

Existing logging apps can feel heavy, guilt-inducing, and overly focused on complete tracking. But most parents do not need more data. They need reassurance about the current state and a fast, reliable handoff for the next caregiver.

## 3. Goals

- Let parents record feeding, sleep start, wake, diaper, or a note in 5 to 10 seconds
- Turn short or incomplete logs into a calm current-state summary
- Generate a handoff summary that a second caregiver can understand in under 10 seconds
- Make it feel safe to keep using the app even when records are sparse or inconsistent
- Position the product as a reassurance tool, not a management tool

## 4. Non-Goals

- Medical advice, symptom detection, or diagnosis
- Growth analytics, historical reports, or predictive models
- Complex notification or reminder systems
- Full authentication and advanced permissions
- External integrations
- Clinical, pediatric, or hospital workflows
- Parent scoring, fairness tracking, or comparative metrics

## 5. Target Users

Primary users:

- Couples caring for a newborn
- Households doing shift-based care, especially overnight

Initial use cases:

- One caregiver logs a quick event
- The next caregiver checks a summary at handoff
- Parents use it before sleep, before leaving home, or during a night shift switch

## 6. Core Value Proposition

Bubloo promises four things:

- Small logs are enough
- Missing records are okay
- The next caregiver gets what they need automatically
- The app reduces anxiety instead of increasing it

One-line pitch:

"Bubloo helps newborn parents leave tiny care notes and turns them into a calm handoff for the next caregiver."

## 7. Product Principles

- Input should be lighter than interpretation
- State should matter more than numbers
- Missing data should never feel like failure
- The UI should avoid red warnings, scores, and pressure-heavy copy
- The product should feel thumb-friendly and fast on mobile web
- The handoff should resolve on a single screen

## 8. Differentiation

Bubloo differs from classic baby trackers in four ways:

- Focuses on caregiver handoff, not comprehensive tracking
- Accepts sparse logging instead of demanding complete data
- Frames output around "current state" rather than charts or stats
- Uses calm, non-judgmental copy throughout the experience

## 9. Core Product Features

### Feature 1: Quick Log

- Fast entry for feeding, sleep start, wake, diaper, and note
- Built for one-thumb use and 5 to 10 second interactions

### Feature 2: Current State Card

- A calm summary of the baby's current known state
- Prioritizes latest feed, current sleep status, latest diaper, recent note, and reassurance copy

### Feature 3: AI Handoff Summary

- Uses Codex as the interpretation engine behind the handoff experience
- Generates a caregiver-ready handoff card for the next caregiver
- Turns sparse recent logs into a calm summary, what to keep in mind today, a suggested next step, and clear supporting context

### Feature 4: Calm Copy System

- Shapes all UI and summary text to reduce pressure and guilt
- Prevents the product from feeling like a tracking or medical app

## 10. Core User Stories

- As a parent, I want to log feeding, sleep, or a diaper in about 5 seconds
- As a parent, I want to understand the baby's current state at a glance
- As the next caregiver, I want the last few hours summarized in under 10 seconds
- As a user who missed some logs, I want the app to gently help me continue without guilt
- As a user who leaves a free-form note, I want it reflected in the handoff summary

## 11. MVP Scope

### In Scope

- Landing page explaining the Bubloo value proposition
- Quick log UI for:
  - Feeding
  - Sleep start
  - Wake
  - Diaper
  - Note
- Current state card showing:
  - Last feed
  - Sleep status
  - Most recent diaper
  - Recent note
  - Calm reassurance copy
- Handoff summary generator showing:
  - Codex-generated headline and summary
  - What to keep in mind today
  - Suggested next step
  - Why this summary
  - On-screen handoff card readable in one view
  - Optional copy-to-clipboard action
- Seed data or sample flow for demo use without accounts

### Out of Scope

- Account systems and caregiver permissions
- External sharing integrations beyond optional copy-to-clipboard
- Long-term baby statistics
- Smart reminders and alert engines
- Medical escalation logic

## 12. Key Screens

### Landing Page

- What Bubloo is
- Why it is different from tracking-first apps
- Clear CTA to start the demo

### Home / Current State

Home should be ordered around the four core features and support a fast caregiver check-in.

Recommended information architecture:

1. Header
   - Bubloo title
   - Short reassuring subcopy
2. Current State Card
   - Current state at a glance
   - Last feed
   - Sleep status
   - Last diaper
   - Recent note
3. Quick Log Actions
   - Feed
   - Sleep
   - Wake
   - Diaper
   - Note
4. Reassurance line
   - Calm copy such as "Today, this is enough."

Sparse or empty states should still feel calm and usable, not blank or punitive.

### Quick Log

- Type: feeding, sleep start, wake, diaper, or note
- Timestamp with default set to now
- Optional amount for feeding
- One-line note
- Minimal taps to save

### Handoff Summary

- Codex-generated headline
- Calm summary paragraph
- What to keep in mind today
- Suggested next step
- Why this summary
- Copy handoff action
- Refresh with latest logs action
- On-screen card layout readable in under 10 seconds

## 13. Functional Requirements

### FR1. Quick Log

- Users must be able to create `feeding`, `sleep_start`, `wake`, `diaper`, and `note` entries
- Each entry must be savable with minimal required input
- Timestamp should default to the current time
- Feeding amount should remain optional
- Sleep duration may be inferred by the system when `sleep_start` and `wake` are paired

### FR2. Current State Summary

- The system must summarize the current state from logs in the last 6 hours
- The summary must still work when some data is missing
- The summary should prioritize the latest known feed, current sleep status, latest diaper, and recent note
- The current-state surface should remain minimal and glanceable rather than behaving like a timeline or dashboard
- The system should avoid guessing unknown facts and summarize only what is supported by logs
- The output should be primarily sentence-based or card-based, not a numeric table

### FR3. Handoff Summary

- The system must generate a caregiver handoff summary from logs in the last 8 hours
- The handoff summary must use Codex as the core interpretation engine
- The summary must include a concise caregiver-ready summary, `what to keep in mind today`, one suggested next step, and a short `why this summary` explanation
- The summary may include up to 3 source-context items to show why Codex produced the handoff
- Free-form notes must influence the summary when present
- The handoff summary should be readable on a single mobile screen without external sharing
- The summary should remain useful even when only 2 to 3 logs are available
- The system must not invent unsupported facts; any practical handoff notes should come from explicit notes or highly reliable recent context

### FR4. Calm Tone

- All product copy must avoid guilt, comparison, and warning-heavy language
- Missing data states should use gentle guidance instead of negative error framing
- Summary output must avoid diagnostic or prescriptive medical language

### FR5. Demo Usability

- The product must be usable immediately without account creation
- A seeded scenario must allow a clean demo flow

## 14. Data Model

```ts
type CareLogType = "feeding" | "sleep_start" | "wake" | "diaper" | "note";

interface CareLogEntry {
  id: string;
  type: CareLogType;
  timestamp: string;
  note?: string;
  amount?: string;
  duration?: string;
}

interface CurrentBabyState {
  lastFeed?: CareLogEntry;
  lastSleepStart?: CareLogEntry;
  lastWake?: CareLogEntry;
  lastDiaper?: CareLogEntry;
  isLikelySleeping?: boolean;
  sleepStatusText: string;
  recentNotes: CareLogEntry[];
  reassuranceText: string;
}

interface HandoffSummary {
  headline: string;
  summaryText: string;
  keepInMindToday: string[];
  whyThisSummary: string[];
  suggestedNextStep: string;
  copyText?: string;
}
```

## 15. AI / Codex Responsibilities

Codex is not a general chatbot in Bubloo. It is the core interpretation engine behind the handoff experience.

Codex should:

- Read sparse care logs and generate a current-state summary using the last 6 hours of logs
- Generate caregiver handoff summaries using the last 8 hours of logs
- Decide what matters most to the next caregiver
- Pull key handoff notes from free-form notes
- Generate `what to keep in mind today` guidance in a calm tone
- Generate one suggested next step that stays non-medical
- Explain why the summary was produced by surfacing a few key source-context items
- Highlight only known information rather than inventing missing context
- Rewrite outputs in a calm, low-anxiety tone

Codex should not:

- Diagnose
- Assess danger or risk clinically
- Give medical guidance
- Predict long-term patterns

## 16. Tone and Copy System

The product should consistently reduce pressure and guilt.

Example copy:

- "Today, this is enough."
- "Even with a few missing notes, here's the clearest picture right now."
- "This is likely enough for the next caregiver to take over calmly."

Copy to avoid:

- "You missed a log"
- "Warning"
- "Behind schedule"
- "Abnormal"
- "Needs correction"

## 17. Demo Narrative

Problem:

"Newborn care handoffs are often messy. Important details live in memory, chat, and tired conversations."

Solution:

"Bubloo lets one caregiver leave tiny notes, then automatically turns them into a calm handoff for the next caregiver."

Demo flow:

1. Parent A logs a feeding event
2. Parent A logs a diaper change
3. Parent A adds a note: "A little fussy before falling asleep"
4. Parent A taps `Sleep`
5. The home screen shows the current state card
6. Parent B opens the `Handoff` tab
7. Codex generates a calm caregiver-ready handoff
8. Parent B reads and understands the summary in under 10 seconds

Example summary:

"Bubloo update: recently fed, diaper changed, and baby fell asleep after being a little fussy. What to keep in mind today: may wake soon, soothing may help first. Next step: if awake, soothe first and then prepare for the next feed."

## 18. Success Metrics

Hackathon demo success:

- Time to first log is under 10 seconds
- A quick log action takes about 5 to 10 seconds
- A handoff summary can be understood in under 10 seconds
- The product still feels useful with only a few records
- Observers react with "this is more than a tracker"
- The Codex-powered handoff clearly feels like the core value of the product

## 19. Acceptance Criteria

- Quick log entry works for all five log types
- A current state summary is shown
- A handoff summary can be generated
- Free-form notes are reflected in the output
- The app behaves gracefully with missing data
- With only 2 to 3 logs, the app still produces a natural summary
- The handoff card fits in a single mobile view
- The handoff includes `what to keep in mind today` and a single suggested next step
- The handoff includes a short explanation of why Codex produced that summary
- Summary output does not include diagnostic or medical advice
- Missing data states use gentle reassurance copy rather than warning language
- The demo works without external integrations
- The experience feels fast and mobile-friendly

## 20. Risks and Mitigations

### Risk: Feels like a normal baby tracker

Mitigation:

- Emphasize calm handoff on every core screen
- De-emphasize tracking language
- Exclude graphs and score-like UI patterns

### Risk: AI summaries feel generic

Mitigation:

- Make note content visibly influence output
- Use concrete recent events and handoff notes in the summary
- Keep the structure opinionated and handoff-focused

### Risk: Tone feels managerial instead of calming

Mitigation:

- Apply a strict calm-copy review to all UI text
- Avoid urgency, warnings, and compliance-like phrasing

### Risk: Output reads like medical advice

Mitigation:

- Ban diagnostic or prescriptive medical language
- Keep suggestions framed as caregiver context, not treatment advice

## 21. Build Plan for Ralphthon

- Landing page
- Quick log UI
- Current state card
- Codex-powered handoff summary generation logic
- Handoff explanation and `what to keep in mind today` logic
- Calm copy refinement
- Basic tests
- Demo seed data and demo script

## 22. Open Questions

- Should the first demo position Bubloo as a mobile web app only, or as a future multi-device family tool?
- Should MVP include a simple copy-to-clipboard action for the handoff card?
- How much structured detail should the quick log capture before it becomes too heavy?
