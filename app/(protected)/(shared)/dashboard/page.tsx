"use client";

import AdminDashboardMain from "@/components/admin/dashboard-main";
import TenantDashboardMain from "@/components/tenant/dashboard/dashboard-main";
import useCurrentUser from "@/app/hooks/useCurrentUser";
import useOnboardingStatus from "@/app/hooks/useOnboardingStatus";
import NoAccessMessage from "@/components/shared/NoAccessMessage";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldLoader } from "@/components/shared/shield-loader";

function DashboardLoading() {
  return <ShieldLoader variant="route" fullPage label="Loading…" />;
}

export default function SharedDashboardPage() {
  const router = useRouter();
  const { role, isLoading, convexUser, clerkUser } = useCurrentUser();
  const { onboardingStatus, isLoading: isOnboardingLoading } = useOnboardingStatus(
    clerkUser?.id,
  );

  useEffect(() => {
    if (role === "admin") {
      router.replace("/admin/users");
    } else if (role === "tenant" && onboardingStatus?.shouldShowOnboarding) {
      router.replace("/onboarding");
    }
  }, [role, onboardingStatus, router]);

  if (isLoading) {
    return <DashboardLoading />;
  }

  if (!clerkUser) {
    return (
      <NoAccessMessage
        title="Sign in required"
        body="You need to be signed in to view the dashboard."
      />
    );
  }

  if (convexUser === null) {
    return (
      <NoAccessMessage
        title="Account setup in progress"
        body="Your profile is not ready yet. This usually finishes right after sign-up. Try refreshing in a moment, or contact support if it continues."
      />
    );
  }

  if (role === "admin") {
    return <AdminDashboardMain />;
  }

  if (role === "tenant") {
    if (isOnboardingLoading) {
      return <DashboardLoading />;
    }
    if (onboardingStatus?.shouldShowOnboarding) {
      return null;
    }
    return <TenantDashboardMain />;
  }

  return null;
}
