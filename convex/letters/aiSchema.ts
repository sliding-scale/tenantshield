import { z } from "zod";

// Each paragraph is its own object for maximum frontend flexibility
export const letterParagraphSchema = z.object({
  type: z.enum(["introduction", "statement_of_facts", "legal_basis", "demand", "deadline_warning", "closing"]),
  content: z.string().describe("The text of the paragraph."),
  statutes_cited: z.array(z.string()).optional().describe("Any specific laws or codes mentioned in this paragraph.")
});

export const letterAnalysisSchema = z.object({
  metadata: z.object({
    letterTitle: z.string().describe("E.g., Formal Demand for Security Deposit"),
    recipientName: z.string(),
    senderName: z.string(),
    state: z.string(),
  }),
  header: z.object({
    senderAddress: z.string(),
    landlordAddress: z.string(),
    date: z.string(),
    subjectLine: z.string(),
  }),
  salutation: z.string().describe("E.g., Dear [Name]:"),
  paragraphs: z.array(letterParagraphSchema).describe("The core content of the letter broken into logical sections."),
  signOff: z.string().describe("E.g., Sincerely,"),
});

export type LetterAnalysis = z.infer<typeof letterAnalysisSchema>;