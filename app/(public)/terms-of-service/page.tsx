import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-emerald-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border-2 border-amber-200 bg-white/95 p-6 shadow-xl shadow-amber-100/50 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
            Static Legal Page
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm text-gray-500">
            Last Updated: May 14, 2026
          </p>

          <section className="mt-8 space-y-4 text-sm leading-7 text-gray-700 sm:text-base">
            <h2 className="text-xl font-bold text-gray-900">
              1. Agreement Overview
            </h2>
            <p>
              This is placeholder content for demonstration purposes. By using
              TenantShield, you agree to these sample terms, which describe how
              the service may be accessed, reviewed, and updated over time.
            </p>
            <p>
              You understand that these terms are not legal advice and should be
              replaced with finalized legal copy before production launch.
            </p>
          </section>

          <section className="mt-8 space-y-4 text-sm leading-7 text-gray-700 sm:text-base">
            <h2 className="text-xl font-bold text-gray-900">
              2. Account Responsibilities
            </h2>
            <p>
              You are responsible for maintaining the confidentiality of your
              account credentials and for activity that occurs under your
              account, including document uploads and case submissions.
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Provide accurate profile and tenancy information.</li>
              <li>Do not submit unlawful, abusive, or infringing material.</li>
              <li>
                Notify support if you suspect unauthorized account access.
              </li>
            </ul>
          </section>

          <section className="mt-8 space-y-4 text-sm leading-7 text-gray-700 sm:text-base">
            <h2 className="text-xl font-bold text-gray-900">
              3. Service Availability
            </h2>
            <p>
              Platform features may change, pause, or be discontinued as part of
              product updates. We may temporarily limit access for maintenance,
              security reviews, or infrastructure upgrades.
            </p>
            <p>
              Trial plans and pricing examples displayed on this page are dummy
              values and can be changed without notice.
            </p>
          </section>

          <section className="mt-8 space-y-4 text-sm leading-7 text-gray-700 sm:text-base">
            <h2 className="text-xl font-bold text-gray-900">
              4. Limitation of Liability
            </h2>
            <p>
              TenantShield is provided "as is" in this placeholder template.
              Liability, warranty, dispute, and jurisdiction clauses should be
              replaced by legal counsel with enforceable language.
            </p>
          </section>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border-2 border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-800 transition-colors duration-200 hover:border-amber-400 hover:text-amber-700"
            >
              Back to Home
            </Link>
            <Link
              href="/privacy-policy"
              className="inline-flex items-center justify-center rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-amber-600"
            >
              Read Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
