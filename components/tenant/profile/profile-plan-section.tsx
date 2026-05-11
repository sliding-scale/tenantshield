import Link from "next/link"
import { Button } from "@/components/ui/button"

/** Hardcoded until billing / subscription is wired. */
const PLAN_FEATURES = "Unlimited letters · Unlimited analyses · Priority AI"

export function ProfilePlanSection() {
  return (
    <section aria-labelledby="profile-plan-heading" className="mt-8 md:mt-10">
      <h2 id="profile-plan-heading" className="sr-only">
        Plan
      </h2>
      <div className="rounded-2xl border border-surface-strong-hover bg-surface-strong p-5 shadow-sm sm:p-6 md:rounded-3xl md:p-7 lg:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cream-surface-deep dark:text-ink-warm-muted">
          Plan
        </p>
        <div className="mt-3 flex flex-col gap-5 sm:mt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 lg:gap-8">
          <div className="min-w-0 flex-1">
            <p className="font-heading text-2xl font-semibold leading-tight text-cream-surface-soft dark:text-ink-warm md:text-3xl lg:text-4xl">
              TenantShield Pro
            </p>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-cream-surface-deep dark:text-ink-warm-muted md:text-base lg:text-lg">
              {PLAN_FEATURES}
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="h-11 w-full shrink-0 rounded-xl sm:h-12 sm:w-auto sm:min-w-[7.5rem]"
          >
            <Link href="/dashboard">Manage</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
