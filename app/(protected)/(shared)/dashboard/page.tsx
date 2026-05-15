"use client";

import AdminDashboardMain from "@/components/admin/dashboard-main";
import TenantDashboardMain from "@/components/tenant/dashboard/dashboard-main";
import useCurrentUser from "@/app/hooks/useCurrentUser";
import NoAccessMessage from "@/components/shared/NoAccessMessage";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldLoader } from "@/components/shared/shield-loader";

export default function SharedDashboardPage() {
  const router = useRouter();
  const { role, isLoading, convexUser, clerkUser } = useCurrentUser();
  const onboardingStatus = useQuery(
    api.onboarding.queries.onboardingStatus,
    clerkUser ? {} : "skip",
  );

  useEffect(() => {
    if (role === "admin") {
      router.replace("/admin/users");
    } else if (role === "tenant" && onboardingStatus?.shouldShowOnboarding) {
      router.replace("/onboarding");
    }
  }, [role, onboardingStatus, router]);

  if (isLoading) {
    return <ShieldLoader variant="account" fullPage />;
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
    if (onboardingStatus === undefined) {
      return <ShieldLoader variant="onboarding" fullPage />;
    }
    if (onboardingStatus?.shouldShowOnboarding) {
      return null;
    }
    return <TenantDashboardMain />;
  }

  return null;
}
