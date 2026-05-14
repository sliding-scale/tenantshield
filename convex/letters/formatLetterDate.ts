import { format } from "date-fns";

/** Long US-style date for letter headers (current date at generation time). */
export function formatLetterHeaderDate(now: Date): string {
  return format(now, "MMMM d, yyyy");
}
