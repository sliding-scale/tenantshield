"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useMutation, useQuery } from "convex/react"
import { Archive, ArchiveRestore, EllipsisVertical, Star } from "lucide-react"
import type { Id } from "@/convex/_generated/dataModel"
import { api } from "@/convex/_generated/api"
import { NewCaseAnalysisResult } from "@/components/case/new-case-analysis-result"
import { PlanUpgradeDialog } from "@/components/tenant/free-plan-upgrade-dialog"
import { ShieldLoader } from "@/components/shared/shield-loader"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import useCurrentUser from "@/app/hooks/useCurrentUser"
import {
  ACTIVE_CASE_LIMIT_REACHED,
  hasReachedActiveCaseLimit,
  resolvePlanId,
} from "@/lib/plans/plan-access"
import { getActiveCaseLimit } from "@/lib/plans/plans"

export default function CaseDetailsPage() {
  const params = useParams<{ caseId: string }>()
  const router = useRouter()
  const caseId = (params?.caseId ?? "") as Id<"cases">
  const row = useQuery(api.cases.queries.getByIdForCurrentUser, caseId ? { caseId } : "skip")
  const attachedLetterId = useQuery(
    api.letters.queries.getLetterIdByCaseForCurrentUser,
    caseId ? { caseId } : "skip",
  )
  const planUsage = useQuery(api.planUsage.queries.current, {})
  const setCaseStatus = useMutation(api.cases.mutations.setCaseStatusForCurrentUser)
  const { convexUser } = useCurrentUser()
  const [statusBusy, setStatusBusy] = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)

  const effectiveStatus = row?.caseStatus ?? "active"

  const details = useMemo(() => {
    if (!row) return null
    return {
      issueType: row.inputData.issueType,
      title: row.inputData.shortTitle,
      description: row.inputData.description,
      state: row.inputData.state,
      city: row.inputData.city ?? "",
      landlord: row.inputData.landlordName ?? "",
      propertyAddress: row.inputData.propertyAddress ?? "",
    }
  }, [row])

  if (!params?.caseId) {
    return (
      <main className="min-h-svh bg-background px-4 py-6 md:min-h-svh md:px-8 md:py-10">
        <p className="text-muted-foreground">Invalid case id.</p>
      </main>
    )
  }

  if (row === undefined) {
    return (
      <main className="min-h-svh bg-background px-4 py-6 md:min-h-svh md:px-8 md:py-10">
        <ShieldLoader variant="case" fullPage />
      </main>
    )
  }

  if (!row || !details) {
    return (
      <main className="min-h-svh bg-background px-4 py-6 md:min-h-svh md:px-8 md:py-10">
        <p className="text-muted-foreground">Case not found.</p>
      </main>
    )
  }

  const plan = resolvePlanId(planUsage?.plan ?? convexUser?.plan)
  const billingPeriod = planUsage?.planType ?? "monthly"
  const usedActiveCases = planUsage?.usedActiveCases ?? 0
  const activeCaseLimit = getActiveCaseLimit(plan, billingPeriod)

  const toggleArchive = async () => {
    const nextStatus = effectiveStatus === "active" ? "archived" : "active"

    if (
      nextStatus === "active" &&
      hasReachedActiveCaseLimit(plan, billingPeriod, usedActiveCases)
    ) {
      setUpgradeOpen(true)
      return
    }

    setStatusBusy(true)
    try {
      await setCaseStatus({
        caseId,
        caseStatus: nextStatus,
      })
    } catch (error) {
      if (error instanceof Error && error.message === ACTIVE_CASE_LIMIT_REACHED) {
        setUpgradeOpen(true)
        return
      }
      throw error
    } finally {
      setStatusBusy(false)
    }
  }

  return (
<<<<<<< HEAD
    <main className="flex min-h-[100dvh] flex-col bg-cream-page pt-5 md:min-h-[calc(100vh-4rem)] md:pt-6 lg:pt-8">
=======
    <main className="flex min-h-svh flex-col bg-background pb-28 pt-5 md:min-h-svh md:pb-10 md:pt-6 lg:pt-8">
>>>>>>> c1b356a6b729e07b614112749a0cda5244f518ee
      <div className="flex w-full flex-1 flex-col px-4 sm:px-6 md:px-10 lg:px-14 xl:px-16">
        <NewCaseAnalysisResult
          details={details}
          aiAnalysis={row.aiAnalysis}
          createdUnderPlan={row.createdUnderPlan}
          caseId={caseId}
          attachedLetterId={attachedLetterId ?? null}
          onBack={() => router.push("/cases")}
          headerTrailing={
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Case options"
                  className="size-11 shrink-0 rounded-full border-border bg-accent text-foreground"
                >
                  <EllipsisVertical className="size-5" aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-48">
                <DropdownMenuItem asChild>
                  <Link href="/ratings">
                    <Star aria-hidden />
                    Rate your experience
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={statusBusy}
                  onSelect={() => void toggleArchive()}
                >
                  {effectiveStatus === "active" ? (
                    <Archive aria-hidden />
                  ) : (
                    <ArchiveRestore aria-hidden />
                  )}
                  {statusBusy
                    ? "Updating…"
                    : effectiveStatus === "active"
                      ? "Archive"
                      : "Restore"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          }
        />
        <PlanUpgradeDialog
          open={upgradeOpen}
          onOpenChange={setUpgradeOpen}
          eyebrow="Active case limit"
          title="Upgrade to restore this case"
          description={`Your current plan allows up to ${activeCaseLimit} active cases at a time. Archive another active case or upgrade on billing to restore this one.`}
          primaryActionLabel="Go to billing"
          primaryActionHref="/billing"
        />
      </div>
    </main>
  )
}
