import { Briefcase, CloudUpload, Map } from "lucide-react"
import { FadeIn, FadeInStagger } from "@/components/shared/fade-in"
import { MobileListRow } from "@/components/shared/mobile-list-row"

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

      <FadeInStagger className="mt-3 flex flex-col gap-3 md:mt-4 md:gap-4">
        <ul className="flex flex-col gap-3 md:gap-4">
          {RESOURCES.map(({ href, title, subtitle, Icon }) => (
            <li key={href} className="min-w-0">
              <FadeIn stagger>
                <MobileListRow href={href} title={title} subtitle={subtitle} Icon={Icon} />
              </FadeIn>
            </li>
          ))}
        </ul>
      </FadeInStagger>
    </section>
  )
}
