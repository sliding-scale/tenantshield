import { v } from "convex/values";

export const stateLawDetailsValidator = v.object({
  headlineMetrics: v.object({
    depositCap: v.string(),
    gracePeriod: v.string(),
    noticeToQuit: v.string(),
  }),
  depositReturnTimeline: v.string(),
  repairAndHabitability: v.object({
    landlordObligation: v.string(),
    legalCitation: v.optional(v.string()),
    repairAndDeductAvailable: v.optional(v.boolean()),
  }),
  evictionNotice: v.object({
    nonpayment: v.string(),
    otherBreach: v.string(),
  }),
});

export const stateLawImportValidator = v.object({
  stateCode: v.string(),
  stateName: v.string(),
  lawDetails: stateLawDetailsValidator,
  updatedAt: v.optional(v.number()),
});
