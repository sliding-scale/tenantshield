export type AnalyzeLeaseError = { title: string; body: string };

/** Stable codes embedded in Convex action errors for client-side mapping. */
export const LEASE_ERROR = {
  NOT_A_LEASE: "NOT_A_LEASE",
  COULD_NOT_READ_FILE: "COULD_NOT_READ_FILE",
} as const;

export function leaseNotADocumentMessage(reason: string): string {
  const detail = reason.trim();
  return detail
    ? `${LEASE_ERROR.NOT_A_LEASE}: ${detail}`
    : `${LEASE_ERROR.NOT_A_LEASE}: This file does not appear to be a lease agreement, addendum, or renewal.`;
}

export function leaseCouldNotReadFileMessage(detail?: string): string {
  return detail
    ? `${LEASE_ERROR.COULD_NOT_READ_FILE}: ${detail}`
    : `${LEASE_ERROR.COULD_NOT_READ_FILE}: Could not extract any text from the PDF. The file may be scanned or image-based.`;
}

export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return String(error ?? "");
}

/**
 * Strip Convex client wrapper noise and pull out stable error codes when present.
 */
export function unwrapConvexClientError(message: string): string {
  const codeMatch = message.match(
    /\b(NOT_A_LEASE|COULD_NOT_READ_FILE):\s*([\s\S]*?)(?=\s+Called by client|\[CONVEX\s|$)/i,
  );
  if (codeMatch) {
    return `${codeMatch[1].toUpperCase()}: ${codeMatch[2].trim()}`.trim();
  }

  let s = message.trim();
  for (let i = 0; i < 6; i++) {
    const prev = s;
    s = s.replace(/\s+Called by client\s*$/i, "").trim();
    s = s.replace(/^\[CONVEX [^\]]+\]\s*/i, "").trim();
    s = s.replace(/^\[Request ID:[^\]]+\]\s*/i, "").trim();
    s = s.replace(/^Server Error\s*/i, "").trim();
    s = s.replace(/^Uncaught Error:\s*/i, "").trim();
    if (s === prev) break;
  }

  const legacyNotLease = /the uploaded document does not look like a lease\.?\s*([\s\S]*)/i.exec(
    s,
  );
  if (legacyNotLease) {
    const reason = (legacyNotLease[1] ?? "").trim();
    return leaseNotADocumentMessage(
      reason || "This file does not appear to be a lease agreement.",
    );
  }

  return s;
}

export function formatAnalyzeLeaseError(message: string): AnalyzeLeaseError {
  const normalized = message.toLowerCase();

  if (normalized.includes(`${LEASE_ERROR.NOT_A_LEASE.toLowerCase()}:`)) {
    const body = message
      .replace(/^.*not_a_lease:\s*/i, "")
      .replace(/^the uploaded document does not look like a lease\.?\s*/i, "")
      .trim();
    return {
      title: "This doesn’t look like a lease",
      body:
        body ||
        "Please upload a lease agreement, addendum, or renewal—not notices, applications, or other documents.",
    };
  }

  if (normalized.includes("does not look like a lease")) {
    const body = message
      .replace(/^.*does not look like a lease\.?\s*/i, "")
      .trim();
    return {
      title: "This doesn’t look like a lease",
      body:
        body ||
        "Please upload a lease agreement, addendum, or renewal—not notices, applications, or other documents.",
    };
  }

  if (
    normalized.includes(`${LEASE_ERROR.COULD_NOT_READ_FILE.toLowerCase()}:`) ||
    normalized.includes("could not extract any text")
  ) {
    const body = message
      .replace(/^.*could_not_read_file:\s*/i, "")
      .trim();
    return {
      title: "We couldn’t read this file",
      body:
        body ||
        "Please upload a text-based PDF or a plain text (.txt) file. Scanned image-only PDFs often don’t work.",
    };
  }

  if (normalized.includes("file upload failed")) {
    return {
      title: "Upload failed",
      body: "Your file didn’t upload. Check your connection and try again.",
    };
  }

  if (normalized.includes("pdf file not found")) {
    return {
      title: "Upload expired",
      body: "Please select your file again and retry the analysis.",
    };
  }

  return {
    title: "Couldn’t analyze this lease",
    body: message.trim() || "Please try again with a different file.",
  };
}

/** True when the message is still an opaque Convex wrapper with no user-facing detail. */
export function isOpaqueConvexError(raw: string, unwrapped: string): boolean {
  if (!unwrapped.trim()) return true;
  if (/^\[CONVEX\b/i.test(unwrapped.trim())) {
    return !/\b(NOT_A_LEASE|COULD_NOT_READ_FILE):/i.test(raw);
  }
  return false;
}

export function resolveAnalyzeLeaseError(error: unknown): AnalyzeLeaseError {
  const raw = extractErrorMessage(error);
  const unwrapped = unwrapConvexClientError(raw);

  if (isOpaqueConvexError(raw, unwrapped)) {
    return {
      title: "Something went wrong",
      body: "We hit an unexpected problem. Please try again in a moment. If it keeps happening, contact support.",
    };
  }

  return formatAnalyzeLeaseError(unwrapped);
}
