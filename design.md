# Bubloo Design Brief for Google Stitch

Use this document as the design-generation prompt for Bubloo.

## 1. Product Summary

Bubloo is a calm mobile web app for newborn parents.

Its purpose is not full baby tracking. Its purpose is to help caregivers leave tiny care notes and turn them into a calm handoff for the next caregiver.

The app should feel:

- warm
- reassuring
- lightweight
- non-medical
- non-judgmental
- fast

It should not feel like:

- a hospital app
- a productivity dashboard
- a clinical tracker
- a stress-inducing parenting tool

## 2. Core UX Goal

The product should help a sleep-deprived parent do three things quickly:

1. understand the current state
2. log a small event in a few seconds
3. create a handoff summary for the next caregiver

The UI should communicate:

- small logs are enough
- missing logs are okay
- the next caregiver only needs a calm summary

## 3. Platform and Layout

- Design for mobile web first
- Target screen size: iPhone 14 / modern smartphone viewport
- Single-column layout
- Thumb-friendly spacing
- Large tap targets
- Bottom tab navigation with 4 tabs

Tabs:

1. Now
2. Log
3. Timeline
4. Handoff

## 4. Visual Direction

The visual style should feel soft, intentional, modern, and emotionally calming.

Avoid generic startup SaaS styling.

### Mood

- calm
- gentle
- airy
- emotionally safe
- fluffy
- cozy
- soft
- lovable
- slightly playful but not childish

### Color Direction

Use a soft sky-blue-centered palette with a cozy newborn feel.

Suggested palette:

- soft sky blue
- powder blue
- cloud white
- pale blue-gray
- very light warm cream as background support
- deep navy-charcoal text instead of pure black

Avoid:

- harsh red alerts
- neon colors
- cold medical blue
- saturated royal blue
- dark navy-heavy UI
- purple-heavy AI app aesthetic
- dense black-and-white dashboard contrast

### Typography

Use expressive but readable typography.

Suggested feel:

- soft serif or humanist heading font
- clean sans-serif for body text

Typography should feel more editorial and caring than technical.

### Surfaces

- extra-rounded cards
- pill-shaped buttons
- soft borders
- subtle shadows
- light texture or gradient in the background
- cloud-like softness

The interface should feel like a cozy baby care companion, not a spreadsheet.

## 5. Brand Personality

Bubloo should feel like:

- a supportive co-parenting companion
- a calm handoff notebook
- a reassuring baby care helper
- a soft and lovable newborn care app

Not like:

- a tracker that judges consistency
- an analytics tool
- an AI chatbot

## 6. Design Principles

- Show state before data density
- Make the primary action obvious
- Keep copy soft and reassuring
- Reward partial use, do not punish missing use
- Keep every screen readable in under 10 seconds
- Handoff should feel like the emotional center of the product

## 7. Information Architecture

### Tab 1: Now

Purpose:

- show the baby's current known state at a glance
- reassure the caregiver
- provide quick actions
- stay extremely minimal and glanceable in under 5 seconds

Recommended layout:

1. Top header
   - Bubloo wordmark
   - short subcopy such as:
   - "See what's going on now, and leave only what matters."

2. Current State Card
   - title: "Current state"
   - last feed
   - sleep status
   - last diaper
   - recent note
   - do not separately show last sleep start and last wake
   - sleep should be summarized as one simple line such as:
   - "Asleep for 25m"
   - "Woke 40m ago"

3. Reassurance line
   - short calm copy such as:
   - "Today, this is enough."

4. Quick Actions row or grid
   - Feed
   - Sleep
   - Wake
   - Diaper
   - Note

Empty state:

- should still feel warm and complete
- example tone:
- "Even a couple of notes can be enough to make the next handoff easier."

Important:

- do not include a recent timeline preview on this screen
- do not include a create handoff button on this screen
- do not include charts, statistics, or extra cards
- keep the screen soft, simple, uncluttered, and blue-forward
- this tab should only communicate current state plus the fastest logging actions

### Tab 2: Log

Purpose:

- make event logging extremely fast

Recommended layout:

1. Header
   - title: "Quick log"
   - supportive helper text

2. Type selector
   - Feed
   - Sleep
   - Wake
   - Diaper
   - Note

3. Minimal form
   - timestamp defaulted to now
   - optional amount for feed
   - optional one-line note

4. Primary action button
   - "Save log"

5. Soft reassurance text at bottom

Behavior:

