import Link from "next/link";
import type { ReactNode } from "react";
import {
  LegalCallout,
  LegalHighlightBox,
  LegalSection,
  LegalToc,
  type LegalDocVariant,
} from "@/components/shared/legal-document-primitives";
import { SUPPORT_EMAIL } from "@/lib/legal-contact";

const tocItems = [
  { href: "#ts-1", label: "1. Agreement to Terms" },
  { href: "#ts-2", label: "2. The Services" },
  { href: "#ts-3", label: "3. NOT Legal Advice" },
  { href: "#ts-4", label: "4. Eligibility" },
  { href: "#ts-5", label: "5. Account Registration" },
  { href: "#ts-6", label: "6. Subscriptions & Payment" },
  { href: "#ts-7", label: "7. Free Trial" },
  { href: "#ts-8", label: "8. Cancellation & Refunds" },
  { href: "#ts-9", label: "9. Acceptable Use" },
  { href: "#ts-10", label: "10. User Content & Data" },
  { href: "#ts-11", label: "11. AI Services Terms" },
  { href: "#ts-12", label: "12. Intellectual Property" },
  { href: "#ts-13", label: "13. Third-Party Services" },
  { href: "#ts-14", label: "14. Disclaimer of Warranties" },
  { href: "#ts-15", label: "15. Limitation of Liability" },
  { href: "#ts-16", label: "16. Indemnification" },
  { href: "#ts-17", label: "17. Termination" },
  { href: "#ts-18", label: "18. Governing Law" },
  { href: "#ts-19", label: "19. Dispute Resolution" },
  { href: "#ts-20", label: "20. Class Action Waiver" },
  { href: "#ts-21", label: "21. General Provisions" },
  { href: "#ts-22", label: "22. Contact" },
];

function Subheading({ children }: { children: ReactNode }) {
  return <h3 className="pt-1 text-base font-semibold text-inherit sm:text-lg">{children}</h3>;
}

function EmailLink() {
  return (
    <a
      href={`mailto:${SUPPORT_EMAIL}`}
      className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
    >
      {SUPPORT_EMAIL}
    </a>
  );
}

function PageEmailLink() {
  return (
    <a
      href={`mailto:${SUPPORT_EMAIL}`}
      className="font-medium text-amber-800 underline underline-offset-2"
    >
      {SUPPORT_EMAIL}
    </a>
  );
}

