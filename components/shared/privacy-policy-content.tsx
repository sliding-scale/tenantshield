import Link from "next/link";
import type { ReactNode } from "react";
import { SUPPORT_EMAIL } from "@/lib/legal-contact";

const supportEmailClass = "font-medium text-amber-800 underline underline-offset-2";

function SupportEmail({ className }: { className?: string }) {
  return (
    <a href={`mailto:${SUPPORT_EMAIL}`} className={className ?? supportEmailClass}>
      {SUPPORT_EMAIL}
    </a>
  );
}

type CalloutVariant = "red" | "green" | "gold" | "orange";

const calloutStyles: Record<CalloutVariant, string> = {
  red: "border-red-200 bg-red-50 text-red-950",
  green: "border-emerald-200 bg-emerald-50 text-emerald-950",
  gold: "border-amber-200 bg-amber-50 text-amber-950",
  orange: "border-orange-200 bg-orange-50 text-orange-950",
};

function Callout({
  variant,
  icon,
  children,
}: {
  variant: CalloutVariant;
  icon: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`mt-6 flex gap-3 rounded-2xl border-2 p-4 text-sm leading-6 sm:p-5 sm:text-base ${calloutStyles[variant]}`}
    >
      <span className="shrink-0 text-lg" aria-hidden>
        {icon}
      </span>
      <div className="min-w-0 [&_strong]:font-semibold">{children}</div>
    </div>
  );
}

