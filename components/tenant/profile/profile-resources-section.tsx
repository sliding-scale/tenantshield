import Link from "next/link"
import { Briefcase, ChevronRight, CloudUpload, Map } from "lucide-react"

const DISCLAIMER =
  "Tenant Shield provides general information, status updates, and drafted letters only. We are not lawyers. For decisions, high stakes, eviction, large disputes, or similar matters, we recommend consulting an attorney licensed in your state."

const RESOURCES = [
  {
    href: "/state-laws",
    title: "All 50 States",
    subtitle: "Browse rights in every US state",
    Icon: Map,
  },
  {
    href: "/analyze-lease",
    title: "Analyze a Lease",
    subtitle: "AI flags every red-flag clause",
    Icon: CloudUpload,
  },
  {
    href: "/newcase",
    title: "Start a New Case",
    subtitle: "Get an AI case-strength score",
    Icon: Briefcase,
  },
] as const

export function ProfileResourcesSection() {
  return (
    <section aria-labelledby="profile-resources-heading" className="mt-8 min-w-0 md:mt-10">
      <h2
        id="profile-resources-heading"
        className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
      >
        Resources
      </h2>

      <div className="mt-3 flex flex-col gap-3 md:mt-4 md:gap-4">
        <ul className="flex flex-col gap-3 md:gap-4">
          {RESOURCES.map(({ href, title, subtitle, Icon }) => (
            <li key={href} className="min-w-0">
              <Link
                href={href}
                className="group flex min-h-14 items-center gap-3 rounded-2xl border border-border bg-accent px-3 py-3.5 transition hover:border-border hover:bg-card sm:gap-4 sm:px-4 sm:py-4 md:min-h-16"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-card text-foreground ring-1 ring-border/60 md:size-12">
                  <Icon className="size-5 md:size-6" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-heading text-lg font-semibold text-foreground md:text-xl">{title}</span>
                  <span className="mt-0.5 block text-sm leading-snug text-muted-foreground md:text-base">
                    {subtitle}
                  </span>
                </span>
                <ChevronRight
                  className="size-5 shrink-0 text-muted-foreground transition group-hover:text-foreground"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>

        <div
          className="rounded-2xl border border-border bg-card p-4 ring-1 ring-border/40 sm:p-5 md:p-6"
          role="note"
          aria-label="Legal notice"
        >
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground md:text-xs">
            Important
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground md:text-base md:leading-relaxed">
            {DISCLAIMER}
          </p>
        </div>
      </div>
    </section>
  )
}
