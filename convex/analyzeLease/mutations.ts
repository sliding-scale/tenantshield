import { internalMutation, mutation } from "../_generated/server";
import { v } from "convex/values";
import { Plan } from "../schema";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveLeaseToDB = internalMutation({
  args: {
    userId: v.string(),
    createdUnderPlan: Plan,
    state: v.string(),
    leaseText: v.string(),
    pdfFile: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const leaseId = await ctx.db.insert("leases", {
      userId: args.userId,
      createdUnderPlan: args.createdUnderPlan,
      state: args.state,
      leaseText: args.leaseText,
      pdfFile: args.pdfFile,
    });
    return leaseId;
  },
});