export function TermsOfServiceContent({
  variant = "page",
}: {
  variant?: LegalDocVariant;
}) {
  const v = variant;
  const Email = v === "modal" ? EmailLink : PageEmailLink;
  const linkClass =
    v === "modal"
      ? "font-medium text-primary underline underline-offset-2"
      : "font-medium text-amber-800 underline underline-offset-2";

  return (
    <>
      <LegalCallout variant="red" icon="⚠️" docVariant={v}>
        <p>
          <strong>PLEASE READ THESE TERMS CAREFULLY.</strong> By creating an account or
          using TenantShield, you agree to be bound by these Terms of Service. If you do
          not agree, do not use our Services. These Terms contain a binding arbitration
          clause and class action waiver in Sections 19 and 20.
        </p>
      </LegalCallout>

      <LegalToc items={tocItems} docVariant={v} />

      <div className={v === "modal" ? "mt-4 space-y-6" : "mt-10 space-y-10"}>
        <LegalSection id="ts-1" sectionNum="Section 01" title="Agreement to Terms" docVariant={v}>
          <p>
            These Terms of Service (&quot;Terms&quot;) constitute a legally binding
            agreement between you (&quot;User,&quot; &quot;you,&quot; or &quot;your&quot;)
            and TenantShield, Inc. (&quot;TenantShield,&quot; &quot;Company,&quot;
            &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), a Delaware corporation,
            governing your access to and use of the TenantShield platform, website, mobile
            applications, API, and all related services (collectively, the
            &quot;Services&quot;).
          </p>
          <p>
            By: (a) clicking &quot;I Agree,&quot; &quot;Create Account,&quot; or any
            similar button; (b) creating an account; (c) accessing or using any part of the
            Services; or (d) making any payment to TenantShield — you represent that you
            have read, understood, and agree to be bound by these Terms and our{" "}
            <Link href="/privacy-policy" className={linkClass}>
              Privacy Policy
            </Link>
            , which is incorporated herein by reference.
          </p>
          <p>
            <strong>
              If you are using the Services on behalf of an organization, you represent
              and warrant that you have authority to bind that organization to these Terms,
              and references to &quot;you&quot; include that organization.
            </strong>
          </p>
          <p>
            We reserve the right to modify these Terms at any time. We will notify you of
            material changes by email and through the Services at least 30 days in advance
            of the effective date. Your continued use after the effective date constitutes
            acceptance. If you disagree, your sole remedy is to stop using the Services and
            close your account.
          </p>
        </LegalSection>

        <LegalSection id="ts-2" sectionNum="Section 02" title="The Services" docVariant={v}>
          <p>
            TenantShield provides a technology platform that offers users informational
            resources regarding tenant rights, including:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>AI-powered informational analysis of tenant situations and disputes</li>
            <li>AI-assisted review and analysis of uploaded documents (leases, notices, letters)</li>
            <li>AI-generated demand letter templates for common tenant dispute scenarios</li>
            <li>A state-by-state database of general tenant rights information</li>
            <li>Case management and document organization tools</li>
            <li>An AI-powered chat interface for general tenant rights questions</li>
            <li>Future features including a landlord rating and review system</li>
          </ul>
          <p>
            TenantShield reserves the right to modify, suspend, or discontinue any feature of
            the Services at any time with reasonable notice. We will provide at least 30
            days&apos; notice before discontinuing a material feature that paid subscribers
            rely upon.
          </p>
        </LegalSection>

        <LegalSection id="ts-3" sectionNum="Section 03" title="NOT Legal Advice — Critical Disclaimer" docVariant={v}>
          <LegalHighlightBox title="⚖️ IMPORTANT LEGAL DISCLAIMER — PLEASE READ" docVariant={v}>
            <p>
              TENANTSHIELD IS NOT A LAW FIRM. TENANTSHIELD DOES NOT PROVIDE LEGAL ADVICE. NO
              ATTORNEY-CLIENT RELATIONSHIP IS FORMED BY YOUR USE OF THE SERVICES UNDER ANY
              CIRCUMSTANCES.
            </p>
            <p>
              The information, analyses, documents, letters, and content provided through
              TenantShield&apos;s Services are for{" "}
              <strong>general informational and educational purposes only</strong>. They do
              not constitute legal advice, legal opinions, or legal representation.
            </p>
            <ul>
              <li>Tenant rights laws vary significantly by state, county, and municipality and change frequently</li>
              <li>AI-generated analyses may be incomplete, inaccurate, or not applicable to your specific jurisdiction or circumstances</li>
              <li>AI-generated demand letters are templates and may require modification for your specific situation</li>
              <li>A &quot;case strength score&quot; is a general informational indicator only — it is not a legal assessment or prediction of outcome</li>
              <li>Reliance on TenantShield&apos;s content without consulting a licensed attorney is at your own risk</li>
            </ul>
            <p>
              <strong>
                YOU SHOULD CONSULT A LICENSED ATTORNEY IN YOUR JURISDICTION BEFORE TAKING ANY
                LEGAL ACTION, SENDING ANY LEGAL CORRESPONDENCE, OR MAKING ANY DECISION BASED
                ON INFORMATION PROVIDED BY TENANTSHIELD.
              </strong>
            </p>
          </LegalHighlightBox>
          <p>
            Sending an AI-generated demand letter without legal review may have unintended
            legal consequences. TenantShield expressly disclaims all liability for any
            outcome resulting from your use of content generated by our Services.
          </p>
        </LegalSection>

        <LegalSection id="ts-4" sectionNum="Section 04" title="Eligibility" docVariant={v}>
          <p>To use the Services, you must:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Be at least 18 years of age</li>
            <li>Be a natural person (not a corporation, LLC, or other entity, unless expressly agreed with TenantShield)</li>
            <li>Reside in or have a rental dispute within the United States</li>
            <li>Have the legal capacity to enter into binding contracts in your jurisdiction</li>
            <li>Not be barred from using the Services under applicable law</li>
            <li>Not have had a previous TenantShield account terminated for cause</li>
          </ul>
          <p>
            <strong>Prohibited Users:</strong> The Services may not be used by landlords,
            property managers, property management companies, real estate investment trusts
            (REITs), or any person or entity acting on behalf of a property owner for the
            purpose of monitoring, countering, or responding to tenant complaints or
            disputes. Violation of this restriction may result in immediate termination and
            legal action.
          </p>
        </LegalSection>

        <LegalSection id="ts-5" sectionNum="Section 05" title="Account Registration" docVariant={v}>
          <p>To access most features, you must create an account. You agree to:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Provide accurate, complete, and current information during registration and keep it updated</li>
            <li>Maintain the security and confidentiality of your account credentials</li>
            <li>Not share your account with any other person</li>
            <li>
              Notify us immediately at <Email /> of any
              unauthorized access to your account
            </li>
            <li>Accept responsibility for all activity that occurs under your account</li>
            <li>Use only one account per person</li>
          </ul>
          <p>
            TenantShield reserves the right to verify the accuracy of account information and
            to suspend or terminate accounts that provide false or misleading information. You
            may not impersonate any person or entity or misrepresent your affiliation with any
            person or entity.
          </p>
        </LegalSection>

        <LegalSection id="ts-6" sectionNum="Section 06" title="Subscriptions & Payment" docVariant={v}>
          <Subheading>6.1 Subscription Plans</Subheading>
          <p>
            TenantShield offers the following paid plans, subject to change with notice:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Pro Monthly:</strong> $9.00 per month, billed monthly. Access to
              unlimited AI analyses, document uploads, demand letters, and AI chat.
            </li>
            <li>
              <strong>Pay Per Letter:</strong> $29.00 one-time payment per demand letter
              generated. No subscription. Access expires 30 days from purchase.
            </li>
          </ul>

          <Subheading>6.2 Payment Processing</Subheading>
          <p>
            All payments are processed by Stripe, Inc. By providing payment information, you
            authorize TenantShield to charge your payment method for the applicable fees. You
            represent that you are authorized to use the payment method provided. All fees are
            in US dollars and are exclusive of applicable taxes, which you are responsible for
            paying.
          </p>

          <Subheading>6.3 Automatic Renewal</Subheading>
          <p>
            Subscriptions automatically renew at the end of each billing period unless
            cancelled before the renewal date. You will receive an email reminder 7 days
            before your annual subscription renews (if applicable). By using a subscription
            plan, you authorize TenantShield to charge your payment method for the renewal
            amount.
          </p>

          <Subheading>6.4 Price Changes</Subheading>
          <p>
            TenantShield may change subscription pricing with at least 30 days&apos; advance
            notice. Price changes will take effect at your next renewal. If you disagree with
            a price change, you may cancel before it takes effect.
          </p>

          <Subheading>6.5 Failed Payments</Subheading>
          <p>
            If a payment fails, we will attempt to collect payment multiple times over several
            days before suspending your account. We will notify you of payment failures and
            provide an opportunity to update your payment method. Accounts suspended for
            non-payment may be reactivated by updating payment information and paying any
            outstanding balance.
          </p>
        </LegalSection>

        <LegalSection id="ts-7" sectionNum="Section 07" title="Free Trial" docVariant={v}>
          <p>
            New users receive a 7-day free trial with access to all Pro features. The
            following trial terms apply:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>One free trial per person. Creating multiple accounts to obtain multiple trials is prohibited and may result in all accounts being terminated.</li>
            <li>No credit card is required to start a trial.</li>
            <li>At the end of the trial, your account will revert to the Free tier automatically. No charges will be made without your explicit subscription.</li>
            <li>Trial access may be limited or modified for users who abuse trial features.</li>
            <li>TenantShield reserves the right to modify or discontinue the free trial offer at any time for new users without notice.</li>
          </ul>
        </LegalSection>

        <LegalSection id="ts-8" sectionNum="Section 08" title="Cancellation & Refunds" docVariant={v}>
          <Subheading>8.1 Cancellation</Subheading>
          <p>
            You may cancel your subscription at any time through your account Settings →
            Billing, or by contacting <Email />.
            Cancellation takes effect at the end of the current billing period. You retain
            access to paid features until that date. Cancellation does not delete your account
            or data — to delete your data, submit a separate deletion request.
          </p>

          <Subheading>8.2 Refund Policy</Subheading>
          <p>
            <strong>Monthly subscriptions:</strong> No refunds are provided for partial
            months. If you cancel mid-month, you retain access until the end of the paid
            period.
          </p>
          <p>
            <strong>Pay Per Letter:</strong> No refunds after a letter has been generated. If
            a technical error prevents you from receiving a generated letter, contact{" "}
            <Email /> within 48 hours for a resolution.
          </p>
          <p>
            <strong>Exception for Billing Errors:</strong> If you were charged in error or for
            a period you did not authorize, contact{" "}
            <Email /> within 30 days and we will investigate
            and issue a refund if a billing error is confirmed.
          </p>
          <p>
            <strong>Chargebacks:</strong> If you initiate a chargeback with your payment
            provider without first contacting us, we reserve the right to terminate your
            account immediately and dispute the chargeback.
          </p>
        </LegalSection>

        <LegalSection id="ts-9" sectionNum="Section 09" title="Acceptable Use Policy" docVariant={v}>
          <Subheading>9.1 Permitted Use</Subheading>
          <p>
            You may use the Services only for lawful purposes related to understanding and
            asserting your rights as a residential tenant in the United States, and only in
            accordance with these Terms.
          </p>

          <Subheading>9.2 Prohibited Conduct</Subheading>
          <p>You agree NOT to:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Use the Services to harass, threaten, defame, or make false statements about any individual, landlord, or organization</li>
            <li>Upload false, fabricated, or forged documents</li>
            <li>Submit false or misleading case information for the purpose of generating fraudulent demand letters</li>
            <li>Use the Services to facilitate fraud, extortion, or any illegal activity</li>
            <li>Use the Services as a landlord, property manager, or on behalf of any property owner or their agents</li>
            <li>Scrape, harvest, or systematically extract data from the Services</li>
            <li>Reverse engineer, decompile, or attempt to extract the source code of our software</li>
            <li>Attempt to gain unauthorized access to any account, system, or network</li>
            <li>Transmit malware, viruses, or any harmful code</li>
            <li>Use the Services to create competing products or services</li>
            <li>Circumvent, disable, or interfere with any security or access control features</li>
            <li>Create multiple accounts to circumvent free trial limits or account suspensions</li>
            <li>Use the Services in any manner that could damage, disable, or impair the Services</li>
            <li>Use automated tools, bots, or scripts to access the Services without our written permission</li>
          </ul>

          <Subheading>9.3 Consequences of Violation</Subheading>
          <p>
            Violation of this Acceptable Use Policy may result in immediate suspension or
            termination of your account without refund, removal of your content, and legal
            action where appropriate. We reserve the right to report illegal activity to law
            enforcement authorities.
          </p>
        </LegalSection>

        <LegalSection id="ts-10" sectionNum="Section 10" title="User Content & Data" docVariant={v}>
          <Subheading>10.1 Your Ownership</Subheading>
          <p>
            You retain full ownership of all content you submit to TenantShield, including
            case descriptions, uploaded documents, and any other personal information
            (&quot;User Content&quot;). TenantShield makes no claim of ownership over your
            User Content.
          </p>

          <Subheading>10.2 License to TenantShield</Subheading>
          <p>
            By submitting User Content, you grant TenantShield a limited, non-exclusive,
            royalty-free license to process, store, display, and transmit your User Content
            solely for the purpose of providing the Services to you. This license terminates
            when you delete the content or close your account (subject to our retention policy
            in the Privacy Policy).
          </p>

          <Subheading>10.3 Accuracy of Your Content</Subheading>
          <p>
            You represent and warrant that all information and documents you submit to
            TenantShield are truthful and accurate to the best of your knowledge. You
            acknowledge that AI analyses are generated based on the accuracy of information
            you provide, and inaccurate input will produce inaccurate output.
          </p>

          <Subheading>10.4 Sensitive Information</Subheading>
          <p>
            You are solely responsible for any sensitive personal information you choose to
            include in case descriptions or uploaded documents, including Social Security
            numbers, financial account numbers, or health information. We strongly advise you
            to redact such information before uploading any document to our platform.
          </p>

          <Subheading>10.5 Data Backup</Subheading>
          <p>
            While we maintain regular backups, TenantShield is not responsible for any loss of
            User Content. We recommend maintaining your own copies of important documents
            outside the platform.
          </p>
        </LegalSection>

        <LegalSection id="ts-11" sectionNum="Section 11" title="AI Services — Specific Terms" docVariant={v}>
          <Subheading>11.1 Nature of AI Output</Subheading>
          <p>
            AI-generated content, including situation analyses, document analyses, demand
            letters, case strength scores, and chat responses, is produced by language model
            technology and is subject to the following limitations which you expressly
            acknowledge:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>AI output may contain errors, omissions, outdated information, or information inapplicable to your specific jurisdiction</li>
            <li>AI output is based solely on the information you provide and does not consider information you have not disclosed</li>
            <li>Tenant rights law changes frequently; AI output may not reflect the most current law</li>
            <li>AI-generated demand letters are templates only and may not be appropriate for your specific circumstances without modification</li>
            <li>A &quot;case strength score&quot; is an informational estimate only, not a legal assessment or guarantee</li>
          </ul>

          <Subheading>11.2 No Reliance</Subheading>
          <p>
            TenantShield expressly disclaims all liability for any action taken or not taken
            in reliance on AI-generated content. You agree not to send any demand letter,
            initiate any legal proceeding, withhold rent, or take any other legal action based
            solely on TenantShield&apos;s AI output without first consulting a licensed
            attorney.
          </p>

          <Subheading>11.3 AI Improvement</Subheading>
          <p>
            TenantShield may analyze anonymized, de-identified aggregate patterns across user
            interactions to improve the quality and accuracy of AI responses. Individual user
            content is not used for this purpose without explicit opt-in consent.
          </p>

          <Subheading>11.4 Third-Party AI Provider (Google Gemini)</Subheading>
          <p>
            Our AI functionality is powered by Google&apos;s Gemini API (including models such
            as Gemini 2.5 Flash and Gemini 2.5 Pro). By using our AI features, you acknowledge
            that your inputs are processed by Google pursuant to Google&apos;s privacy policy
            and Gemini API terms. TenantShield is responsible for our own data practices;
            Google is responsible for API processing practices. See{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              policies.google.com/privacy
            </a>{" "}
            and{" "}
            <a
              href="https://ai.google.dev/gemini-api/terms"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              ai.google.dev/gemini-api/terms
            </a>
            .
          </p>
        </LegalSection>

        <LegalSection id="ts-12" sectionNum="Section 12" title="Intellectual Property" docVariant={v}>
          <Subheading>12.1 TenantShield IP</Subheading>
          <p>
            The Services, including all software, technology, design, text, graphics,
            interfaces, logos, trademarks, service marks, and the &quot;TenantShield&quot;
            name and shield logo, are owned by TenantShield, Inc. and are protected by United
            States and international intellectual property laws. Nothing in these Terms grants
            you any ownership right in TenantShield&apos;s intellectual property.
          </p>

          <Subheading>12.2 Limited License</Subheading>
          <p>
            Subject to your compliance with these Terms, TenantShield grants you a limited,
            non-exclusive, non-transferable, revocable license to access and use the Services
            for your personal, non-commercial use as a residential tenant seeking general legal
            information.
          </p>

          <Subheading>12.3 Restrictions</Subheading>
          <p>
            You may not: copy, modify, or distribute any portion of the Services; use
            TenantShield&apos;s name, logo, or trademarks without written permission; create
            derivative works based on the Services; use the Services to build a competing
            product; or remove any proprietary notices from the Services.
          </p>

          <Subheading>12.4 Feedback</Subheading>
          <p>
            If you submit feedback, suggestions, or ideas about the Services
            (&quot;Feedback&quot;), you grant TenantShield a perpetual, irrevocable,
            royalty-free license to use that Feedback without restriction or compensation to
            you.
          </p>
        </LegalSection>

        <LegalSection id="ts-13" sectionNum="Section 13" title="Third-Party Services" docVariant={v}>
          <p>
            The Services may integrate with or link to third-party services including Stripe
            for payments, Google Gemini for AI processing, and future attorney referral networks.
            Your use of third-party services is governed by those parties&apos; own terms and
            privacy policies. TenantShield is not responsible for the practices, content, or
            availability of third-party services.
          </p>
          <p>
            Any attorney referral provided through TenantShield is not an endorsement or
            guarantee of that attorney&apos;s qualifications, competence, or suitability for
            your specific matter. You are solely responsible for evaluating and selecting any
            attorney you choose to engage.
          </p>
        </LegalSection>

        <LegalSection id="ts-14" sectionNum="Section 14" title="Disclaimer of Warranties" docVariant={v}>
          <LegalHighlightBox title="DISCLAIMER — PLEASE READ CAREFULLY" docVariant={v}>
            <p>
              THE SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot;
              WITHOUT ANY WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. TO THE MAXIMUM EXTENT
              PERMITTED BY APPLICABLE LAW, TENANTSHIELD EXPRESSLY DISCLAIMS ALL WARRANTIES,
              INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul>
              <li>IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE</li>
              <li>WARRANTIES THAT THE SERVICES WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES</li>
              <li>WARRANTIES THAT AI-GENERATED CONTENT IS ACCURATE, COMPLETE, OR CURRENT</li>
              <li>WARRANTIES THAT THE SERVICES WILL ACHIEVE ANY PARTICULAR LEGAL OUTCOME FOR YOU</li>
              <li>WARRANTIES THAT DEMAND LETTERS GENERATED BY THE SERVICES WILL BE EFFECTIVE</li>
              <li>WARRANTIES THAT ANY INFORMATION PROVIDED CONSTITUTES LEGAL ADVICE OR IS APPLICABLE TO YOUR SPECIFIC SITUATION</li>
            </ul>
            <p>
              SOME JURISDICTIONS DO NOT ALLOW DISCLAIMER OF IMPLIED WARRANTIES. IN SUCH
              JURISDICTIONS, THE ABOVE DISCLAIMERS APPLY TO THE MAXIMUM EXTENT PERMITTED BY
              LAW.
            </p>
          </LegalHighlightBox>
        </LegalSection>

        <LegalSection id="ts-15" sectionNum="Section 15" title="Limitation of Liability" docVariant={v}>
          <LegalHighlightBox title="LIMITATION OF LIABILITY — PLEASE READ CAREFULLY" docVariant={v}>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL
              TENANTSHIELD, ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, LICENSORS, OR SERVICE
              PROVIDERS BE LIABLE FOR:
            </p>
            <ul>
              <li>ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES</li>
              <li>LOSS OF PROFITS, REVENUE, DATA, BUSINESS, OR GOODWILL</li>
              <li>DAMAGES ARISING FROM YOUR RELIANCE ON AI-GENERATED CONTENT</li>
              <li>DAMAGES ARISING FROM SENDING A DEMAND LETTER GENERATED BY OUR SERVICES</li>
              <li>DAMAGES ARISING FROM ANY LEGAL PROCEEDING YOU INITIATE OR RESPOND TO BASED ON OUR CONTENT</li>
              <li>COST OF SUBSTITUTE SERVICES</li>
              <li>ANY MATTER BEYOND OUR REASONABLE CONTROL</li>
            </ul>
            <p>
              IN ANY EVENT, TENANTSHIELD&apos;S TOTAL AGGREGATE LIABILITY TO YOU FOR ALL CLAIMS
              ARISING OUT OF OR RELATED TO THESE TERMS OR THE SERVICES SHALL NOT EXCEED THE
              GREATER OF: (A) THE TOTAL AMOUNT YOU PAID TO TENANTSHIELD IN THE TWELVE (12)
              MONTHS PRECEDING THE CLAIM, OR (B) ONE HUNDRED DOLLARS ($100.00).
            </p>
            <p>
              SOME JURISDICTIONS DO NOT ALLOW LIMITATION OF LIABILITY FOR CERTAIN DAMAGES. IN
              SUCH JURISDICTIONS, OUR LIABILITY IS LIMITED TO THE MAXIMUM EXTENT PERMITTED BY
              LAW.
            </p>
          </LegalHighlightBox>
        </LegalSection>

        <LegalSection id="ts-16" sectionNum="Section 16" title="Indemnification" docVariant={v}>
          <p>
            You agree to defend, indemnify, and hold harmless TenantShield, Inc., its officers,
            directors, employees, contractors, agents, licensors, and service providers from and
            against any claims, liabilities, damages, judgments, awards, losses, costs, expenses,
            or fees (including reasonable attorneys&apos; fees) arising out of or relating to:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Your violation of these Terms</li>
            <li>Your use or misuse of the Services</li>
            <li>User Content you submit, including any claims that your content is false, defamatory, or infringes any third-party right</li>
            <li>Your violation of any applicable law or regulation</li>
            <li>Any legal action you take or receive based on content generated by the Services</li>
            <li>Your violation of any third party&apos;s rights</li>
          </ul>
          <p>
            TenantShield reserves the right to assume exclusive control of the defense of any
            claim subject to indemnification at your expense. You agree to cooperate with
            TenantShield&apos;s defense of such claims.
          </p>
        </LegalSection>

        <LegalSection id="ts-17" sectionNum="Section 17" title="Termination" docVariant={v}>
          <Subheading>17.1 Termination by You</Subheading>
          <p>
            You may close your account at any time through Settings → Account → Delete Account.
            Deletion is permanent and triggers our data deletion process as described in the
            Privacy Policy. Closing your account does not entitle you to a refund of any prepaid
            fees.
          </p>

          <Subheading>17.2 Termination by TenantShield</Subheading>
          <p>
            TenantShield may suspend or terminate your account immediately, without prior notice
            or liability, if:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>You violate any provision of these Terms or our Acceptable Use Policy</li>
            <li>You provide false registration information or impersonate another person</li>
            <li>You are determined to be using the Services as a landlord, property manager, or on behalf of a property owner</li>
            <li>We are required to do so by law or court order</li>
            <li>Your account poses a security risk to the Services or other users</li>
            <li>You initiate a fraudulent chargeback</li>
          </ul>

          <Subheading>17.3 Effect of Termination</Subheading>
          <p>
            Upon termination: your license to use the Services immediately terminates; you must
            cease all use of the Services; and TenantShield may delete your account and User
            Content pursuant to our retention policy. Sections 3 (Legal Disclaimer), 12 (IP), 14
            (Warranty Disclaimer), 15 (Limitation of Liability), 16 (Indemnification), 19
            (Arbitration), and 20 (Class Action Waiver) survive termination.
          </p>
        </LegalSection>

        <LegalSection id="ts-18" sectionNum="Section 18" title="Governing Law & Jurisdiction" docVariant={v}>
          <p>
            These Terms are governed by and construed in accordance with the laws of the State of
            Delaware, without regard to its conflict of law principles. Subject to the arbitration
            agreement in Section 19, any legal action or proceeding not subject to arbitration
            shall be brought exclusively in the federal or state courts located in the State of
            Delaware, and you consent to personal jurisdiction in those courts.
          </p>
          <p>
            Nothing in these Terms limits your rights under any applicable consumer protection
            laws in your state of residence. If any provision of these Terms conflicts with
            mandatory consumer protection law in your jurisdiction, the applicable law controls.
          </p>
        </LegalSection>

        <LegalSection id="ts-19" sectionNum="Section 19" title="Dispute Resolution & Binding Arbitration" docVariant={v}>
          <LegalCallout variant="red" icon="⚖️" docVariant={v}>
            <p>
              <strong>PLEASE READ THIS SECTION CAREFULLY — IT AFFECTS YOUR LEGAL RIGHTS.</strong>{" "}
              This section requires you to resolve most disputes through binding individual
              arbitration rather than in court. You have the right to opt out within 30 days of
              first accepting these Terms.
            </p>
          </LegalCallout>

          <Subheading>19.1 Informal Resolution First</Subheading>
          <p>
            Before initiating any formal dispute resolution, you agree to contact TenantShield at{" "}
            <Email /> and attempt to resolve the dispute informally
            for at least 30 days. Many concerns can be resolved quickly through our support team.
          </p>

          <Subheading>19.2 Binding Arbitration</Subheading>
          <p>
            If informal resolution fails, any dispute, claim, or controversy arising out of or
            relating to these Terms or the Services (except as stated in Section 19.4) shall be
            resolved by binding individual arbitration administered by the American Arbitration
            Association (AAA) under its Consumer Arbitration Rules, as modified by these Terms.
            The arbitration shall be conducted in English in the State of Delaware, or remotely.
            The arbitrator&apos;s decision shall be final and binding.
          </p>

          <Subheading>19.3 Arbitration Fees</Subheading>
          <p>
            For claims under $10,000, TenantShield will pay all AAA filing, administrative, and
            arbitrator fees unless the arbitrator finds your claim frivolous. For claims over
            $10,000, AAA rules govern fee allocation. If TenantShield prevails on the merits, it
            may seek attorney&apos;s fees only if the arbitrator finds your claim was frivolous.
          </p>

          <Subheading>19.4 Exceptions to Arbitration</Subheading>
          <p>
            The following disputes are not subject to arbitration: (a) claims for injunctive or
            equitable relief relating to intellectual property infringement; (b) small claims court
            actions within that court&apos;s jurisdiction; (c) claims that applicable law expressly
            excludes from arbitration, including disputes regarding TenantShield&apos;s compliance
            with CCPA, GDPR, or other applicable privacy law.
          </p>

          <Subheading>19.5 Opt-Out Right</Subheading>
          <p>
            You may opt out of this arbitration agreement within 30 days of first accepting these
            Terms by sending written notice to {SUPPORT_EMAIL} with the subject
            &quot;Arbitration Opt-Out.&quot; Your opt-out does not affect the Class Action Waiver
            in Section 20.
          </p>

          <Subheading>19.6 Waiver of Jury Trial</Subheading>
          <p>
            BY AGREEING TO ARBITRATION, YOU WAIVE YOUR RIGHT TO A JURY TRIAL FOR ANY DISPUTE
            COVERED BY THIS SECTION.
          </p>
        </LegalSection>

        <LegalSection id="ts-20" sectionNum="Section 20" title="Class Action Waiver" docVariant={v}>
          <LegalHighlightBox title="CLASS ACTION WAIVER — IMPORTANT" docVariant={v}>
            <p>
              YOU AND TENANTSHIELD AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR
              OR ITS INDIVIDUAL CAPACITY, AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED
              CLASS OR REPRESENTATIVE PROCEEDING.
            </p>
            <p>
              UNLESS BOTH YOU AND TENANTSHIELD AGREE OTHERWISE, THE ARBITRATOR MAY NOT
              CONSOLIDATE MORE THAN ONE PERSON&apos;S CLAIMS, AND MAY NOT OTHERWISE PRESIDE OVER
              ANY FORM OF A REPRESENTATIVE OR CLASS PROCEEDING.
            </p>
            <p>
              IF THIS CLASS ACTION WAIVER IS FOUND UNENFORCEABLE WITH RESPECT TO A PARTICULAR
              CLAIM OR REQUEST FOR RELIEF, THEN THAT CLAIM OR REQUEST FOR RELIEF SHALL BE SEVERED
              AND RESOLVED IN COURT, WITH ALL OTHER CLAIMS REMAINING IN ARBITRATION.
            </p>
            <p>
              <strong>EXCEPTION:</strong> This class action waiver does not apply to public
              injunctive relief claims under applicable California consumer protection laws, which
              shall be resolved in court.
            </p>
          </LegalHighlightBox>
        </LegalSection>

        <LegalSection id="ts-21" sectionNum="Section 21" title="General Provisions" docVariant={v}>
          <Subheading>21.1 Entire Agreement</Subheading>
          <p>
            These Terms, together with our Privacy Policy and any additional terms you agree to
            for specific features, constitute the entire agreement between you and TenantShield
            regarding the Services and supersede all prior agreements and understandings.
          </p>

          <Subheading>21.2 Severability</Subheading>
          <p>
            If any provision of these Terms is found to be invalid or unenforceable, that
            provision shall be modified to the minimum extent necessary to make it enforceable,
            and the remaining provisions shall remain in full force and effect.
          </p>

          <Subheading>21.3 Waiver</Subheading>
          <p>
            TenantShield&apos;s failure to enforce any right or provision of these Terms shall not
            be deemed a waiver of such right or provision. Any waiver must be in writing and signed
            by an authorized TenantShield representative.
          </p>

          <Subheading>21.4 Assignment</Subheading>
          <p>
            You may not assign or transfer your rights under these Terms without
            TenantShield&apos;s prior written consent. TenantShield may assign its rights under
            these Terms in connection with a merger, acquisition, or sale of substantially all
            assets, provided that the acquiring entity agrees to be bound by these Terms.
          </p>

          <Subheading>21.5 Force Majeure</Subheading>
          <p>
            TenantShield shall not be liable for any failure or delay in performance due to causes
            beyond its reasonable control, including acts of God, war, terrorism, governmental
            action, pandemic, internet disruptions, or third-party service failures.
          </p>

          <Subheading>21.6 Electronic Communications</Subheading>
          <p>
            By using the Services, you consent to receiving electronic communications from
            TenantShield including emails and in-app notifications. These communications satisfy
            any legal requirement that communications be in writing.
          </p>

          <Subheading>21.7 Headings</Subheading>
          <p>
            Section headings are for reference only and do not affect the interpretation of these
            Terms.
          </p>

          <Subheading>21.8 Language</Subheading>
          <p>
            These Terms are written in English. Any translation is provided for convenience only;
            the English version controls in the event of any conflict.
          </p>
        </LegalSection>

        <LegalSection id="ts-22" sectionNum="Section 22" title="Contact Information" docVariant={v}>
          <LegalHighlightBox title="TenantShield, Inc. — Contact" docVariant={v}>
            <p>
              Email: <Email />
              <br />
              <br />
              TenantShield, Inc.
              <br />
              [Registered Address]
              <br />
              Attn: Legal Department
            </p>
          </LegalHighlightBox>

          {v === "page" && (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/40 p-5 sm:p-6">
              <p className="text-sm font-bold text-gray-900">Acknowledgment</p>
              <p className="mt-2 text-sm leading-7 text-gray-700">
                By creating an account or using TenantShield&apos;s Services, you acknowledge that
                you have read, understood, and agree to be bound by these Terms of Service and our
                Privacy Policy. You further acknowledge that TenantShield is not a law firm, does
                not provide legal advice, and that no attorney-client relationship is created by
                your use of the Services.
              </p>
              <p className="mt-4 text-xs text-gray-500">
                TenantShield, Inc. · Effective May 7, 2026 · Version 1.0 · Delaware Corporation
              </p>
            </div>
          )}
        </LegalSection>
      </div>
    </>
  );
}

