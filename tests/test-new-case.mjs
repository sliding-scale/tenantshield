#!/usr/bin/env node

/**
 * End-to-end smoke test for `cases.analyzeNewCase`.
 *
 * Usage (Node 20+):
 *   node --env-file=.env.local tests/test-new-case.mjs
 *
 * Frontend-like flow:
 *   1) Send case input to action
 *   2) Backend performs Exa + Gemini analysis
 *   3) Backend stores case + full embedding + chunk embeddings in Convex
 *   4) Response returns caseId + aiAnalysis
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

/**
 * =========================
 * EDIT THESE VALUES
 * =========================
 */
const CONFIG = {
  // You can leave these empty and use env vars instead.
  convexUrl: "https://judicious-chinchilla-340.convex.cloud",
  convexSiteUrl: "https://judicious-chinchilla-340.convex.site",
  clerkJwt: "dvb_3DIwa4h3ItQ7AwUZtdoW7rOjxby", // REQUIRED: signed Clerk session JWT for target user

  // Optional: for your manual verification in Convex dashboard.
  expectedUserId: "user_3DIwuKwbY6ZQaPBuBNkyXREHg5j",

  inputData: {
    issueType: "Landlord harassment",
    shortTitle: "Threats to force move-out",
    description:
      "My landlord keeps threatening to shut off utilities and enter without notice if I don't move out this week.",
    state: "California",
    city: "Los Angeles",
    landlordName: "John Doe",
    propertyAddress: "123 Demo St, Los Angeles, CA",
  },
};

const convexUrl =
  CONFIG.convexUrl || process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;
const clerkJwt = CONFIG.clerkJwt || process.env.CLERK_TEST_JWT;
const convexSiteUrl = CONFIG.convexSiteUrl || process.env.CONVEX_SITE_URL;
const clerkJwtIssuerDomain = process.env.CLERK_JWT_ISSUER_DOMAIN;
const clerkSecretKey = process.env.CLERK_SECRET_KEY;

if (!convexUrl) {
  throw new Error(
    "Missing Convex URL. Set CONFIG.convexUrl or NEXT_PUBLIC_CONVEX_URL (or CONVEX_URL).",
  );
}

if (!clerkJwt) {
  throw new Error(
    "Missing Clerk JWT. Set CONFIG.clerkJwt or CLERK_TEST_JWT. CLERK_SECRET_KEY / CLERK_JWT_ISSUER_DOMAIN alone are not enough for this script.",
  );
}

const client = new ConvexHttpClient(convexUrl);
client.setAuth(clerkJwt);

console.log("Running frontend-like flow: analyzeNewCase(inputData)");
if (convexSiteUrl) {
  console.log(`HTTP Actions URL configured: ${convexSiteUrl}`);
}
if (clerkJwtIssuerDomain) {
  console.log(`Clerk issuer domain configured: ${clerkJwtIssuerDomain}`);
}
if (clerkSecretKey && !process.env.CLERK_TEST_JWT && !CONFIG.clerkJwt) {
  console.log(
    "CLERK_SECRET_KEY detected, but this script still needs a signed user JWT in CLERK_TEST_JWT (or CONFIG.clerkJwt).",
  );
}
console.log("Input payload:");
console.log(JSON.stringify(CONFIG.inputData, null, 2));
if (CONFIG.expectedUserId) {
  console.log(`Expected userId (for dashboard check): ${CONFIG.expectedUserId}`);
}

const startedAt = Date.now();
const result = await client.action(
  api["cases/actions"].analyzeNewCase,
  CONFIG.inputData,
);
const elapsedMs = Date.now() - startedAt;

console.log("\nSuccess.");
console.log(`Elapsed: ${elapsedMs}ms`);
console.log(`Case ID: ${result.caseId}`);
console.log(
  "Convex should now have new records in `cases` and related rows in `caseEmbeddings`.",
);
console.log("AI Analysis Preview:");
console.log(
  JSON.stringify(
    {
      caseStrength: result.aiAnalysis?.caseStrength,
      summary: result.aiAnalysis?.summary,
      yourRightsCount: result.aiAnalysis?.yourRights?.length ?? 0,
      recommendedActionsCount:
        result.aiAnalysis?.recommendedActions?.length ?? 0,
      documentationCount: result.aiAnalysis?.documentation?.length ?? 0,
      redFlagsCount: result.aiAnalysis?.redFlags?.length ?? 0,
      timelineCount: result.aiAnalysis?.userTimeline?.length ?? 0,
    },
    null,
    2,
  ),
);
