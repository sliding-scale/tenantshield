import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { TermsOfServiceContent } from "@/components/shared/terms-of-service-content";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function TermsOfServicePage() {
  return (
    <main className="min-h-svh bg-background px-4 py-10 sm:px-6 md:py-14 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Button variant="ghost" size="sm" className="-ml-2 mb-6 gap-1 rounded-full" asChild>
          <Link href="/">
            <ChevronLeft className="size-4" aria-hidden />
            Back
          </Link>
        </Button>

        <Card className="gap-0 rounded-3xl border border-border py-0 shadow-none ring-0">
          <div className="p-6 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Legal
            </p>
            <h1 className="mt-2 font-heading text-3xl font-semibold text-foreground sm:text-4xl">
              Terms of Service
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">Last Updated: May 15, 2026</p>

            <TermsOfServiceContent variant="page" />

            <div className="mt-10 flex flex-col gap-3 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
              <Button variant="outline" className="rounded-xl" asChild>
                <Link href="/">Back to home</Link>
              </Button>
              <Button variant="default" className="rounded-xl" asChild>
                <Link href="/privacy-policy">Privacy Policy</Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