- this screen should minimize friction
- forms should be compact
- if possible, some actions like Sleep, Wake, or Diaper can be near one-tap

### Tab 3: Timeline

Purpose:

- show the recent flow of care events
- help the user understand context before handoff

Recommended layout:

1. Header
   - title: "Timeline"
   - helper text

2. Time range filter
   - 3h
   - 6h
   - 8h

3. Event list
   - visually clear timeline cards
   - event type
   - relative time
   - short supporting note if available

4. CTA at bottom
   - "Create handoff"

Avoid:

- charts
- graphs
- overly quantified statistics

### Tab 4: Handoff

Purpose:

- generate the core Codex-powered handoff moment
- show how Codex interprets sparse logs into a caregiver-ready summary
- make the next caregiver feel instantly oriented
- make the AI feel like the engine of the product, not a decorative feature

Recommended layout:

1. Header
   - title: "Handoff"
   - supportive subtitle
   - make it clear this tab contains a Codex-generated handoff
   - example tone:
   - "Codex turned recent notes into a calm handoff"

2. Primary AI Summary Card
   - short headline
   - brief calm summary paragraph
   - this is the most important element on the screen
   - it should feel like a polished AI-generated caregiver handoff, not a raw log list

3. What to keep in mind today
   - show 2 to 3 calm, useful handoff points for the next caregiver
   - this should focus on what matters while watching the baby today
   - examples:
   - "Baby was a little fussy before sleep"
   - "May wake soon"
   - "Soothing may help before the next feed"
   - this section should feel practical, calm, and caregiver-oriented

4. Suggested next step
   - simple non-medical next action
   - keep it to one clear suggestion only

5. Why this summary
   - show 2 to 3 key pieces of source context that Codex used
   - examples:
   - "Last feed: 40m ago"
   - "Sleep started: 25m ago"
   - "Recent note: a little fussy before sleep"
   - this section should make the AI reasoning feel grounded and believable without looking technical

6. Actions
   - Copy handoff
   - Refresh with latest logs
   - Copy handoff should feel like the primary utility action
   - Refresh can be secondary

This screen should fit within one mobile screen as much as possible.

Important:

- this tab should feel clearly different from the Now tab
- Now shows current state
- Handoff shows Codex interpretation for the next caregiver
- do not show a full timeline here
- do not show graphs, scores, or analytics
- do not use chat UI or chatbot patterns
- do not make the AI feel clinical or robotic
- do not use harsh warning language
- this tab should feel like the emotional and technical center of the app

## 8. Primary Components

Design these reusable components:

- App header
- Bottom tab bar
- Current state card
- Reassurance text block
- Quick action pill or button
- Timeline event card
- Handoff summary card
- Watch-for chip or list row
- Primary CTA button
- Secondary ghost button
- Soft empty state card

## 9. Copy Tone

Use calm, emotionally safe language.

Good examples:

- "Today, this is enough."
- "Here is the clearest picture from the notes so far."
- "This should be enough for the next caregiver to take over calmly."
- "A few notes can still go a long way."

Avoid:

- warning
- missed log
- overdue
- abnormal
- urgent
- correction needed

Do not make the app sound medical, alarmist, or performance-driven.

## 10. Interaction Notes

- Use subtle transitions only
- Avoid busy motion
- Cards can softly fade or rise in
- Buttons should feel warm and tactile
- The handoff generation moment can have a subtle loading shimmer or gentle transition

## 11. Accessibility and Usability

- high readability
- large text hierarchy
- strong button contrast without harsh colors
- large touch targets
- one-thumb-friendly layout
- no dense table layouts

## 12. What to Generate

Generate a cohesive mobile app design system and screen set for these 4 tabs:

1. Now
2. Log
3. Timeline
4. Handoff

Please include:

- full mobile screen mocks for all 4 tabs
- bottom navigation
- reusable card and button styles
- empty state design
- calm visual identity
- a handoff tab where Codex visibly acts as the product engine by transforming sparse logs into a calm caregiver-ready summary

## 13. Final Creative Direction

This should feel like:

- a beautifully designed calm parenting app
- emotionally intelligent
- mobile-first
- editorial, soft, and modern

It should not feel like:

- a dashboard
- enterprise health software
- a generic AI product
- a cluttered baby tracker

The Handoff tab in particular should feel like:

- Codex is doing real interpretive work
- sparse notes are being transformed into something genuinely useful
- calm AI-assisted care coordination
