"use client";

import useCurrentUser from "@/app/hooks/useCurrentUser";
import NoAccessMessage from "@/components/shared/NoAccessMessage";
import { ShieldLoader } from "@/components/shared/shield-loader";

export default function AdminSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role, isLoading, convexUser } = useCurrentUser();

  if (isLoading) {
    return <ShieldLoader variant="admin" fullPage />;
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
