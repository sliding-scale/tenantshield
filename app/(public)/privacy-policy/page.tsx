import Link from "next/link";
import { PrivacyPolicyContent } from "@/components/shared/privacy-policy-content";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-amber-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl border-2 border-amber-200 bg-white/95 p-6 shadow-xl shadow-emerald-100/60 sm:p-10">
          
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-gray-500">
            Last Updated: May 15, 2026
          </p>

          <PrivacyPolicyContent />

          <div className="mt-10 flex flex-col gap-3 border-t border-amber-100 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border-2 border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-800 transition-colors duration-200 hover:border-amber-400 hover:text-amber-700"
            >
              Back to Home
            </Link>
            <Link
              href="/terms-of-service"
              className="inline-flex items-center justify-center rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-amber-600"
            >
              Read Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}


