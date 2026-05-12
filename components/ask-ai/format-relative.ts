/** Compact relative time for sidebar labels (no extra deps). */
export function formatRelativeTime(timestampMs: number): string {
  const diff = Date.now() - timestampMs;
  const sec = Math.floor(diff / 1000);
  if (sec < 45) return "Just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(timestampMs).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
