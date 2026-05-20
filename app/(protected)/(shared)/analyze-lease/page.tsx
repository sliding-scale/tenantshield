"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ChevronLeft, Upload, FileText, X } from "lucide-react";
import { GavelLoader } from "@/components/shared/gavel-loader";
import { ShieldLoader } from "@/components/shared/shield-loader";
import { StatePickerField } from "@/components/shared/state-picker-field";
import { Button } from "@/components/ui/button";
import { US_STATE_NAMES, type USStateAbbr } from "@/lib/constants/us-states";
import { usePrefilledUSState } from "@/app/hooks/usePrefilledUSState";
import {
  LeaseResultsView,
  type LeaseAnalysis,
} from "@/components/tenant/analyze-lease/lease-results-view";
import { PlanUpgradeDialog } from "@/components/tenant/free-plan-upgrade-dialog";
import useCurrentUser from "@/app/hooks/useCurrentUser";
import {
  hasReachedLeaseAnalysisLimit,
  LEASE_ANALYSIS_LIMIT_REACHED,
  resolvePlanId,
  shouldPromptFreePlanUpgrade,
} from "@/lib/plans/plan-access";
import { getLeaseAnalysisLimit } from "@/lib/plans/plans";
import {
  resolveAnalyzeLeaseError,
  type AnalyzeLeaseError,
} from "@/lib/lease/analyze-lease-errors";

type ProcessingStep = "upload" | "extract" | "analyze" | null;

