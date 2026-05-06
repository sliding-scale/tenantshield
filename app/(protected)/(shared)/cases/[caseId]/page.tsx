"use client"

import { useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery } from "convex/react"
import type { Id } from "@/convex/_generated/dataModel"
import { api } from "@/convex/_generated/api"
import { NewCaseAnalysisResult } from "@/components/case/new-case-analysis-result"

export default function CaseDetailsPage() {
  const params = useParams<{ caseId: string }>()
  const router = useRouter()
  const caseId = (params?.caseId ?? "") as Id<"cases">
  const row = useQuery(api.cases.queries.getByIdForCurrentUser, caseId ? { caseId } : "skip")

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
      <main className="min-h-[100dvh] bg-cream-page px-4 py-6 md:min-h-[calc(100vh-4rem)] md:px-8 md:py-10">
        <p className="text-muted-foreground">Invalid case id.</p>
      </main>
    )
  }

  if (row === undefined) {
    return (
      <main className="min-h-[100dvh] bg-cream-page px-4 py-6 md:min-h-[calc(100vh-4rem)] md:px-8 md:py-10">
        <p className="text-muted-foreground">Loading case...</p>
      </main>
    )
  }

  if (!row || !details) {
    return (
      <main className="min-h-[100dvh] bg-cream-page px-4 py-6 md:min-h-[calc(100vh-4rem)] md:px-8 md:py-10">
        <p className="text-muted-foreground">Case not found.</p>
      </main>
    )
  }

  return (
    <main className="flex min-h-[100dvh] flex-col bg-cream-page pb-28 pt-5 md:min-h-[calc(100vh-4rem)] md:pb-10 md:pt-6 lg:pt-8">
      <div className="flex w-full flex-1 flex-col px-4 sm:px-6 md:px-10 lg:px-14 xl:px-16">
        <NewCaseAnalysisResult details={details} aiAnalysis={row.aiAnalysis} onBack={() => router.push("/cases")} />
      </div>
    </main>
  )
}
