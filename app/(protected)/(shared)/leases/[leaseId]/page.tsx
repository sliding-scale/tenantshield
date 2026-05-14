"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useAction } from "convex/react";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  LeaseResultsView,
  type LeaseAnalysis,
} from "@/components/tenant/analyze-lease/lease-results-view";

export default function LeaseDetailPage() {
  const params = useParams<{ leaseId: string }>();
  const router = useRouter();
  const leaseId = (params?.leaseId ?? "") as Id<"leases">;
  const lease = useQuery(
    api.lease.queries.getLeaseForCurrentUser,
    leaseId ? { leaseId } : "skip",
  );

  if (!params?.leaseId) {
    return (
      <main className="min-h-[100dvh] bg-cream-page px-4 py-6 md:min-h-[calc(100vh-4rem)] md:px-8 md:py-10">
        <p className="text-muted-foreground">Invalid lease id.</p>
      </main>
    );
  }

  if (lease === undefined) {
    return (
      <main className="min-h-[100dvh] bg-cream-page px-4 py-6 md:min-h-[calc(100vh-4rem)] md:px-8 md:py-10">
        <p className="text-muted-foreground">Loading lease...</p>
      </main>
    );
  }

  if (!lease) {
    return (
      <main className="min-h-[100dvh] bg-cream-page px-4 py-6 md:min-h-[calc(100vh-4rem)] md:px-8 md:py-10">
        <p className="text-muted-foreground">Lease not found.</p>
      </main>
    );
  }

  if (!lease.aiAnalysis) {
    return (
      <main className="min-h-[100dvh] bg-cream-page px-4 py-6 md:min-h-[calc(100vh-4rem)] md:px-8 md:py-10">
        <p className="text-muted-foreground">
          This lease has not finished analyzing yet. Please check back shortly.
        </p>
      </main>
    );
  }

  const pdfCard = (
    <div className="rounded-2xl border border-cream-border bg-cream-surface p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-warm-muted">
        Document
      </p>
      <p className="mt-2 truncate font-semibold text-ink-warm">
        {lease.pdfFileName ?? "Lease PDF"}
      </p>
      {lease.pdfUrl ? (
        <a
          href={lease.pdfUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block"
        >
          <Button className="w-full">Open PDF</Button>
        </a>
      ) : (
        <div className="mt-3">
          <div className="mb-2 text-sm text-muted-foreground">
            No PDF available
          </div>
          <TryLoadPdfButton leaseId={leaseId} />
        </div>
      )}
    </div>
  );

  function TryLoadPdfButton({ leaseId }: { leaseId: Id<"leases"> }) {
    const fetchPdf = useAction(api.lease.actions.getLeasePdfUrl);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    return (
      <div>
        <Button
          className="w-full"
          onClick={async () => {
            setError(null);
            setLoading(true);
            try {
              const url = await fetchPdf({ leaseId });
              if (url) {
                window.open(url, "_blank", "noopener,noreferrer");
              } else {
                setError("Could not load PDF. Try again in a moment.");
              }
            } catch (e) {
              setError(e instanceof Error ? e.message : String(e));
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
        >
          {loading ? "Loading…" : "Try to load PDF"}
        </Button>
        {error ? (
          <div className="mt-2 text-sm text-destructive">{error}</div>
        ) : null}
      </div>
    );
  }

  return (
    <main className="flex min-h-[100dvh] flex-col bg-cream-page pb-28 pt-5 md:min-h-[calc(100vh-4rem)] md:pb-10 md:pt-6 lg:pt-8">
      <div className="flex w-full flex-1 flex-col px-4 sm:px-6 md:px-10 lg:flex-row lg:px-14 xl:px-16">
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between gap-3 md:mb-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/leases")}
              className="h-10 rounded-xl border-cream-border bg-cream-surface-deep px-3 text-sm font-semibold text-ink-warm hover:bg-cream-surface sm:h-11 sm:px-4 sm:text-base"
            >
              <ArrowLeft className="mr-1.5 size-4" />
              Back to leases
            </Button>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-warm-muted md:text-sm">
              {lease.state}
            </p>
          </div>
          <div className="mb-4 lg:hidden">{pdfCard}</div>
          <LeaseResultsView analysis={lease.aiAnalysis as LeaseAnalysis} />
        </div>

        <aside className="hidden lg:block lg:w-72 lg:pl-6">
          <div className="sticky top-6">{pdfCard}</div>
        </aside>
      </div>
    </main>
  );
}
