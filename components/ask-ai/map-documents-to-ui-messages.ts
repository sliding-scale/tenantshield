import type { UIMessage } from "ai";
import type { Doc } from "@/convex/_generated/dataModel";

export type ChatMessageDoc = Doc<"chatMessages">;

export function chatMessagesToUIMessages(rows: ChatMessageDoc[]): UIMessage[] {
  return rows.map((m) => ({
    id: m._id as string,
    role: m.role,
    parts: [{ type: "text" as const, text: m.content }],
  }));
}