export default function AnalyzeLeasePage() {
  const router = useRouter();
  const generateUploadUrl = useMutation(
    api.analyzeLease.mutations.generateUploadUrl,
  );
  const extractLeaseText = useAction(api.analyzeLease.actions.extractLeaseText);
  const analyzeLeaseById = useAction(api.lease.actions.analyzeLeaseById);

  const [file, setFile] = useState<File | null>(null);
  const { state, setState } = usePrefilledUSState();
  const [processingStep, setProcessingStep] = useState<ProcessingStep>(null);
  const [error, setError] = useState<AnalyzeLeaseError | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [leaseId, setLeaseId] = useState<Id<"leases"> | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeMode, setUpgradeMode] = useState<"free" | "limit">("free");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { convexUser } = useCurrentUser();
  const counts = useQuery(api.dashboard.queries.countsForCurrentUser, {});
  const planUsage = useQuery(api.planUsage.queries.current, {});
  const plan = resolvePlanId(planUsage?.plan ?? convexUser?.plan);
  const billingPeriod = planUsage?.planType ?? "monthly";
  const usedLeaseAnalyses = planUsage?.usedLeaseAnalyses ?? 0;
  const leaseAnalysisLimit = getLeaseAnalysisLimit(plan, billingPeriod);

  const lease = useQuery(
    api.lease.queries.getLeaseForCurrentUser,
    leaseId ? { leaseId } : "skip",
  );

  const analysis = lease?.aiAnalysis;

  const canSubmit = Boolean(file && state && !processingStep);
  const showUploadForm = !processingStep && (!leaseId || error);
  const showProcessing =
    !error &&
    (processingStep !== null || (leaseId !== null && !analysis));

  const analyzeDescription = state
    ? `Our AI is reviewing every clause against ${US_STATE_NAMES[state as USStateAbbr]} tenant law. This usually takes 30–60 seconds.`
    : "Our AI is reviewing every clause against your state's tenant law. This usually takes 30–60 seconds.";

  const handleFile = useCallback((incoming: File | null) => {
    setError(null);
    if (!incoming) {
      setFile(null);
      return;
    }
    const allowed = ["application/pdf", "text/plain"];
    if (!allowed.includes(incoming.type)) {
      setError({
        title: "Unsupported file type",
        body: "Please upload a PDF or text file.",
      });
      return;
    }
    if (incoming.size > 20 * 1024 * 1024) {
      setError({
        title: "File too large",
        body: "File must be under 20 MB.",
      });
      return;
    }
    setFile(incoming);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFile(dropped);
    },
    [handleFile],
  );

  const onSubmit = async () => {
    if (!canSubmit || !file) return;

    if (shouldPromptFreePlanUpgrade(plan, counts?.leases ?? 0)) {
      setUpgradeMode("free");
      setUpgradeOpen(true);
      return;
    }

    if (hasReachedLeaseAnalysisLimit(plan, billingPeriod, usedLeaseAnalyses)) {
      setUpgradeMode("limit");
      setUpgradeOpen(true);
      return;
    }

    setError(null);
    setProcessingStep("upload");
    try {
      const uploadUrl = await generateUploadUrl();

      const uploadRes = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!uploadRes.ok) throw new Error("File upload failed");

      const { storageId } = (await uploadRes.json()) as {
        storageId: string;
      };

      setProcessingStep("extract");

      const { leaseId: newLeaseId } = await extractLeaseText({
        storageId: storageId as Id<"_storage">,
        state,
        fileName: file.name,
      });

      setLeaseId(newLeaseId);
      setProcessingStep("analyze");

      await analyzeLeaseById({ leaseId: newLeaseId });
    } catch (e) {
      if (e instanceof Error && e.message === LEASE_ANALYSIS_LIMIT_REACHED) {
        setUpgradeMode("limit");
        setUpgradeOpen(true);
        return;
      }
      setError(resolveAnalyzeLeaseError(e));
    } finally {
      setProcessingStep(null);
    }
  };

  return (
    <main className="flex min-h-[100dvh] flex-col bg-cream-page pb-28 pt-5 md:min-h-[calc(100vh-4rem)] md:pb-10 md:pt-6 lg:pt-8">
      <div className="flex w-full flex-1 flex-col px-4 sm:px-6 md:px-10 lg:px-14 xl:px-16">
        <header className="mb-5 flex shrink-0 items-center justify-between md:hidden">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="h-11 w-11 rounded-full border-border bg-cream-surface-soft p-0 text-foreground"
            aria-label="Back"
          >
            <ChevronLeft className="size-5" />
          </Button>
        </header>
        {showUploadForm ? (
          <section className="flex min-h-0 flex-1 flex-col rounded-2xl border border-cream-border bg-cream-surface p-5 shadow-sm sm:p-7 md:rounded-3xl md:p-10 lg:p-12 xl:p-14">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary md:text-sm">
              AI &middot; Red Flag Detector
            </p>
            <h2 className="mt-3 max-w-5xl font-heading text-4xl font-semibold leading-[0.95] text-ink-warm text-balance sm:text-5xl md:text-6xl lg:text-7xl xl:max-w-6xl">
              Upload your lease. <br className="hidden sm:block" />
              We&rsquo;ll find the traps.
            </h2>
            <p className="mt-4 max-w-3xl text-lg text-ink-warm-muted text-pretty sm:text-xl lg:max-w-4xl lg:text-2xl">
              Our AI reviews every clause against your state&rsquo;s tenant law
              and flags illegal or one-sided terms.
            </p>

            <div className="mx-auto mt-8 w-full max-w-3xl md:mt-10 lg:mt-12">
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={onDrop}
                className={[
                  "group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 transition-colors md:rounded-3xl md:py-16",
                  isDragOver
                    ? "border-primary bg-primary/5"
                    : file
                      ? "border-cream-border bg-cream-surface-soft"
                      : "border-cream-border bg-background hover:border-primary/50 hover:bg-cream-surface-soft",
                ].join(" ")}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,application/pdf,text/plain"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                />

                {file ? (
                  <div className="flex w-full min-w-0 max-w-full items-start gap-3 overflow-hidden pr-1 sm:items-center">
                    <FileText className="mt-0.5 size-8 shrink-0 text-primary sm:mt-0" />
                    <div className="min-w-0 flex-1 overflow-hidden text-left">
                      <p
                        className="w-full max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold leading-snug text-foreground sm:text-base md:text-lg"
                        title={file.name}
                      >
                        {file.name}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                        {(file.size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      aria-label="Remove file"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex size-16 items-center justify-center rounded-full bg-accent transition-colors group-hover:bg-muted md:size-20">
                      <Upload className="size-6 text-muted-foreground md:size-7" />
                    </div>
                    <p className="mt-4 text-lg font-semibold text-foreground md:text-xl">
                      Tap to upload PDF
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground md:text-base">
                      PDF or text file
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="mx-auto mt-8 w-full max-w-3xl md:mt-10">
              <StatePickerField state={state} onStateChange={setState} />
            </div>

            {error ? (
              <div
                className="mx-auto mt-4 max-w-xl rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm shadow-sm"
                role="alert"
              >
                <p className="font-semibold text-destructive">{error.title}</p>
                {error.body ? (
                  <p className="mt-2 font-medium leading-relaxed text-pretty text-destructive/95">
                    {error.body}
                  </p>
                ) : null}
                {error.title === "This doesn't look like a lease" ||
                error.title === "We couldn't read this file" ? (
                  <p className="mt-3 border-t border-destructive/15 pt-3 text-xs font-medium text-destructive/90">
                    This feature is working—try again with a lease agreement,
                    addendum, or renewal (PDF or text). Notices, applications, and
                    other documents are not supported.
                  </p>
                ) : error.title === "Something went wrong" ? null : (
                  <p className="mt-3 border-t border-destructive/15 pt-3 text-xs font-medium text-destructive/90">
                    Accepted files: lease agreements, lease addendums, or lease
                    renewals.
                  </p>
                )}
              </div>
            ) : null}

            <Button
              type="button"
              variant="cta"
              disabled={!canSubmit}
              onClick={() => void onSubmit()}
              className="mx-auto mt-8 h-14 w-full max-w-xl rounded-2xl px-6 text-lg font-semibold md:mt-10 md:text-xl"
            >
              {processingStep === "upload" ? (
                <span className="flex items-center justify-center gap-3">
                  <ShieldLoader variant="upload" compact />
                  <span>Uploading…</span>
                </span>
              ) : processingStep === "extract" ? (
                "Reading your lease…"
              ) : (
                "Analyze Lease"
              )}
            </Button>
          </section>
        ) : showProcessing ? (
          <section className="flex min-h-0 flex-1 flex-col items-center justify-center rounded-2xl border border-cream-border bg-cream-surface p-6 shadow-sm sm:p-10 md:rounded-3xl">
            {processingStep === "upload" || processingStep === "extract" ? (
              <ShieldLoader
                variant="upload"
                embedded
                label={
                  processingStep === "upload"
                    ? "Uploading\nyour lease…"
                    : "Reading\nyour lease…"
                }
                description={
                  processingStep === "upload"
                    ? "Sending your file securely. This only takes a moment."
                    : "Extracting text from your document so we can review every clause."
                }
              />
            ) : (
              <GavelLoader variant="lease" embedded description={analyzeDescription} />
            )}
          </section>
        ) : analysis ? (
          <LeaseResultsView
            analysis={analysis as LeaseAnalysis}
            createdUnderPlan={lease?.createdUnderPlan}
          />
        ) : null}
      </div>
      <PlanUpgradeDialog
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        eyebrow={upgradeMode === "free" ? "Free plan limit" : "Lease analysis limit"}
        title={
          upgradeMode === "free"
            ? "Upgrade to analyze more leases"
            : "Upgrade to analyze another lease"
        }
        description={
          upgradeMode === "free"
            ? "Your free plan includes one lease analysis. Choose a plan to analyze another lease."
            : `Your current plan allows up to ${leaseAnalysisLimit} lease analyses per ${billingPeriod === "yearly" ? "year" : "month"}. Upgrade on billing to run a new one.`
        }
        primaryActionLabel={upgradeMode === "free" ? "View plans" : "Go to billing"}
        primaryActionHref={upgradeMode === "free" ? "/onboarding/plans" : "/billing"}
      />
    </main>
  );
}
