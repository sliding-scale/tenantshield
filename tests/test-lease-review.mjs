#!/usr/bin/env node

/**
 * End-to-end smoke test for `lease.analyzeLeaseDocument`.
 *
 * Usage (Node 20+):
 *   node --env-file=.env.local tests/test-lease-review.mjs
 *
 * Frontend-like flow:
 *   1) Send lease text + state to action
 *   2) Backend performs Gemini query rewrite + Exa grounding + lease analysis
 *   3) Backend stores lease + full embedding + chunk embeddings in Convex
 *   4) Response returns leaseId + leaseData
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

/**
 * =========================
 * EDIT THESE VALUES
 * =========================
 */
const CONFIG = {
  convexUrl: "https://judicious-chinchilla-340.convex.cloud",
  convexSiteUrl: "https://judicious-chinchilla-340.convex.site",
  useJwtAuth: false,
  clerkJwt: "",
  testBypassToken: "tenantshield_test_bypass_2026",
  expectedUserId: "user_3DIwuKwbY6ZQaPBuBNkyXREHg5j",

  inputData: {
    state: "California",
    leaseText: `
RESIDENTIAL LEASE AGREEMENT
Term: 12 months beginning July 1, 2026.
Monthly Rent: $2,150 due on the 1st of each month.
Late Fee: $150 if rent is not received by the 3rd day of the month.
Security Deposit: $4,000, non-refundable cleaning fee included.
Repairs: Tenant responsible for all repairs under $500, including plumbing and appliance failures not caused by tenant.
Entry: Landlord may enter premises at any time with verbal notice for inspection or showing.
Utilities: Tenant pays electricity and internet. Water paid by landlord.
Termination: Tenant must provide 60 days notice before move-out.
Default: If tenant is late on rent, landlord may terminate tenancy immediately and remove tenant belongings.
Attorney Fees: Tenant agrees to pay landlord's attorney fees in any dispute.
`,
  },
};

const convexUrl =
  CONFIG.convexUrl || process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;
const clerkJwt = CONFIG.clerkJwt || process.env.CLERK_TEST_JWT;
const testBypassToken = CONFIG.testBypassToken || process.env.TEST_BYPASS_TOKEN;
const convexSiteUrl = CONFIG.convexSiteUrl || process.env.CONVEX_SITE_URL;
const clerkJwtIssuerDomain = process.env.CLERK_JWT_ISSUER_DOMAIN;
const clerkSecretKey = process.env.CLERK_SECRET_KEY;

if (!convexUrl) {
  throw new Error(
    "Missing Convex URL. Set CONFIG.convexUrl or NEXT_PUBLIC_CONVEX_URL (or CONVEX_URL).",
  );
}

if (CONFIG.useJwtAuth && !clerkJwt) {
  console.log(
    "JWT auth enabled, but no Clerk JWT configured. Using dev-only fallback testUserId path.",
  );
}

const client = new ConvexHttpClient(convexUrl);
if (CONFIG.useJwtAuth && clerkJwt) {
  client.setAuth(clerkJwt);
}

console.log("Running frontend-like flow: analyzeLeaseDocument(inputData)");
if (convexSiteUrl) {
  console.log(`HTTP Actions URL configured: ${convexSiteUrl}`);
}
if (clerkJwtIssuerDomain) {
  console.log(`Clerk issuer domain configured: ${clerkJwtIssuerDomain}`);
}
if (!CONFIG.useJwtAuth) {
  console.log(
    "Using dev bypass path (testUserId + testBypassToken) if auth JWT is not configured.",
  );
}
if (
  CONFIG.useJwtAuth &&
  clerkSecretKey &&
  !process.env.CLERK_TEST_JWT &&
  !CONFIG.clerkJwt
) {
  console.log(
    "CLERK_SECRET_KEY detected, but this script still needs a signed user JWT in CLERK_TEST_JWT (or CONFIG.clerkJwt).",
  );
}

console.log("Input payload:");
console.log(
  JSON.stringify(
    {
      state: CONFIG.inputData.state,
      leaseTextPreview:
        CONFIG.inputData.leaseText.slice(0, 180).replace(/\s+/g, " ").trim() + "...",
      leaseTextLength: CONFIG.inputData.leaseText.length,
    },
    null,
    2,
  ),
);
if (CONFIG.expectedUserId) {
  console.log(`Expected userId (for dashboard check): ${CONFIG.expectedUserId}`);
}

const startedAt = Date.now();
const actionRef =
  api["lease/actions"]?.analyzeLeaseDocument ?? "lease/actions:analyzeLeaseDocument";
const result = await client.action(actionRef, {
  ...CONFIG.inputData,
  testUserId: CONFIG.expectedUserId || undefined,
  testBypassToken: testBypassToken || undefined,
});
const elapsedMs = Date.now() - startedAt;

const redFlags = result.leaseData?.redFlags ?? [];
const missingClauses = result.leaseData?.missingClauses ?? [];
const tenantFriendly = result.leaseData?.tenantFriendlyClauses ?? [];
const questions = result.leaseData?.questionsToAsk ?? [];

console.log("\nSuccess.");
console.log(`Elapsed: ${elapsedMs}ms`);
console.log(`Lease ID: ${result.leaseId}`);
console.log(
  "Convex should now have new records in `leases` and related rows in `leaseEmbeddings`.",
);
console.log("Lease Analysis Preview:");
console.log(
  JSON.stringify(
    {
      leaseReview: result.leaseData?.leaseReview,
      documentSummaryPreview: result.leaseData?.documentSummary?.slice(0, 180),
      redFlagsCount: redFlags.length,
      missingClausesCount: missingClauses.length,
      tenantFriendlyClausesCount: tenantFriendly.length,
      questionsToAskCount: questions.length,
      overallRecommendation: result.leaseData?.overallRecommendation,
    },
    null,
    2,
  ),
);
