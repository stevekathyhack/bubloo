import type { TimelineRange } from "./types";

export function parseTimelineRange(input?: string | null): TimelineRange {
  if (input === "3h" || input === "8h") {
    return input;
  }

  return "6h";
}

export function rangeToHours(range: TimelineRange): number {
  return Number.parseInt(range.replace("h", ""), 10);
}

export function formatRelativeTime(timestamp: string, now = new Date()): string {
  const diffMs = now.getTime() - new Date(timestamp).getTime();
  const diffMinutes = Math.max(0, Math.round(diffMs / 60_000));

  if (diffMinutes < 1) {
    return "Just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  if (hours < 24) {
    return minutes === 0 ? `${hours}h ago` : `${hours}h ${minutes}m ago`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  return remainingHours === 0 ? `${days}d ago` : `${days}d ${remainingHours}h ago`;
}

export function formatElapsedDuration(timestamp: string, now = new Date()): string {
  const diffMs = now.getTime() - new Date(timestamp).getTime();
  const diffMinutes = Math.max(0, Math.round(diffMs / 60_000));

  if (diffMinutes < 1) {
    return "under a minute";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  }

  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  if (hours < 24) {
    return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  return remainingHours === 0 ? `${days}d` : `${days}d ${remainingHours}h`;
}

export function formatClockTime(timestamp: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

export function formatLongTime(timestamp: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}
