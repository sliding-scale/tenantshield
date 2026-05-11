import { query } from "../_generated/server";
import { v } from "convex/values";

export const getAllStateLaws = query({
  args: {},
  handler: async (ctx) => {
    const states = await ctx.db.query("stateTenantLaws").collect();
    // sort alphabetically by stateName
    return states.sort((a, b) => {
      const nameA = a.stateName || "";
      const nameB = b.stateName || "";
      return nameA.localeCompare(nameB);
    });
  },
});

export const getStateLawByCode = query({
  args: {
    stateCode: v.string(),
  },
  handler: async (ctx, args) => {
    const stateLaw = await ctx.db
      .query("stateTenantLaws")
      .withIndex("by_state_code", (q) => q.eq("stateCode", args.stateCode))
      .first();
    return stateLaw;
  },
});
