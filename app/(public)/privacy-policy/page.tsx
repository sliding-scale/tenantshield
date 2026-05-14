import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-amber-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border-2 border-amber-200 bg-white/95 p-6 shadow-xl shadow-emerald-100/60 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
            Static Legal Page
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-gray-500">
            Last Updated: May 14, 2026
          </p>

          <section className="mt-8 space-y-4 text-sm leading-7 text-gray-700 sm:text-base">
            <h2 className="text-xl font-bold text-gray-900">
              1. Information We Collect
            </h2>
            <p>
              This page uses dummy policy content for layout and design preview.
              We may collect account details, usage analytics, support messages,
              and uploaded document metadata to provide platform features.
            </p>
          </section>

          <section className="mt-8 space-y-4 text-sm leading-7 text-gray-700 sm:text-base">
            <h2 className="text-xl font-bold text-gray-900">
              2. How We Use Data
            </h2>
            <p>
              Example data use cases include improving analysis quality,
              detecting abuse, personalizing dashboards, and communicating
              product updates.
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>To provide tenant-focused legal workflow features.</li>
              <li>To improve service reliability and bug response times.</li>
              <li>To deliver account notices and transactional emails.</li>
            </ul>
          </section>

          <section className="mt-8 space-y-4 text-sm leading-7 text-gray-700 sm:text-base">
            <h2 className="text-xl font-bold text-gray-900">3. Data Sharing</h2>
            <p>
              In this placeholder example, data may be shared with trusted
              service providers, infrastructure partners, and compliance vendors
              under contractual privacy obligations.
            </p>
          </section>

          <section className="mt-8 space-y-4 text-sm leading-7 text-gray-700 sm:text-base">
            <h2 className="text-xl font-bold text-gray-900">
              4. Retention and Security
            </h2>
            <p>
              We use administrative, technical, and organizational safeguards.
              Retention periods depend on legal obligations, user requests, and
              operational requirements.
            </p>
          </section>

          <section className="mt-8 space-y-4 text-sm leading-7 text-gray-700 sm:text-base">
            <h2 className="text-xl font-bold text-gray-900">
              5. Your Privacy Choices
            </h2>
            <p>
              You may request access, correction, deletion, or export of your
              data where applicable. Replace this placeholder section with your
              final jurisdiction-specific privacy rights text.
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
