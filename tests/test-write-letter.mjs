#!/usr/bin/env node

/**
 * End-to-end smoke test for `letters.generateTenantLetter`.
 *
 * Usage (Node 20+):
 *   node --env-file=.env.local tests/test-write-letter.mjs
 *
 * Frontend-like flow:
 *   1) Send letter input to action
 *   2) Backend performs Gemini query rewrite + Exa grounding + letter drafting
 *   3) Backend stores letter + full embedding + chunk embeddings in Convex
 *   4) Response returns letterId + letterData
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
    letterType: "Security Deposit Demand",
    state: "California",
    fullName: "Ali Khan",
    landlordName: "John Doe",
    propertyAddress: "123 Demo St, Los Angeles, CA",
    senderAddress: "456 Tenant Way\nOakland, CA 94607",
    landlordAddress: "789 Landlord Rd\nBerkeley, CA 94704",
    description:
      "I moved out 45 days ago and landlord has not returned my deposit or sent an itemized statement.",
    amountAtStake: "2500",
    deadlineDays: "7",
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

console.log("Running frontend-like flow: generateTenantLetter(inputData)");
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
console.log(JSON.stringify(CONFIG.inputData, null, 2));
if (CONFIG.expectedUserId) {
  console.log(`Expected userId (for dashboard check): ${CONFIG.expectedUserId}`);
}

const startedAt = Date.now();
const actionRef =
  api["letters/actions"]?.generateTenantLetter ??
  "letters/actions:generateTenantLetter";
const result = await client.action(actionRef, {
  ...CONFIG.inputData,
  testUserId: CONFIG.expectedUserId || undefined,
  testBypassToken: testBypassToken || undefined,
});
const elapsedMs = Date.now() - startedAt;

const paragraphs = result.letterData?.paragraphs ?? [];
const statutesCount = paragraphs.reduce((count, p) => {
  return count + (p?.statutes_cited?.length ?? 0);
}, 0);

console.log("\nSuccess.");
console.log(`Elapsed: ${elapsedMs}ms`);
console.log(`Letter ID: ${result.letterId}`);
console.log(
  "Convex should now have new records in `letters` and related rows in `letterEmbeddings`.",
);
console.log("Letter Preview:");
console.log(
  JSON.stringify(
    {
      letterTitle: result.letterData?.metadata?.letterTitle,
      recipientName: result.letterData?.metadata?.recipientName,
      state: result.letterData?.metadata?.state,
      paragraphCount: paragraphs.length,
      statutesCitedCount: statutesCount,
      signOff: result.letterData?.signOff,
    },
    null,
    2,
  ),
);
