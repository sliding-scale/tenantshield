"use client"

import { ProfileHeaderSection } from "@/components/tenant/profile/profile-header-section"
import { ProfilePlanSection } from "@/components/tenant/profile/profile-plan-section"
import { ProfileResourcesSection } from "@/components/tenant/profile/profile-resources-section"
import { ProfileSignOutRow } from "@/components/tenant/profile/profile-sign-out-row"
import { MOBILE_TAB_BAR_PAGE_SHELL } from "@/lib/nav/mobile-chrome"
import { cn } from "@/lib/utils"

export default function ProfilePage() {
  return (
    <main
      className={cn(
        "min-h-svh bg-background px-4 sm:px-6 md:min-h-svh md:px-8 md:py-10 md:pt-8 lg:px-10 lg:py-12",
        MOBILE_TAB_BAR_PAGE_SHELL,
      )}
    >
      <div className="mx-auto w-full max-w-7xl">
        <ProfileHeaderSection />
        <ProfilePlanSection />
        <ProfileResourcesSection />
        <ProfileSignOutRow />
      </div>
    </main>
  )
}
