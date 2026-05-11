import { z } from "zod";

export const stateTenantLawSchema = z.object({
  headlineMetrics: z.object({
    depositCap: z.string().describe("How much security deposit the landlord can hold (e.g. '2 months', 'None')."),
    gracePeriod: z.string().describe("Whether/how long before late fees kick in (e.g. 'None', '5 days')."),
    noticeToQuit: z.string().describe("Minimum notice before the tenant must leave after notice to quit (e.g. '7 days')."),
  }),
  depositReturnTimeline: z.string().describe("Timeline expectations for returning the deposit (e.g. 'returned within 14-30 days')."),
  repairAndHabitability: z.object({
    landlordObligation: z.string().describe("Duty of the landlord to keep premises fit and habitable."),
    legalCitation: z.string().optional().describe("Relevant statute citation (e.g. 'AS 34.03.100')."),
    repairAndDeductAvailable: z.boolean().optional().describe("Whether the tenant's 'repair and deduct' remedy is available."),
  }),
  evictionNotice: z.object({
    nonpayment: z.string().describe("Eviction notice period for nonpayment of rent (e.g. '7 days')."),
    otherBreach: z.string().describe("Eviction notice period for other lease breaches (e.g. '10 days')."),
  }),
});
export type StateTenantLaw = z.infer<typeof stateTenantLawSchema>;
