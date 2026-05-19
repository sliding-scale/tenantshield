export function isTransientError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /UNAVAILABLE|503|429|high demand|RESOURCE_EXHAUSTED|ETIMEDOUT|ECONNRESET|fetch failed|network|timeout|rate limit|overloaded|internal error|502|504|ENOTFOUND|socket hang up|aborted|ERR_/i.test(
    message,
  );
}

export function isRetrievalFailureResult(result: string): boolean {
  return (
    result.startsWith("[RETRIEVAL_ERROR]") ||
    /^Failed to retrieve/i.test(result.trim())
  );
}

export async function withRetries<T>(
  fn: () => Promise<T>,
  options?: { maxAttempts?: number; baseDelayMs?: number },
): Promise<T> {
  const maxAttempts = options?.maxAttempts ?? 3;
  const baseDelayMs = options?.baseDelayMs ?? 800;
  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isTransientError(error) || attempt === maxAttempts - 1) {
        throw error;
      }
      await new Promise((resolve) =>
        setTimeout(resolve, baseDelayMs * (attempt + 1)),
      );
    }
  }

  throw lastError;
}

export async function withRetriesOnResult(
  fn: () => Promise<string>,
  shouldRetry: (result: string) => boolean,
  options?: { maxAttempts?: number; baseDelayMs?: number },
): Promise<string> {
  const maxAttempts = options?.maxAttempts ?? 3;
  const baseDelayMs = options?.baseDelayMs ?? 800;

  let lastResult = "";
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    lastResult = await fn();
    if (!shouldRetry(lastResult) || attempt === maxAttempts - 1) {
      return lastResult;
    }
    await new Promise((resolve) =>
      setTimeout(resolve, baseDelayMs * (attempt + 1)),
    );
  }

  return lastResult;
}
