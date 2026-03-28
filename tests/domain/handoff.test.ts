import { buildHandoffPromptInput, parseHandoffResponse } from "@/lib/domain/handoff";
import { buildDemoSeedLogs } from "@/lib/domain/seed";
import { createMockCareLogs } from "@/lib/testing/mock-data";

describe("buildHandoffPromptInput", () => {
  const now = new Date("2026-03-28T14:30:00.000Z");

  it("builds a compact, recent handoff context from the last 8 hours", () => {
    const logs = [
      ...buildDemoSeedLogs(now),
      ...createMockCareLogs([{ type: "feeding", minutesAgo: 600, amount_ml: 80 }], now),
    ];

    expect(buildHandoffPromptInput(logs, now)).toEqual({
      generatedAt: "2026-03-28T14:30:00.000Z",
      windowHours: 8,
      sourceLogCount: 4,
      currentState: {
        lastFeed: {
          timestamp: "2026-03-28T13:50:00.000Z",
          amount_ml: 120,
          relative_text: "40m ago",
        },
        sleepStatusText: "Asleep for 25m",
        lastDiaper: {
          timestamp: "2026-03-28T13:35:00.000Z",
          relative_text: "55m ago",
        },
        recentNote: {
          timestamp: "2026-03-28T14:00:00.000Z",
          note: "A little fussy before falling asleep",
        },
        reassuranceText: "Today, this is enough.",
      },
      recentLogs: [
        {
          id: "seed-diaper-1",
          type: "diaper",
          timestamp: "2026-03-28T13:35:00.000Z",
          relative_text: "55m ago",
          amount_ml: null,
          note: null,
        },
        {
          id: "seed-feeding-1",
          type: "feeding",
          timestamp: "2026-03-28T13:50:00.000Z",
          relative_text: "40m ago",
          amount_ml: 120,
          note: null,
        },
        {
          id: "seed-note-1",
          type: "note",
          timestamp: "2026-03-28T14:00:00.000Z",
          relative_text: "30m ago",
          amount_ml: null,
          note: "A little fussy before falling asleep",
        },
        {
          id: "seed-sleep-start-1",
          type: "sleep_start",
          timestamp: "2026-03-28T14:05:00.000Z",
          relative_text: "25m ago",
          amount_ml: null,
          note: null,
        },
      ],
      recentNotes: ["A little fussy before falling asleep"],
    });
  });
});

describe("parseHandoffResponse", () => {
  it("parses JSON wrapped in markdown fences and trims list items", () => {
    const raw = `\`\`\`json
{
  "headline": "Bubloo update",
  "summary_text": "Recently fed, diaper changed, and baby fell asleep after some fussiness.",
  "keep_in_mind_today": [
    "May wake soon",
    "Soothing may help before the next feed",
    "The recent note sounded calm after settling",
    "Extra item that should be trimmed away"
  ],
  "why_this_summary": [
    "Last feed: 40m ago",
    "Sleep started: 25m ago",
    "Recent note: a little fussy before sleep"
  ],
  "suggested_next_step": "If awake, soothe first and then prepare for the next feed."
}
\`\`\``;

    expect(parseHandoffResponse(raw)).toEqual({
      headline: "Bubloo update",
      summary_text: "Recently fed, diaper changed, and baby fell asleep after some fussiness.",
      keep_in_mind_today: [
        "May wake soon",
        "Soothing may help before the next feed",
        "The recent note sounded calm after settling",
      ],
      why_this_summary: [
        "Last feed: 40m ago",
        "Sleep started: 25m ago",
        "Recent note: a little fussy before sleep",
      ],
      suggested_next_step: "If awake, soothe first and then prepare for the next feed.",
    });
  });

  it("defaults the headline while still requiring the core handoff body", () => {
    const parsed = parseHandoffResponse({
      summary_text: "Baby is asleep after a recent feed.",
      keep_in_mind_today: ["May wake soon"],
      why_this_summary: ["Sleep started: 25m ago"],
      suggested_next_step: "Let the next caregiver know baby settled well.",
    });

    expect(parsed.headline).toBe("Bubloo update");
  });

  it("throws when required fields are missing", () => {
    expect(() =>
      parseHandoffResponse({
        headline: "Bubloo update",
        keep_in_mind_today: ["May wake soon"],
        why_this_summary: ["Sleep started: 25m ago"],
        suggested_next_step: "Soothe first.",
      }),
    ).toThrow('Handoff response field "summary_text" must be a non-empty string.');
  });
});
