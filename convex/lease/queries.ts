import { internalQuery, query } from "../_generated/server";
import { v } from "convex/values";
import { resolveLeasePdfDisplayName } from "./pdfDisplayName";

const PAGE_SIZE = 3;

export const getLeaseForCurrentUser = query({
  args: { leaseId: v.id("leases") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const lease = await ctx.db.get(args.leaseId);
    if (!lease || lease.userId !== identity.subject) return null;
    let pdfUrl: string | null = null;
    let urlDerivedName: string | null = null;
    if (lease.pdfFile) {
      try {
        pdfUrl = await ctx.storage.getUrl(lease.pdfFile);
      } catch (e) {
        pdfUrl = null;
      }

      if (pdfUrl) {
        try {
          const parsed = new URL(pdfUrl);
          const last = parsed.pathname.split("/").pop() || "";
          urlDerivedName = decodeURIComponent(last);
        } catch (e) {
          urlDerivedName = null;
        }
      }
    }

    const pdfFileName = resolveLeasePdfDisplayName(lease.pdfFileName, urlDerivedName);

    return { ...lease, pdfUrl, pdfFileName };
  },
});

export const getLeaseById = internalQuery({
  args: { leaseId: v.id("leases") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.leaseId);
  },
});

/** List leases in pages of 3; `page` is 0-based and responses are cumulative (rows 0…(page+1)*3-1). */
export const listLeasesPaged = query({
  args: { page: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        items: [],
        totalCount: 0,
        page: 0,
        totalPages: 0,
        pageSize: PAGE_SIZE,
      };
    }

    const rows = await ctx.db
      .query("leases")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .collect();

    const sorted = rows
      .filter((row) => row.aiAnalysis !== undefined)
      .sort((a, b) => b._creationTime - a._creationTime);

    const totalCount = sorted.length;
    const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / PAGE_SIZE);
    const safePage = Math.max(0, Math.floor(args.page));
    const cappedPage =
      totalPages === 0 ? 0 : Math.min(safePage, totalPages - 1);
    /** Cumulative rows through this page (for “load more” UI). */
    const end = Math.min(sorted.length, (cappedPage + 1) * PAGE_SIZE);
    const pageRows = sorted.slice(0, end);

    const items = pageRows.map((row) => {
      const analysis = row.aiAnalysis!;
      const recommendation = analysis.overallRecommendation.toUpperCase();
      const verdict: "good" | "negotiate" | "avoid" | "unknown" =
        recommendation.startsWith("DO NOT SIGN")
          ? "avoid"
          : recommendation.startsWith("GOOD")
            ? "good"
            : recommendation.startsWith("NEGOTIATE")
              ? "negotiate"
              : "unknown";
      const issuesCount =
        analysis.redFlags.length + analysis.missingClauses.length;
      return {
        _id: row._id,
        _creationTime: row._creationTime,
        state: row.state,
        leaseReview: analysis.leaseReview,
        documentSummary: analysis.documentSummary,
        verdict,
        redFlagsCount: analysis.redFlags.length,
        missingClausesCount: analysis.missingClauses.length,
        issuesCount,
      };
    });

    return {
      items,
      totalCount,
      page: cappedPage,
      totalPages,
      pageSize: PAGE_SIZE,
    };
  },
});