function PolicySection({
  id,
  sectionNum,
  title,
  children,
}: {
  id: string;
  sectionNum: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 border-t border-amber-100 pt-10 first:border-t-0 first:pt-0"
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
        {sectionNum}
      </p>
      <h2 className="mt-2 text-xl font-bold text-gray-900 sm:text-2xl">{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-7 text-gray-700 sm:text-base">
        {children}
      </div>
    </section>
  );
}

function DefGrid({ rows }: { rows: { term: string; meaning: ReactNode }[] }) {
  return (
    <dl className="mt-4 divide-y divide-amber-100 rounded-2xl border border-amber-100 bg-amber-50/40">
      {rows.map((row) => (
        <div
          key={row.term}
          className="grid gap-1 px-4 py-3 sm:grid-cols-[minmax(8rem,11rem)_1fr] sm:gap-4 sm:py-4"
        >
          <dt className="text-sm font-semibold text-gray-900">{row.term}</dt>
          <dd className="text-sm leading-6 text-gray-700">{row.meaning}</dd>
        </div>
      ))}
    </dl>
  );
}

function DataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="mt-4 overflow-x-auto rounded-2xl border border-amber-100">
      <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
        <thead>
          <tr className="bg-amber-50/80">
            {headers.map((header) => (
              <th
                key={header}
                className="border-b border-amber-100 px-4 py-3 font-semibold text-gray-900"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-amber-50 last:border-b-0">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 align-top text-gray-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const tocItems = [
  { href: "#pp-1", label: "1. Who We Are" },
  { href: "#pp-2", label: "2. Definitions" },
  { href: "#pp-3", label: "3. Information We Collect" },
  { href: "#pp-4", label: "4. How We Use Your Information" },
  { href: "#pp-5", label: "5. AI & Automated Processing" },
  { href: "#pp-6", label: "6. How We Share Information" },
  { href: "#pp-7", label: "7. Data Retention" },
  { href: "#pp-8", label: "8. Security" },
  { href: "#pp-9", label: "9. Your Rights — All Users" },
  { href: "#pp-10", label: "10. California Residents (CCPA/CPRA)" },
  { href: "#pp-11", label: "11. EU/UK Residents (GDPR)" },
  { href: "#pp-12", label: "12. Children's Privacy" },
  { href: "#pp-13", label: "13. Cookies & Tracking" },
  { href: "#pp-14", label: "14. Third-Party Services" },
  { href: "#pp-15", label: "15. Changes to This Policy" },
  { href: "#pp-16", label: "16. Contact Us" },
];

export function PrivacyPolicyContent() {
  return (
  <>
      <Callout variant="red" icon="⚠️">
        <p>
          <strong>Important Notice:</strong> TenantShield is not a law firm and does
          not provide legal advice. This Privacy Policy governs how we collect, use,
          and protect your personal information. For questions about this policy,
          contact us at <SupportEmail className="font-semibold underline underline-offset-2" />
        </p>
      </Callout>

      <nav
        aria-label="Table of contents"
        className="mt-8 rounded-2xl border-2 border-amber-100 bg-amber-50/50 p-5 sm:p-6"
      >
        <p className="text-sm font-bold text-gray-900">Table of Contents</p>
        <ol className="mt-3 columns-1 gap-x-8 space-y-1.5 text-sm sm:columns-2">
          {tocItems.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="text-amber-800 underline-offset-2 hover:text-amber-950 hover:underline"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-10 space-y-10">
        <PolicySection id="pp-1" sectionNum="Section 01" title="Who We Are">
          <p>
            TenantShield, Inc. (&quot;TenantShield,&quot; &quot;we,&quot; &quot;us,&quot;
            or &quot;our&quot;) operates the TenantShield platform, including our website
            at www.tenantshieldusa.com, our mobile applications, and all related services
            (collectively, the &quot;Services&quot;). We are incorporated in the State
            of Delaware and operate in the United States.
          </p>
          <p>
            TenantShield is a technology platform that provides AI-powered
            informational guidance about tenant rights.{" "}
            <strong>
              We are not a law firm, we do not practice law, and we do not provide
              legal advice.
            </strong>{" "}
            Nothing in our Services or this Privacy Policy creates an
            attorney-client relationship.
          </p>
          <p>
            As the operator of the Services, TenantShield is the &quot;data
            controller&quot; for purposes of applicable privacy laws including the GDPR
            and the California Consumer Privacy Act (CCPA) as amended by the
            California Privacy Rights Act (CPRA).
          </p>
          <p>
            <strong>Data Controller Contact:</strong>
            <br />
            TenantShield, Inc.
            <br />
            Attn: Privacy Officer
            <br />
            Email: <SupportEmail />
            <br />
            Website:{" "}
            <Link
              href="/privacy-policy"
              className="font-medium text-amber-800 underline underline-offset-2"
            >
              www.tenantshieldusa.com/privacy-policy
            </Link>
          </p>
        </PolicySection>

        <PolicySection id="pp-2" sectionNum="Section 02" title="Definitions">
          <DefGrid
            rows={[
              {
                term: "Personal Data",
                meaning:
                  "Any information that identifies or could identify a natural person, directly or indirectly, including name, email address, location data, or online identifiers.",
              },
              {
                term: "Sensitive Personal Data",
                meaning:
                  "A subset of personal data including: precise geolocation, racial or ethnic origin, religious beliefs, health data, financial account details, contents of communications, and data about sexual orientation or immigration status.",
              },
              {
                term: "Processing",
                meaning:
                  "Any operation performed on personal data, including collection, storage, use, disclosure, or deletion.",
              },
              {
                term: "ADMT",
                meaning:
                  "Automated Decision-Making Technology — computational processes that substantially replace human decision-making, as defined under California's CCPA regulations effective January 1, 2026.",
              },
              {
                term: "Services",
                meaning:
                  "All TenantShield products, features, websites, mobile applications, APIs, and customer support channels.",
              },
              {
                term: "User / You",
                meaning:
                  "Any individual who accesses or uses the TenantShield Services, whether or not they have created an account.",
              },
              {
                term: "Case Data",
                meaning:
                  "Information you provide describing a landlord dispute, including property addresses, landlord names, dispute descriptions, uploaded documents, and timeline events.",
              },
              {
                term: "AI Analysis",
                meaning:
                  "Informational output generated by our AI system in response to your input. AI Analysis is not legal advice and does not constitute a legal opinion.",
              },
            ]}
          />
        </PolicySection>

        <PolicySection
          id="pp-3"
          sectionNum="Section 03"
          title="Information We Collect"
        >
          <h3 className="text-lg font-semibold text-gray-900">
            3.1 Information You Provide Directly
          </h3>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Account Information:</strong> First name, last name, email
              address, password (stored as a one-way bcrypt hash — we cannot read your
              password), state of residence, and city.
            </li>
            <li>
              <strong>Case Data:</strong> Descriptions of landlord disputes, property
              addresses, landlord names and contact information, incident dates, and
              case notes you choose to enter.
            </li>
            <li>
              <strong>Documents:</strong> Files you upload to the platform including
              leases, eviction notices, letters, photographs, and other documents.
              Uploaded documents are stored securely and used only to provide you with
              AI-powered analysis.
            </li>
            <li>
              <strong>Communications:</strong> Messages you send to our AI assistant,
              support team, or through any chat feature. These are stored to provide
              continuity of service and improve our AI responses.
            </li>
            <li>
              <strong>Payment Information:</strong> We do not store your payment card
              details. All payment processing is handled by Stripe, Inc. We receive
              and store a Stripe Customer ID and subscription status only. Stripe&apos;s
              privacy policy governs their processing of your payment data.
            </li>
            <li>
              <strong>Profile Preferences:</strong> Settings, state preferences, and
              notification choices you configure within your account.
            </li>
          </ul>

          <h3 className="pt-2 text-lg font-semibold text-gray-900">
            3.2 Information We Collect Automatically
          </h3>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Usage Data:</strong> Pages and features accessed, search
              queries, features used, time spent on features, and interaction patterns
              within the platform.
            </li>
            <li>
              <strong>Device Information:</strong> Browser type, operating system,
              device type, screen resolution, and language settings.
            </li>
            <li>
              <strong>Log Data:</strong> IP address, access timestamps, referring
              URLs, error logs, and API request data. IP addresses are pseudonymized
              within 30 days.
            </li>
            <li>
              <strong>Cookies and Similar Technologies:</strong> Session cookies,
              authentication tokens, and analytics identifiers. See Section 13 for
              full cookie details.
            </li>
          </ul>

          <h3 className="pt-2 text-lg font-semibold text-gray-900">
            3.3 Information We Do NOT Collect
          </h3>
          <Callout variant="green" icon="✅">
            <p>
              TenantShield does <strong>not</strong> collect: Social Security Numbers,
              government-issued ID numbers, biometric data, financial account numbers,
              credit scores, health or medical information, racial or ethnic origin
              (unless you voluntarily include it in case descriptions), or precise
              real-time geolocation. We do not track your location beyond the
              state-level information you choose to provide.
            </p>
          </Callout>

          <h3 className="pt-2 text-lg font-semibold text-gray-900">
            3.4 Information from Third Parties
          </h3>
          <p>
            If you connect third-party accounts or services, we may receive limited
            profile information as authorized by you. We do not purchase personal data
            from data brokers. If we ever receive referrals from partners, we receive
            only the information necessary to create your account and attribute the
            referral.
          </p>
        </PolicySection>

        <PolicySection
          id="pp-4"
          sectionNum="Section 04"
          title="How We Use Your Information"
        >
          <p>
            We use your personal data only for the following specific, disclosed
            purposes. We do not use your data for any purpose not listed here without
            obtaining your explicit prior consent.
          </p>
          <DataTable
            headers={["Purpose", "Data Used", "Legal Basis"]}
            rows={[
              [
                "Providing the Services",
                "Account info, Case Data, Documents, AI chat history",
                "Contract performance",
              ],
              [
                "AI Analysis & Responses",
                "Case descriptions, documents, state, chat messages",
                "Contract performance + Consent",
              ],
              [
                "Account Authentication",
                "Email, password hash, session tokens",
                "Contract performance",
              ],
              [
                "Payment Processing",
                "Email, Stripe Customer ID, subscription status",
                "Contract performance",
              ],
              [
                "Security & Fraud Prevention",
                "IP address, usage patterns, device info",
                "Legitimate interests",
              ],
              [
                "Service Improvement",
                "Anonymized/aggregated usage data only",
                "Legitimate interests",
              ],
              [
                "Customer Support",
                "Account info, case descriptions, support messages",
                "Contract performance",
              ],
              [
                "Legal Compliance",
                "Minimum necessary data as required by law",
                "Legal obligation",
              ],
              [
                "Transactional Emails",
                "Email address, subscription status",
                "Contract performance",
              ],
              [
                "Marketing Emails",
                "Email address only",
                "Consent (opt-in only)",
              ],
            ]}
          />
          <Callout variant="red" icon="🚫">
            <p>
              <strong>We will NEVER:</strong> Sell your personal data to any third
              party. Share your individual case details, documents, or dispute
              information with landlords, property managers, courts, employers, or any
              adverse party in your dispute. Use your case data for targeted
              advertising. Train AI models on your identifiable personal data without
              your explicit opt-in consent.
            </p>
          </Callout>
        </PolicySection>

        <PolicySection
          id="pp-5"
          sectionNum="Section 05"
          title="AI & Automated Processing Disclosures"
        >
          <Callout variant="gold" icon="🤖">
            <p>
              <strong>
                Required Disclosure under California CCPA ADMT Regulations (Effective
                January 1, 2026):
              </strong>{" "}
              TenantShield uses AI-powered automated processing to generate
              informational analyses of tenant situations, documents, and legal
              questions. This section explains how that processing works, what data it
              uses, and your rights regarding it.
            </p>
          </Callout>

          <h3 className="text-lg font-semibold text-gray-900">5.1 How Our AI Works</h3>
          <p>
            TenantShield uses Google&apos;s Gemini API to process your inputs and
            generate informational responses. When you submit a case description,
            upload a document, or ask a question, the following occurs:
          </p>
          <ol className="list-decimal space-y-2 pl-6">
            <li>
              Your input (text or document content) is transmitted to Google&apos;s Gemini
              API via an encrypted connection.
            </li>
            <li>
              The API generates a response based on your input and a system prompt that
              instructs it to provide tenant rights information relevant to your state.
            </li>
            <li>
              The response is returned to you and stored in our database associated with
              your account.
            </li>
            <li>
              A &quot;case strength score&quot; (0–100%) is generated as a general
              informational indicator — it is not a legal assessment, prediction, or
              guarantee of any outcome.
            </li>
          </ol>

          <h3 className="pt-2 text-lg font-semibold text-gray-900">
            5.2 What Our AI Does NOT Do
          </h3>
          <ul className="list-disc space-y-2 pl-6">
            <li>Our AI does not make legal decisions. It provides information, not legal advice.</li>
            <li>
              Our AI does not determine your eligibility for housing, benefits,
              employment, or any government program.
            </li>
            <li>
              Our AI does not access court databases, landlord records, credit files,
              eviction records, or any external databases about you or your landlord.
            </li>
            <li>
              Our AI output does not have legal effect and cannot be relied upon as a
              substitute for advice from a licensed attorney.
            </li>
          </ul>

          <h3 className="pt-2 text-lg font-semibold text-gray-900">
            5.3 Your Rights Regarding Automated Processing
          </h3>
          <p>
            Under California&apos;s ADMT regulations and GDPR Article 22, you have the
            following rights regarding our automated processing:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Right to Access:</strong> You can request a plain-language
              explanation of how our AI generated a specific analysis for you.
            </li>
            <li>
              <strong>Right to Opt Out:</strong> You may opt out of AI-powered analysis
              at any time. If you do so, you will receive only static informational
              content. Contact <SupportEmail /> to opt out.
            </li>
            <li>
              <strong>Right to Human Review:</strong> If you believe an AI-generated
              analysis has materially harmed you, you may request a human review of that
              output. Submit requests to {SUPPORT_EMAIL} with the subject line
              &quot;ADMT Human Review Request.&quot;
            </li>
            <li>
              <strong>Right to Correction:</strong> If an AI analysis contains factual
              errors about your situation that you reported to us, you may request
              correction of your case record.
            </li>
          </ul>

          <h3 className="pt-2 text-lg font-semibold text-gray-900">5.4 AI Training Data</h3>
          <p>
            TenantShield does not use your personally identifiable case data, documents,
            or communications to train AI models without your explicit opt-in consent.
            We may use fully anonymized, aggregated, and de-identified data to improve
            our system prompts and response quality. Individual users cannot be
            re-identified from this aggregated data.
          </p>

          <h3 className="pt-2 text-lg font-semibold text-gray-900">
            5.5 Google Gemini Data Processing
          </h3>
          <p>
            When you use our AI features, your input is processed by Google LLC through
            the Gemini API pursuant to our agreement with Google. Google processes API
            requests to generate responses and does not use your TenantShield inputs to
            train Gemini models for other customers under Google&apos;s standard API terms.
            You can review Google&apos;s privacy policy at{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-amber-800 underline underline-offset-2"
            >
              policies.google.com/privacy
            </a>{" "}
            and the Gemini API terms at{" "}
            <a
              href="https://ai.google.dev/gemini-api/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-amber-800 underline underline-offset-2"
            >
              ai.google.dev/gemini-api/terms
            </a>
            .
          </p>
        </PolicySection>

        <PolicySection
          id="pp-6"
          sectionNum="Section 06"
          title="How We Share Your Information"
        >
          <h3 className="text-lg font-semibold text-gray-900">
            6.1 We Do Not Sell Your Data
          </h3>
          <p>
            TenantShield does not sell, rent, lease, or otherwise transfer your personal
            data to third parties for monetary or other valuable consideration. This
            applies to all categories of personal data including names, email addresses,
            case information, documents, and behavioral data.
          </p>

          <h3 className="pt-2 text-lg font-semibold text-gray-900">
            6.2 Service Providers (Data Processors)
          </h3>
          <p>
            We share limited personal data with trusted service providers who process data
            on our behalf under binding data processing agreements. These providers are
            prohibited from using your data for any purpose other than providing
            services to TenantShield:
          </p>
          <DefGrid
            rows={[
              {
                term: "Google (Gemini API)",
                meaning: (
                  <>
                    AI API provider. Receives your text and document inputs to generate
                    informational responses via Google Gemini models (e.g., Gemini 2.5
                    Flash and Gemini 2.5 Pro). Governed by Google&apos;s API and privacy
                    terms. Privacy:{" "}
                    <a
                      href="https://policies.google.com/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-amber-800 underline underline-offset-2"
                    >
                      policies.google.com/privacy
                    </a>
                  </>
                ),
              },
              {
                term: "Stripe, Inc.",
                meaning: (
                  <>
                    Payment processing. Receives your payment card information directly —
                    we never see or store it. Governs its own data. Privacy:{" "}
                    <a
                      href="https://stripe.com/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-amber-800 underline underline-offset-2"
                    >
                      stripe.com/privacy
                    </a>
                  </>
                ),
              },
              {
                term: "Cloud Infrastructure",
                meaning:
                  "Servers and database hosting. All data is encrypted at rest (AES-256) and in transit (TLS 1.3). Located in the United States.",
              },
              {
                term: "SendGrid / Email",
                meaning:
                  "Transactional email delivery (account confirmations, password resets). Receives your email address only.",
              },
            ]}
          />

          <h3 className="pt-2 text-lg font-semibold text-gray-900">6.3 Legal Disclosures</h3>
          <p>
            We may disclose your personal data if required to do so by law, regulation,
            legal process, or governmental request, including valid subpoenas, court
            orders, or law enforcement requests. We will notify you of such requests to
            the extent permitted by law and challenge overbroad or unclear demands.
          </p>

          <h3 className="pt-2 text-lg font-semibold text-gray-900">6.4 Business Transfers</h3>
          <p>
            If TenantShield is involved in a merger, acquisition, asset sale, or
            bankruptcy proceeding, your personal data may be transferred as part of that
            transaction. We will notify you via email and/or a prominent notice on our
            Services at least 30 days before your personal data becomes subject to a
            different privacy policy. You will have the right to request deletion of your
            data prior to any such transfer.
          </p>

          <h3 className="pt-2 text-lg font-semibold text-gray-900">
            6.5 Aggregated & De-Identified Data
          </h3>
          <p>
            We may share aggregated, anonymized, and de-identified data — such as general
            usage statistics or aggregate trends across our user base — for research,
            business development, or public interest purposes. This data cannot reasonably
            be used to identify you individually.
          </p>

          <h3 className="pt-2 text-lg font-semibold text-gray-900">
            6.6 Landlord Report Card (Future Feature)
          </h3>
          <p>
            When we launch the Landlord Report Card feature, ratings you submit will be
            displayed publicly in association with the property address and landlord name
            you provide. Your personal identity will not be publicly associated with any
            rating. You will be informed of these specific terms at the time you submit a
            rating, and you will have the ability to delete your rating at any time.
          </p>
        </PolicySection>

        <PolicySection id="pp-7" sectionNum="Section 07" title="Data Retention">
          <p>
            We retain your personal data only as long as necessary for the purposes
            described in this policy, or as required by law. Our specific retention
            periods are:
          </p>
          <DataTable
            headers={["Data Type", "Retention Period", "Reason"]}
            rows={[
              [
                "Account Information",
                "Duration of account + 90 days after deletion request",
                "Service provision; 90-day recovery window",
              ],
              [
                "Case Data & Analysis",
                "Duration of account + 90 days",
                "User access to their dispute history",
              ],
              [
                "Uploaded Documents",
                "Duration of account + 30 days after deletion",
                "User-controlled; promptly deleted on request",
              ],
              [
                "AI Chat History",
                "24 months from last interaction",
                "Continuity of service; user reference",
              ],
              ["Payment Records", "7 years", "Legal/tax compliance requirements"],
              [
                "Security Logs",
                "12 months",
                "Fraud detection and security investigations",
              ],
              [
                "IP Addresses",
                "30 days (then pseudonymized)",
                "Security; pseudonymized for analytics",
              ],
              ["Backup Data", "90 days rolling", "Disaster recovery; overwritten automatically"],
              [
                "Deleted Account Data",
                "30 days in backups, then permanently purged",
                "Backup recovery window",
              ],
            ]}
          />
          <p>
            When data reaches the end of its retention period, we permanently delete or
            irreversibly anonymize it. You may request earlier deletion of your data as
            described in Section 9.
          </p>
        </PolicySection>

        <PolicySection id="pp-8" sectionNum="Section 08" title="Security">
          <p>
            We implement industry-standard technical and organizational security measures
            to protect your personal data against unauthorized access, disclosure,
            alteration, or destruction. Our security practices include:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Encryption in Transit:</strong> All data transmitted between your
              device and our servers uses TLS 1.3 encryption.
            </li>
            <li>
              <strong>Encryption at Rest:</strong> All databases and file storage are
              encrypted using AES-256.
            </li>
            <li>
              <strong>Password Security:</strong> Passwords are hashed using bcrypt with a
              cost factor of 12. We cannot read your password.
            </li>
            <li>
              <strong>Authentication:</strong> JWT-based authentication with short-lived
              access tokens (15-minute expiry) and refresh token rotation.
            </li>
            <li>
              <strong>Access Controls:</strong> Strict role-based access controls. Only
              authorized personnel can access personal data, and only when necessary for
              their job function.
            </li>
            <li>
              <strong>Vulnerability Management:</strong> Regular security assessments and
              prompt patching of known vulnerabilities.
            </li>
            <li>
              <strong>Payment Security:</strong> We are PCI-compliant by using Stripe. We
              never transmit or store raw payment card data on our servers.
            </li>
          </ul>
          <Callout variant="orange" icon="🔔">
            <p>
              <strong>Data Breach Notification:</strong> In the event of a data breach
              that poses a risk to your rights and freedoms, we will notify you and
              applicable regulatory authorities within 72 hours of discovering the breach,
              to the extent required by applicable law. Notification will be sent to the
              email address associated with your account.
            </p>
          </Callout>
          <p>
            No security system is impenetrable. We cannot guarantee absolute security of
            your data, but we continuously work to protect it using best practices and
            promptly investigate and address any security incidents.
          </p>
        </PolicySection>

        <PolicySection id="pp-9" sectionNum="Section 09" title="Your Rights — All Users">
          <p>
            Regardless of where you are located, TenantShield provides the following
            rights to all users:
          </p>
          <DataTable
            headers={["Right", "What It Means", "How to Exercise"]}
            rows={[
              [
                "Access",
                "Request a copy of all personal data we hold about you in a portable format",
                `Email ${SUPPORT_EMAIL} · Respond within 30 days`,
              ],
              [
                "Correction",
                "Request correction of inaccurate or incomplete personal data",
                "Update in account settings or email us",
              ],
              [
                "Deletion",
                "Request deletion of your account and all associated personal data",
                "Settings → Delete Account, or email us",
              ],
              [
                "Portability",
                "Receive your data in a machine-readable format (JSON or CSV)",
                `Email ${SUPPORT_EMAIL}`,
              ],
              [
                "Restriction",
                "Request we stop processing your data while a dispute is pending",
                `Email ${SUPPORT_EMAIL}`,
              ],
              [
                "Objection",
                "Object to processing based on legitimate interests",
                `Email ${SUPPORT_EMAIL}`,
              ],
              [
                "Withdraw Consent",
                "Withdraw consent for marketing emails or AI opt-in features at any time",
                "Unsubscribe link in emails or account settings",
              ],
              [
                "Non-Discrimination",
                "We will not deny services, charge different prices, or provide lower quality service because you exercised any privacy right",
                "N/A — this protection is automatic",
              ],
            ]}
          />
          <p>
            We will respond to all verified requests within 30 days (extendable to 60 days
            for complex requests with notice). We may need to verify your identity before
            fulfilling requests. We will not charge a fee for reasonable requests.
          </p>
        </PolicySection>

        <PolicySection
          id="pp-10"
          sectionNum="Section 10"
          title="California Residents — CCPA / CPRA"
        >
          <Callout variant="green" icon="🌴">
            <p>
              <strong>This section applies to California residents</strong> and describes
              your rights under the California Consumer Privacy Act (CCPA) as amended by
              the California Privacy Rights Act (CPRA), and California&apos;s Automated
              Decision-Making Technology (ADMT) regulations effective January 1, 2026.
            </p>
          </Callout>

          <h3 className="text-lg font-semibold text-gray-900">
            10.1 Categories of Personal Information Collected
          </h3>
          <p>
            In the preceding 12 months, TenantShield has collected the following
            categories of personal information as defined by the CCPA:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Identifiers:</strong> Name, email address, IP address, account ID
            </li>
            <li>
              <strong>
                Personal information categories under Cal. Civ. Code §1798.80(e):
              </strong>{" "}
              Name, email address
            </li>
            <li>
              <strong>Commercial information:</strong> Subscription tier, purchase history
            </li>
            <li>
              <strong>Internet/electronic activity:</strong> Browsing activity within our
              Services, features accessed
            </li>
            <li>
              <strong>Geolocation data:</strong> State-level only (as provided by you) —
              we do not collect precise geolocation
            </li>
            <li>
              <strong>Inferences:</strong> Account preferences drawn from usage patterns
            </li>
          </ul>
          <p>
            We do not collect: Sensitive personal information as defined by CPRA
            (including Social Security numbers, financial account data, precise
            geolocation, racial/ethnic origin, religious beliefs, biometric data, health
            data, or contents of private communications) unless you voluntarily include
            such information in your case descriptions.
          </p>

          <h3 className="pt-2 text-lg font-semibold text-gray-900">
            10.2 California Privacy Rights
          </h3>
          <p>
            California residents have all rights listed in Section 9, plus the following
            additional rights:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Right to Know:</strong> The specific pieces of personal information
              collected about you; the categories of sources; the business purpose for
              collection; and the categories of third parties with whom we share
              information.
            </li>
            <li>
              <strong>Right to Opt Out of Sale/Sharing:</strong> We do not sell or share
              personal information as defined by CCPA. If this changes, we will provide a
              &quot;Do Not Sell or Share My Personal Information&quot; link prominently on
              our homepage.
            </li>
            <li>
              <strong>Right to Limit Use of Sensitive Personal Information:</strong> If we
              ever process sensitive personal information beyond what is necessary to
              provide Services, you may limit such use.
            </li>
            <li>
              <strong>Right to Non-Discrimination:</strong> Explicitly protected under CCPA
              § 1798.125.
            </li>
          </ul>

          <h3 className="pt-2 text-lg font-semibold text-gray-900">
            10.3 California ADMT Rights (Effective January 1, 2026)
          </h3>
          <p>
            Under California&apos;s finalized CCPA ADMT regulations, because TenantShield
            uses automated technology to generate analyses that may constitute
            &quot;significant decisions&quot; in the housing context, we provide:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Pre-Use Notice:</strong> You are hereby informed that our AI
              processes your inputs to generate informational tenant rights analyses. This
              notice constitutes our pre-use disclosure as required by ADMT regulations.
            </li>
            <li>
              <strong>Opt-Out Right:</strong> You may opt out of AI-powered analysis at
              any time by contacting {SUPPORT_EMAIL}. Note that opting out
              significantly limits the functionality available to you.
            </li>
            <li>
              <strong>Access Right:</strong> You may request access to the logic used to
              generate a specific AI analysis about your situation.
            </li>
          </ul>

          <h3 className="pt-2 text-lg font-semibold text-gray-900">
            10.4 Submitting Requests
          </h3>
          <p>
            Submit California privacy requests to: {SUPPORT_EMAIL} with subject
            line &quot;CCPA Request — [Type of Request].&quot; You may also use our
            in-app request form. We will verify your identity using your account
            credentials and respond within 45 days (extendable to 90 days with notice).
            You may designate an authorized agent to make requests on your behalf by
            providing written authorization.
          </p>
        </PolicySection>

        <PolicySection
          id="pp-11"
          sectionNum="Section 11"
          title="EU & UK Residents — GDPR"
        >
          <Callout variant="green" icon="🇪🇺">
            <p>
              This section applies to residents of the European Union, European Economic
              Area, and United Kingdom whose personal data is processed by TenantShield. We
              process your data in compliance with the General Data Protection Regulation
              (GDPR) and UK GDPR.
            </p>
          </Callout>

          <h3 className="text-lg font-semibold text-gray-900">
            11.1 Legal Bases for Processing
          </h3>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Contract Performance (Art. 6(1)(b)):</strong> Processing necessary
              to provide the Services you signed up for.
            </li>
            <li>
              <strong>Legitimate Interests (Art. 6(1)(f)):</strong> Security, fraud
              prevention, service improvement using anonymized data. We have conducted
              legitimate interest assessments for each use.
            </li>
            <li>
              <strong>Legal Obligation (Art. 6(1)(c)):</strong> Processing required by
              applicable law.
            </li>
            <li>
              <strong>Consent (Art. 6(1)(a)):</strong> Marketing emails and AI training (if
              applicable). You may withdraw consent at any time without affecting prior
              processing.
            </li>
          </ul>

          <h3 className="pt-2 text-lg font-semibold text-gray-900">
            11.2 International Data Transfers
          </h3>
          <p>
            TenantShield is based in the United States. If you are in the EU/EEA/UK, your
            personal data is transferred to and processed in the United States. We
            implement appropriate safeguards for such transfers including Standard
            Contractual Clauses (SCCs) approved by the European Commission. A copy of our
            SCCs is available upon request.
          </p>

          <h3 className="pt-2 text-lg font-semibold text-gray-900">
            11.3 Data Protection Officer
          </h3>
          <p>
            You may contact our data protection representative at {SUPPORT_EMAIL}.
            EU residents also have the right to lodge a complaint with your local data
            protection supervisory authority.
          </p>

          <h3 className="pt-2 text-lg font-semibold text-gray-900">
            11.4 Automated Decision-Making Rights (Art. 22)
          </h3>
          <p>
            Our AI analysis does not produce legally binding decisions that significantly
            affect you in a legal sense. It provides informational guidance only. However,
            you have the right to request human review of any AI-generated output, object
            to automated processing, and obtain an explanation of the logic behind any
            specific analysis.
          </p>
        </PolicySection>

        <PolicySection id="pp-12" sectionNum="Section 12" title="Children's Privacy">
          <p>
            TenantShield&apos;s Services are intended for individuals who are 18 years of
            age or older. We do not knowingly collect personal information from anyone
            under the age of 18. If you are under 18, please do not use our Services or
            provide any personal information to us.
          </p>
          <p>
            If we discover that we have inadvertently collected personal information from a
            child under 18, we will promptly delete that information from our systems. If
            you believe we may have collected information from a child under 18, please
            contact us immediately at {SUPPORT_EMAIL}.
          </p>
        </PolicySection>

        <PolicySection
          id="pp-13"
          sectionNum="Section 13"
          title="Cookies & Tracking Technologies"
        >
          <h3 className="text-lg font-semibold text-gray-900">
            13.1 Types of Cookies We Use
          </h3>
          <DefGrid
            rows={[
              {
                term: "Essential Cookies",
                meaning:
                  "Required for the Services to function. Includes authentication tokens and session management. Cannot be disabled without breaking core functionality.",
              },
              {
                term: "Functional Cookies",
                meaning:
                  "Remember your preferences, state selection, and UI settings. Improve your experience across sessions.",
              },
              {
                term: "Analytics Cookies",
                meaning:
                  "Anonymized usage data to understand feature adoption and improve the platform. IP addresses are not stored. You may opt out.",
              },
            ]}
          />

          <h3 className="pt-2 text-lg font-semibold text-gray-900">
            13.2 What We Do NOT Use
          </h3>
          <p>
            We do not use advertising cookies, cross-site tracking cookies, third-party
            behavioral tracking, or cookies that share your data with advertisers.
            TenantShield is ad-free and we do not allow any advertising network to place
            cookies on our Services.
          </p>

          <h3 className="pt-2 text-lg font-semibold text-gray-900">13.3 Managing Cookies</h3>
          <p>
            You can control cookies through your browser settings. Disabling essential
            cookies will impair your ability to log in and use the Services. You may opt
            out of analytics cookies at any time via account Settings → Privacy.
          </p>

          <h3 className="pt-2 text-lg font-semibold text-gray-900">13.4 Do Not Track</h3>
          <p>
            We respect browser-level &quot;Do Not Track&quot; signals and global privacy
            controls (GPC) as required by California law. When we detect a GPC signal, we
            treat it as a request to opt out of any data sharing for purposes beyond
            service provision.
          </p>
        </PolicySection>

        <PolicySection
          id="pp-14"
          sectionNum="Section 14"
          title="Third-Party Services & Links"
        >
          <p>
            Our Services may contain links to third-party websites, attorney referral
            services, or external legal resources. These third-party sites have their own
            privacy policies, and we have no control over and assume no responsibility for
            their content, privacy practices, or data handling.
          </p>
          <p>
            If we implement an attorney referral marketplace feature, we will clearly
            disclose when you are being connected to a third-party service provider and
            what information is shared for that referral. You will have the opportunity
            to review and consent before any referral information is shared.
          </p>
        </PolicySection>

        <PolicySection
          id="pp-15"
          sectionNum="Section 15"
          title="Changes to This Policy"
        >
          <p>
            We may update this Privacy Policy from time to time to reflect changes in our
            practices, technology, legal requirements, or other factors. When we make
            material changes, we will:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Update the &quot;Last Updated&quot; date at the top of this policy</li>
            <li>
              Send an email notification to all registered users at least 30 days before
              the changes take effect
            </li>
            <li>Display a prominent notice within the platform</li>
            <li>
              For material changes affecting how we process existing data, request fresh
              consent where required by law
            </li>
          </ul>
          <p>
            Your continued use of the Services after the effective date of any updated
            policy constitutes acceptance of the updated policy. If you disagree with the
            changes, you may close your account before the effective date.
          </p>
        </PolicySection>

        <PolicySection id="pp-16" sectionNum="Section 16" title="Contact Us">
          <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/60 p-5 sm:p-6">
            <h3 className="text-base font-bold text-gray-900">
              Privacy Inquiries & Rights Requests
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-700 sm:text-base">
              Email: <SupportEmail />
              <br />
              Subject line format: &quot;[Right/Request Type] — [Your Name]&quot;
              <br />
              Response time: Within 30 days
              <br />
              Mailing: TenantShield, Inc., Attn: Privacy Officer
            </p>
          </div>
        </PolicySection>
      </div>
    </>
  );
}


