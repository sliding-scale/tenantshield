"use client";

import useCurrentUser from "@/app/hooks/useCurrentUser";
import NoAccessMessage from "@/components/shared/NoAccessMessage";

export default function AdminSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role, isLoading, convexUser } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary"
          aria-hidden
        />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!convexUser || role !== "admin") {
    return (
      <NoAccessMessage
        title="Admin only"
        body="You don’t have permission to view this section."
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
      {children}
    </div>
  );
}
