"use client"

import { ProfileHeaderSection } from "@/components/tenant/profile/profile-header-section"
import { ProfilePlanSection } from "@/components/tenant/profile/profile-plan-section"
import { ProfileResourcesSection } from "@/components/tenant/profile/profile-resources-section"
import { ProfileSignOutRow } from "@/components/tenant/profile/profile-sign-out-row"

export default function ProfilePage() {
  return (
    <main className="min-h-[100dvh] bg-cream-page px-4 py-6 sm:px-6 md:min-h-[calc(100vh-4rem)] md:px-8 md:py-10 md:pt-8 lg:px-10 lg:py-12">
      <div className="mx-auto w-full max-w-7xl">
        <ProfileHeaderSection />
        <ProfilePlanSection />
        <ProfileResourcesSection />
        <ProfileSignOutRow />
      </div>
    </main>
  )
}
