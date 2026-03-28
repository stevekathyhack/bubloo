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

- Let parents record feeding, sleep, diaper, or a note in 5 to 10 seconds
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

## 9. Core User Stories

- As a parent, I want to log feeding, sleep, or a diaper in about 5 seconds
- As a parent, I want to understand the baby's current state at a glance
- As the next caregiver, I want the last few hours summarized in under 10 seconds
- As a user who missed some logs, I want the app to gently help me continue without guilt
- As a user who leaves a free-form note, I want it reflected in the handoff summary

## 10. MVP Scope

### In Scope

- Landing page explaining the Bubloo value proposition
- Quick log UI for:
  - Feeding
  - Sleep
  - Diaper
  - Note
- Current state card showing:
  - Last feed
  - Last sleep or wake
  - Most recent diaper
  - Recent notes
  - Calm reassurance copy
- Handoff summary generator showing:
  - Headline
  - Recent timeline
  - Watch-for items
  - Suggested next step
- Seed data or sample flow for demo use without accounts

### Out of Scope

- Account systems and caregiver permissions
- External sharing integrations
- Long-term baby statistics
- Smart reminders and alert engines
- Medical escalation logic

## 11. Key Screens

### Landing Page

- What Bubloo is
- Why it is different from tracking-first apps
- Clear CTA to start the demo

### Home / Current State

- Current state at a glance
- Last feed, sleep, and diaper
- Recent note snippet
- Calm reassurance line
- Quick log CTA
- Create handoff CTA

### Quick Log

- Type: feeding, sleep, diaper, or note
- Timestamp with default set to now
- Optional amount or duration
- One-line note
- Minimal taps to save

### Handoff Summary

- Short headline
- Recent timeline
- Watch for
- Suggested next step
- Shareable card-style layout

## 12. Functional Requirements

### FR1. Quick Log

- Users must be able to create `feeding`, `sleep`, `diaper`, and `note` entries
- Each entry must be savable with minimal required input
- Timestamp should default to the current time
- Amount or duration should remain optional

### FR2. Current State Summary

- The system must summarize the current state from recent records
- The summary must still work when some data is missing
- The output should be primarily sentence-based or card-based, not a numeric table

### FR3. Handoff Summary

- The system must generate a caregiver handoff summary from recent records
- The summary must include the latest feed, recent sleep context, recent diaper context, notes, watch-for items, and a suggested next step
- Free-form notes must influence the summary when present

### FR4. Calm Tone

- All product copy must avoid guilt, comparison, and warning-heavy language
- Missing data states should use gentle guidance instead of negative error framing

### FR5. Demo Usability

- The product must be usable immediately without account creation
- A seeded scenario must allow a clean demo flow

## 13. Data Model

```ts
type CareLogType = "feeding" | "sleep" | "diaper" | "note";

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
  lastSleep?: CareLogEntry;
  lastDiaper?: CareLogEntry;
  recentNotes: CareLogEntry[];
  reassuranceText: string;
}

interface HandoffSummary {
  headline: string;
  recentTimeline: string[];
  watchFor: string[];
  suggestedNextStep: string;
}
```

## 14. AI / Codex Responsibilities

AI is not a general chatbot in Bubloo. It is the summary engine.

AI should:

- Read sparse care logs and generate a current-state summary
- Generate caregiver handoff summaries
- Pull key watch-for details from free-form notes
- Rewrite outputs in a calm, low-anxiety tone

AI should not:

- Diagnose
- Assess danger or risk clinically
- Give medical guidance
- Predict long-term patterns

## 15. Tone and Copy System

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

## 16. Demo Narrative

Problem:

"Newborn care handoffs are often messy. Important details live in memory, chat, and tired conversations."

Solution:

"Bubloo lets one caregiver leave tiny notes, then automatically turns them into a calm handoff for the next caregiver."

Demo flow:

1. Parent A logs a feeding event
2. Parent A logs a diaper change
3. Parent A adds a note: "A little fussy before falling asleep"
4. The home screen shows the current state card
5. The user taps `Create handoff`
6. Parent B reads and understands the summary in under 10 seconds

Example summary:

"Bubloo update: last fed 40 minutes ago, diaper changed recently, baby fell asleep after being a little fussy. Watch for: may wake soon, keep an eye on fussiness. Next step: if awake, offer soothing before next feed."

## 17. Success Metrics

Hackathon demo success:

- Time to first log is under 10 seconds
- A quick log action takes about 5 to 10 seconds
- A handoff summary can be understood in under 10 seconds
- The product still feels useful with only a few records
- Observers react with "this is more than a tracker"

## 18. Acceptance Criteria

- Quick log entry works for all four log types
- A current state summary is shown
- A handoff summary can be generated
- Free-form notes are reflected in the output
- The app behaves gracefully with missing data
- The demo works without external integrations
- The experience feels fast and mobile-friendly

## 19. Risks and Mitigations

### Risk: Feels like a normal baby tracker

Mitigation:

- Emphasize calm handoff on every core screen
- De-emphasize tracking language
- Exclude graphs and score-like UI patterns

### Risk: AI summaries feel generic

Mitigation:

- Make note content visibly influence output
- Use concrete recent events in the summary
- Keep the structure opinionated and handoff-focused

### Risk: Tone feels managerial instead of calming

Mitigation:

- Apply a strict calm-copy review to all UI text
- Avoid urgency, warnings, and compliance-like phrasing

### Risk: Output reads like medical advice

Mitigation:

- Ban diagnostic or prescriptive medical language
- Keep suggestions framed as caregiver context, not treatment advice

## 20. Build Plan for Ralphthon

- Landing page
- Quick log UI
- Current state card
- Handoff summary generation logic
- Calm copy refinement
- Basic tests
- Demo seed data and demo script

## 21. Open Questions

- Should the first demo position Bubloo as a mobile web app only, or as a future multi-device family tool?
- Should handoff output be purely on-screen in MVP, or include a simple share/export action?
- How much structured detail should the quick log capture before it becomes too heavy?
