import type { CareLogEntry, CareLogType } from "./types";

const TYPE_LABELS: Record<CareLogType, string> = {
  feeding: "Feed",
  sleep_start: "Sleep",
  wake: "Wake",
  diaper: "Diaper",
  note: "Note",
};

export function getLogTypeLabel(type: CareLogType): string {
  return TYPE_LABELS[type];
}

export function getTimelineTitle(log: CareLogEntry): string {
  switch (log.type) {
    case "feeding":
      return log.amount_ml ? `${log.amount_ml} mL feeding logged` : "Feeding logged";
    case "sleep_start":
      return "Settled to sleep";
    case "wake":
      return "Woke up";
    case "diaper":
      return "Diaper changed";
    case "note":
      return "Care note";
  }
}

export function getTimelineDetail(log: CareLogEntry): string {
  if (log.type === "note" && log.note) {
    return log.note;
  }

  if (log.type === "feeding" && log.note) {
    return log.note;
  }

  if (log.type === "feeding" && log.amount_ml) {
    return `${log.amount_ml} mL logged.`;
  }

  if (log.type === "sleep_start") {
    return "Fell asleep.";
  }

  if (log.type === "wake") {
    return "Woke up.";
  }

  if (log.type === "diaper") {
    return "Diaper changed.";
  }

  return "A small note for the next caregiver.";
}
