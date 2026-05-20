"use client"

import Link from "next/link"
import { CheckCircle2, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

type Props = {
  propertyName: string
  propertyHref: string
  overallScore: number
  ratedAtLabel: string
}

export function AlreadyRatedProperty({
  propertyName,
  propertyHref,
  overallScore,
  ratedAtLabel,
}: Props) {
  return (
    <div className="w-full min-w-0 rounded-2xl border border-border bg-background p-6 shadow-sm sm:p-8 md:p-10">
      <div className="mx-auto max-w-md text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="size-8" strokeWidth={1.75} />
        </span>
        <h2 className="mt-5 font-heading text-xl font-semibold text-foreground md:text-2xl">
          You&apos;ve already rated this property
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Each account can submit one review per property. You rated{" "}
          <span className="font-semibold text-foreground">{propertyName}</span> on{" "}
          <span className="text-foreground">{ratedAtLabel}</span>.
        </p>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-accent px-4 py-2 text-sm font-semibold text-foreground">
          <Star className="size-4 fill-primary text-primary" />
          Your overall score: {overallScore.toFixed(1)} / 5
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            className="h-11 rounded-full border-0 bg-foreground px-6 font-semibold text-white shadow-md hover:bg-foreground/90"
            asChild
          >
            <Link href={propertyHref}>View property &amp; reviews</Link>
          </Button>
          <Button variant="outline" className="h-11 rounded-full hover:bg-card hover:text-foreground border-border bg-background" asChild>
            <Link href="/ratings">Browse all properties</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
