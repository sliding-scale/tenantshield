"use client";

import {
  Check,
  MessageCircle,
  FileText,
  Mail,
  Scale,
  TrendingUp,
} from "lucide-react";
import { PricingPlansSection } from "@/components/shared/pricing-plans-section";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-2 lg:gap-14">
          <div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              Empower Your Tenancy with AI-Backed Legal Protection.
            </h1>
            <p className="mb-8 text-lg text-gray-600 sm:text-xl">
              Navigate complex legal and insurance landscapes with confidence.
              Our Jurisdictional AI analyzes your lease and provides actionable
              insights, instantly calculating your personalized Impact Score.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <a
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-gray-300 bg-white px-8 text-base font-semibold text-gray-900 transition-colors duration-200 hover:bg-gray-50"
              >
                Sign In
              </a>
              <a
                href="/signup"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-amber-500 px-8 text-base font-semibold text-gray-900 transition-all duration-200 hover:bg-amber-400 active:scale-95"
              >
                Sign Up
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-amber-100/50 to-emerald-100/40 blur-2xl" />
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkHkOMDz2ElR_yP-oU8wgrNKELuLNze2D4Z8JvdGoQGkFLW6CThK6iNG_mbyJzV9o5sCx4qmF-v3iVQNngy0tZsjCpiyhQjwH6jX_nMJdnTZkwGIZj9luKnIP12a5RLFvMLAva3X9fUeWrcGoZpHCDZ6T2_7lnnceE7vw_cfrUQdmefaKQOErgmhVneNmkbKmGx_WLkqzsUT0gsA1lPkI6fHn-k1YvZusj5omt6khrU1a46yjhG66gHVzAeR5d20kqiJcQM9F4IQ"
              alt="TenantShield Interface"
              className="relative aspect-[4/3] w-full rounded-xl border border-gray-200 object-cover shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-4 py-20 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900">
              Intelligent Advocacy
            </h2>
            <p className="text-lg text-gray-600">
              Tools designed to provide clarity and security for renters.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
            {/* AI Chat */}
            <div className="rounded-xl border-2 border-gray-100 bg-white p-6 transition-all duration-300 hover:shadow-lg hover:border-amber-200">
              <div className="mb-4 inline-flex rounded-full bg-amber-100 p-3">
                <MessageCircle className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="mb-2 text-base font-bold text-gray-900">
                AI Chat
              </h3>
              <p className="text-sm text-gray-600">
                24/7 legal research assistant that understands your state's
                specific jurisdictional laws.
              </p>
            </div>

            {/* Lease Review */}
            <div className="rounded-xl border-2 border-gray-100 bg-white p-6 transition-all duration-300 hover:shadow-lg hover:border-amber-200">
              <div className="mb-4 inline-flex rounded-full bg-blue-100 p-3">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mb-2 text-base font-bold text-gray-900">
                Lease Review
              </h3>
              <p className="text-sm text-gray-600">
                Upload your lease agreement and let the AI instantly flag hidden
                clauses, illegal terms, or unfair fees.
              </p>
            </div>

            {/* Write Letter */}
            <div className="rounded-xl border-2 border-gray-100 bg-white p-6 transition-all duration-300 hover:shadow-lg hover:border-amber-200">
              <div className="mb-4 inline-flex rounded-full bg-green-100 p-3">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mb-2 text-base font-bold text-gray-900">
                Write Letter
              </h3>
              <p className="text-sm text-gray-600">
                Automatically generate legally sound, state-compliant demand
                letters, repair requests, or dispute notices.
              </p>
            </div>

            {/* Case Review */}
            <div className="rounded-xl border-2 border-gray-100 bg-white p-6 transition-all duration-300 hover:shadow-lg hover:border-amber-200">
              <div className="mb-4 inline-flex rounded-full bg-purple-100 p-3">
                <Scale className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="mb-2 text-base font-bold text-gray-900">
                Case Review
              </h3>
              <p className="text-sm text-gray-600">
                Describe your landlord dispute (eviction, deposits) and get an
                AI breakdown of your legal standing.
              </p>
            </div>

            {/* Impact Score */}
            <div className="rounded-xl border-2 border-gray-100 bg-white p-6 transition-all duration-300 hover:shadow-lg hover:border-amber-200">
              <div className="mb-4 inline-flex rounded-full bg-orange-100 p-3">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="mb-2 text-base font-bold text-gray-900">
                Impact Score
              </h3>
              <p className="text-sm text-gray-600">
                A comprehensive dashboard that scores your current rental
                situation and legal health.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Transparency Section */}
      <section
        id="about"
        className="bg-gradient-to-br from-emerald-800 to-emerald-900 px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-white">
              No Surprise Charges. Total Transparency.
            </h2>
            <p className="text-lg text-emerald-100">
              We believe in a secure and transparent onboarding process. Our
              multi-step guarantee ensures that your data is protected and you
              always know exactly what you're paying for.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 mb-12">
            <div className="flex items-start gap-3">
              <Check className="mt-1 h-5 w-5 shrink-0 text-emerald-300" />
              <div>
                <p className="font-medium text-white">
                  Bank-level encryption for all documents.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="mt-1 h-5 w-5 shrink-0 text-emerald-300" />
              <div>
                <p className="font-medium text-white">
                  Clear jurisdictional compliance checks.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              { number: "1", label: "Secure Signup" },
              { number: "2", label: "Document Upload" },
              { number: "3", label: "Instant Analysis" },
            ].map((step) => (
              <div key={step.number} className="text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 text-white font-bold text-lg mx-auto shadow-lg">
                  {step.number}
                </div>
                <p className="font-bold text-white">{step.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PricingPlansSection className="bg-white" showBillingPeriodToggle />

      {/* Footer */}
      <footer className="border-t-2 border-gray-200 bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <h4 className="mb-4 font-bold text-gray-900">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a
                    href="#features"
                    className="transition-colors duration-200 hover:text-amber-600"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="/billing"
                    className="transition-colors duration-200 hover:text-amber-600"
                  >
                    Billing
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="transition-colors duration-200 hover:text-amber-600"
                  >
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-bold text-gray-900">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a
                    href="#"
                    className="transition-colors duration-200 hover:text-amber-600"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="transition-colors duration-200 hover:text-amber-600"
                  >
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-bold text-gray-900">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a
                    href="#"
                    className="transition-colors duration-200 hover:text-amber-600"
                  >
                    State Disclosures
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="transition-colors duration-200 hover:text-amber-600"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t-2 border-gray-200 pt-8 text-center text-sm text-gray-600">
            <p>
              © 2024 TenantShield. All rights reserved. Powered by
              Jurisdictional AI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
