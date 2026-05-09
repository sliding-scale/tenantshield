import {z} from "zod"


export const leaseAnalysisSchema = z.object({
    leaseReview: z.string().describe("E.g., Alabama Rental Agreement"),
    documentSummary: z.string().describe("A comprehensive paragraph summarizing the parties, dates, amounts, and core terms."),
    redFlags: z.array(
      z.object({
        quote: z.string().describe("The exact problematic quote from the lease."),
        problem: z.string().describe("Why it is a problem, citing specific state laws."),
      })
    ).describe("Illegal, predatory, or highly unusual clauses."),
    missingClauses: z.array(
      z.object({
        clauseName: z.string(),
        explanation: z.string(),
      })
    ).describe("Standard protections or disclosures missing from the document."),
    tenantFriendlyClauses: z.array(
      z.object({
        quote: z.string(),
        explanation: z.string(),
      })
    ).describe("Clauses that are beneficial to the tenant."),
    questionsToAsk: z.array(z.string()).describe("Questions the tenant should ask the landlord before signing."),
    overallRecommendation: z.string().describe("E.g., NEGOTIATE - Followed by a paragraph summarizing the verdict."),
});














