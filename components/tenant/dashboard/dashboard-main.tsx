"use client"
import Link from "next/link"
import { FileText, MessageSquareShare, PlusCircle, Sparkles, Star, UserRound } from "lucide-react"
import { useQuery } from "convex/react"
import useCurrentUser from "@/app/hooks/useCurrentUser"
import { api } from "@/convex/_generated/api"

const quickActions = [
  {
    title: "New Case",
    subtitle: "AI strength score",
    href: "/newcase",
    Icon: PlusCircle,
    featured: true,
  },
  {
    title: "Ask AI",
    subtitle: "Claude Sonnet 4.5",
    href: "/ask-ai",
    Icon: Sparkles,
    featured: false,
  },
  {
    title: "Write Letter",
    subtitle: "5 legal templates",
    href: "/write-letters",
    Icon: FileText,
    featured: false,
  },
  {
    title: "Analyze Lease",
    subtitle: "Flag red-flag clauses",
    href: "/analyze-lease",
    Icon: MessageSquareShare,
    featured: false,
  },
  {
    title: "Profile",
    subtitle: "Renter details & preferences",
    href: "/profile",
    Icon: UserRound,
    featured: false,
  },
  {
    title: "Give Rating",
    subtitle: "Share your experience with a Landlord/Property",
    href: "/ratings",
    Icon: Star,
    featured: false,
  },
]

export default function TenantDashboardMain() {
  const { convexUser, clerkUser } = useCurrentUser()
  const counts = useQuery(api.dashboard.queries.countsForCurrentUser)
  if (!convexUser || convexUser.role !== "tenant") {
    return <div>You are not authorized to access this page</div>
  }

  const userName = clerkUser?.firstName || convexUser.name || "there"
  const protectionIndex = Math.round(counts?.protectionIndex ?? 0)
  const protectionAngle = Math.max(0, Math.min(360, (protectionIndex / 100) * 360))

  return (
    <main className="min-h-[100dvh] bg-cream-page px-4 pb-24 pt-5 text-foreground md:min-h-[calc(100vh-4rem)] md:px-8 md:pb-10 md:pt-8 lg:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <section className="mb-6 flex items-center justify-between md:mb-8">
          <div>
            <h1 className="font-heading text-4xl font-semibold leading-tight md:text-xl md:font-medium md:text-muted-foreground">
              Good to see you, <span className="text-foreground">{userName}</span>.
            </h1>
          </div>
        </section>

        <section>
          <div className="rounded-[2rem] border border-cream-border bg-cream-surface p-5 text-ink-warm shadow-[0_16px_35px_-24px_rgba(50,38,18,0.45)] md:p-7 lg:px-10 lg:py-8 xl:px-12 xl:py-9">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
              Protection Index
            </p>
            <div className="mt-4 grid grid-cols-[1fr_auto] items-start gap-4 sm:flex sm:flex-row sm:items-end sm:justify-between lg:items-center">
              <div className="min-w-0 max-w-[14.5rem] sm:max-w-[20rem] lg:max-w-[52rem]">
                <h2 className="font-heading text-[1.3rem] font-semibold leading-[1.06] text-ink-warm sm:text-[2.2rem] lg:text-[2.8rem] lg:leading-[0.98]">
                  Your case strength across all active disputes.
                </h2>
                <div className="col-span-2 mt-5 flex gap-3 sm:mt-4">
                  <StatPill value={String(counts?.activeCases ?? 0)} label="Cases" />
                  <StatPill value={String(counts?.letters ?? 0)} label="Letters" />
                </div>
              </div>
              <div
                className="grid size-[8.5rem] shrink-0 place-items-center self-start rounded-full sm:size-[14rem] lg:size-[16.5rem]"
                style={{
                  background: `conic-gradient(from -90deg, var(--primary) 0deg ${protectionAngle}deg, var(--border) ${protectionAngle}deg 360deg)`,
                }}
              >
                <div className="grid size-[7rem] place-items-center rounded-full border border-cream-border bg-cream-surface sm:size-[12.1rem] lg:size-[14.25rem]">
                  <span className="font-heading text-2xl font-semibold text-ink-warm sm:text-5xl">
                    {protectionIndex}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Take Action
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-6 md:gap-4">
            {quickActions.map(({ title, subtitle, href, Icon, featured }, index) => (
              <Link
                key={title}
                href={href}
                className={[
                  "group rounded-3xl border p-4 transition",
                  "md:col-span-2",
                  featured
                    ? "border-surface-strong bg-surface-strong text-white hover:bg-surface-strong-hover"
                    : "border-border bg-white text-foreground hover:border-foreground/25 hover:shadow-sm",
                ].join(" ")}
              >
                <div
                  className={[
                    "inline-flex p-1",
                    featured ? "text-amber-300" : "text-ink-warm",
                  ].join(" ")}
                >
                  <Icon className="size-5" />
                </div>
                <h3
                  className={[
                    "mt-4 font-heading text-3xl font-semibold leading-tight",
                    featured ? "text-white" : "text-ink-warm",
                  ].join(" ")}
                >
                  {title}
                </h3>
                <p className={["mt-1 text-sm", featured ? "text-white/75" : "text-ink-warm-muted"].join(" ")}>
                  {subtitle}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-cream-border bg-cream-surface-soft px-4 py-3 text-center ring-1 ring-cream-border/50 sm:px-5 sm:py-4">
      <p className="font-heading text-3xl font-semibold leading-none text-ink-warm sm:text-4xl">{value}</p>
      <p className="mt-1 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-ink-warm-muted sm:text-xs">{label}</p>
    </div>
  )
}

