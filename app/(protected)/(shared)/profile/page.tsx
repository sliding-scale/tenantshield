"use client"

import { UserButton } from "@clerk/nextjs"

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      <h1 className="font-heading text-2xl font-semibold text-foreground md:text-3xl">Profile</h1>
      <p className="mt-3 max-w-prose text-muted-foreground">
        Manage your account and preferences. Use the avatar menu below on mobile, or open the user
        menu in the header on desktop.
      </p>
      <div className="mt-8 flex items-center gap-4">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-12 w-12",
            },
          }}
        />
        <span className="text-sm text-muted-foreground">Account menu</span>
      </div>
    </div>
  )
}
