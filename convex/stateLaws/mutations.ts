import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { stateTenantLawSchema } from "./aiSchema";

export const upsertStateLaw = mutation({
  args: {
    stateCode: v.string(),
    stateName: v.string(),
    lawDetails: v.object({
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
    }),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("stateTenantLaws")
      .withIndex("by_state_code", (q) => q.eq("stateCode", args.stateCode))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        stateName: args.stateName,
        lawDetails: args.lawDetails,
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      const newId = await ctx.db.insert("stateTenantLaws", {
        stateCode: args.stateCode,
        stateName: args.stateName,
        lawDetails: args.lawDetails,
        updatedAt: Date.now(),
      });
      return newId;
    }
  },
});
