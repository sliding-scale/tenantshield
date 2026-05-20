import { internalMutation, mutation, type MutationCtx } from "../_generated/server";
import { v } from "convex/values";
import { stateLawDetailsValidator, stateLawImportValidator } from "./validators";
import type { Infer } from "convex/values";

type StateLawImport = Infer<typeof stateLawImportValidator>;

async function upsertStateLawRecord(ctx: MutationCtx, args: StateLawImport) {
  const updatedAt = args.updatedAt ?? Date.now();
  const existing = await ctx.db
    .query("stateTenantLaws")
    .withIndex("by_state_code", (q) => q.eq("stateCode", args.stateCode))
    .first();

  if (existing) {
    await ctx.db.patch(existing._id, {
      stateName: args.stateName,
      lawDetails: args.lawDetails,
      updatedAt,
    });
    return { id: existing._id, created: false };
  }

  const id = await ctx.db.insert("stateTenantLaws", {
    stateCode: args.stateCode,
    stateName: args.stateName,
    lawDetails: args.lawDetails,
    updatedAt,
  });
  return { id, created: true };
}

export const upsertStateLaw = mutation({
  args: {
    stateCode: v.string(),
    stateName: v.string(),
    lawDetails: stateLawDetailsValidator,
  },
  handler: async (ctx, args) => {
    const result = await upsertStateLawRecord(ctx, args);
    return result.id;
  },
});

export const bulkUpsertStateLaws = internalMutation({
  args: {
    stateLaws: v.array(stateLawImportValidator),
  },
  handler: async (ctx, args) => {
    let created = 0;
    let updated = 0;

    for (const stateLaw of args.stateLaws) {
      const result = await upsertStateLawRecord(ctx, stateLaw);
      if (result.created) {
        created += 1;
      } else {
        updated += 1;
      }
    }

    return {
      total: args.stateLaws.length,
      created,
      updated,
    };
  },
});
