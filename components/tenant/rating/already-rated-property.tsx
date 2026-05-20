"use client"

import Link from "next/link"
import { CheckCircle2, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

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
    <Card className="gap-0 rounded-3xl border border-border py-0 shadow-none ring-0">
      <div className="px-6 py-10 text-center sm:px-8 sm:py-12">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-accent text-primary">
          <CheckCircle2 className="size-8" strokeWidth={1.75} aria-hidden />
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
          <Star className="size-4 fill-primary text-primary" aria-hidden />
          Your overall score: {overallScore.toFixed(1)} / 5
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button variant="cta" className="h-11 rounded-xl px-6 font-semibold" asChild>
            <Link href={propertyHref}>View property &amp; reviews</Link>
          </Button>
          <Button variant="outline" className="h-11 rounded-xl border-border bg-background" asChild>
            <Link href="/ratings">Browse all properties</Link>
          </Button>
        </div>
      </div>
    </Card>
  )
}
