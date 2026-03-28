import { toDate } from "@/lib/domain/logs";

export function formatRelativeTime(timestamp: Date | string, now: Date = new Date()): string {
  const target = toDate(timestamp).getTime();
  const differenceMs = target - now.getTime();
  const isFuture = differenceMs > 0;

  const absoluteSeconds = Math.floor(Math.abs(differenceMs) / 1000);

  if (absoluteSeconds < 45) {
    return isFuture ? "in under 1m" : "Just now";
  }

  const absoluteMinutes = Math.floor(absoluteSeconds / 60);

  if (absoluteMinutes < 60) {
    return isFuture ? `in ${absoluteMinutes}m` : `${absoluteMinutes}m ago`;
  }

  const absoluteHours = Math.floor(absoluteMinutes / 60);

  if (absoluteHours < 24) {
    return isFuture ? `in ${absoluteHours}h` : `${absoluteHours}h ago`;
  }

  const absoluteDays = Math.floor(absoluteHours / 24);
  return isFuture ? `in ${absoluteDays}d` : `${absoluteDays}d ago`;
}

export function formatClockTime(timestamp: Date | string, locale = "en-US"): string {
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
  }).format(toDate(timestamp));
}
