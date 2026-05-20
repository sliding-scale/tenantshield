import { action } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { ensureLeaseDocument } from "../lease/validation";
import type { Id } from "../_generated/dataModel";
import { initSync, WasmPdfDocument } from "pdf-oxide-wasm/web";

const PDF_OXIDE_VERSION = "0.3.45";
const WASM_URL = `https://cdn.jsdelivr.net/npm/pdf-oxide-wasm@${PDF_OXIDE_VERSION}/web/pdf_oxide_bg.wasm`;

let wasmInitPromise: Promise<void> | null = null;

async function ensureWasmReady() {
  if (!wasmInitPromise) {
    wasmInitPromise = (async () => {
      const res = await fetch(WASM_URL);
      if (!res.ok) {
        throw new Error(
          `Failed to fetch pdf-oxide WASM (${res.status} ${res.statusText})`,
        );
      }
      const buffer = await res.arrayBuffer();
      const wasmModule = await WebAssembly.compile(buffer);
      initSync({ module: wasmModule });
    })().catch((err) => {
      wasmInitPromise = null;
      throw err;
    });
  }
  return wasmInitPromise;
}

export const extractLeaseText = action({
  args: {
    storageId: v.id("_storage"),
    state: v.string(),
    fileName: v.optional(v.string()),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{ leaseId: Id<"leases">; leaseText: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;

    const blob = await ctx.storage.get(args.storageId);
    if (!blob) throw new Error("PDF file not found in storage");

    const arrayBuffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    await ensureWasmReady();

    const doc = new WasmPdfDocument(bytes);
    let leaseText: string;
    try {
      leaseText = doc.toMarkdownAll();
    } finally {
      doc.free();
    }

    if (!leaseText.trim()) {
      throw new Error(
        "Could not extract any text from the PDF. The file may be scanned or image-based.",
      );
    }

    await ensureLeaseDocument(leaseText);

    const createdUnderPlan = await ctx.runQuery(
      (internal as any)["users/queries"].getPlanByClerkId,
      { clerkId: userId },
    );

    const leaseId: Id<"leases"> = await ctx.runMutation(
      (internal as any)["analyzeLease/mutations"].saveLeaseToDB,
      {
        userId,
        createdUnderPlan,
        state: args.state,
        leaseText,
        pdfFile: args.storageId,
        pdfFileName: args.fileName?.trim() || undefined,
      },
    );

    return { leaseId, leaseText };
  },
});
