"use client";

import Image from "next/image";
import Link from "next/link";

const APP_LOGO_SRC =
  "/vecteezy_stylized-yellow-shield-icon-flat-design_54786290.png";

export default function LandingNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-amber-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex shrink-0 items-center gap-2 font-heading text-lg font-bold tracking-tight text-gray-900 sm:gap-2.5 sm:text-xl"
        >
          <Image
            src={APP_LOGO_SRC}
            alt=""
            width={32}
            height={32}
            className="size-8 shrink-0 object-contain sm:size-9"
            priority
          />
          <span>TenantShield</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="#features"
            className="text-sm font-medium text-gray-600 transition-all duration-200 hover:text-amber-500"
          >
            Features
          </Link>
          <Link
            href="#pricing"
            className="text-sm font-medium text-gray-600 transition-all duration-200 hover:text-amber-500"
          >
            Pricing
          </Link>
          <Link
            href="#about"
            className="text-sm font-medium text-gray-600 transition-all duration-200 hover:text-amber-500"
          >
            About
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-full border-2 border-gray-300 bg-white px-5 text-sm font-medium text-gray-700 transition-all duration-200 hover:border-amber-500 hover:text-amber-600 active:scale-95"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-10 items-center justify-center rounded-full bg-amber-500 px-5 text-sm font-bold text-white transition-all duration-200 hover:bg-amber-600 active:scale-95 shadow-md hover:shadow-lg"
          >
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
}
