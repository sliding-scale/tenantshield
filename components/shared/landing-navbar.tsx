'use client';

import Link from 'next/link';
import { BrandLogo } from '@/components/shared/navbar-logo';

export default function LandingNavbar() {
  return (
    <header className='sticky top-0 z-50 border-b border-amber-200 bg-white'>
      <div className='mx-auto grid w-full min-w-0 max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-2 sm:min-h-[4.25rem] sm:gap-4 sm:px-6 md:min-h-16 md:grid-cols-[minmax(0,1fr)_auto_auto] lg:min-h-[4.5rem] lg:gap-6 lg:px-8'>
        <Link href='/' className='inline-flex shrink-0 items-center' aria-label='TenantShield home'>
          {/* <BrandLogo variant="icon" priority className="size-10 sm:size-11 lg:hidden" /> */}
          <BrandLogo variant='landing' priority />
        </Link>

        <nav className='hidden items-center justify-self-center gap-8 md:flex'>
          <Link
            href='#features'
            className='text-sm font-medium text-gray-600 transition-all duration-200 hover:text-amber-500'
          >
            Features
          </Link>
          <Link
            href='#pricing'
            className='text-sm font-medium text-gray-600 transition-all duration-200 hover:text-amber-500'
          >
            Pricing
          </Link>
          <Link
            href='#about'
            className='text-sm font-medium text-gray-600 transition-all duration-200 hover:text-amber-500'
          >
            About
          </Link>
        </nav>

        <div className='col-start-2 flex shrink-0 items-center gap-1.5 sm:gap-3 md:col-start-3 md:gap-4'>
          <Link
            href='/login'
            className='inline-flex h-10 items-center justify-center rounded-full border-2 border-gray-300 bg-white px-2.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:border-amber-500 hover:text-amber-600 active:scale-95 max-sm:px-3 sm:px-5'
          >
            Sign in
          </Link>
          <Link
            href='/signup'
            className='inline-flex h-10 items-center justify-center rounded-full bg-amber-500 px-2.5 text-sm font-bold text-white transition-all duration-200 hover:bg-amber-600 active:scale-95 shadow-md hover:shadow-lg max-sm:px-3 sm:px-5'
          >
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
}
