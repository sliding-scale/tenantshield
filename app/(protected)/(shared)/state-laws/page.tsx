'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { ChevronRight, Search } from 'lucide-react';
import { api } from '@/convex/_generated/api';
import { ShieldLoader } from '@/components/shared/shield-loader';
import { MOBILE_TAB_BAR_PAGE_SHELL } from '@/lib/nav/mobile-chrome';
import { cn } from '@/lib/utils';

export default function StateLawsPage() {
  const stateLaws = useQuery(api.stateLaws.queries.getAllStateLaws);
  const [query, setQuery] = useState('');

  const filteredStateLaws = useMemo(() => {
    if (!stateLaws) return [];
    const normalized = query.trim().toLowerCase();
    if (!normalized) return stateLaws;
    return stateLaws.filter((state) => {
      const code = state.stateCode.toLowerCase();
      const name = (state.stateName ?? '').toLowerCase();
      return code.includes(normalized) || name.includes(normalized);
    });
  }, [stateLaws, query]);

  return (
    <main
      className={cn(
        'min-h-svh bg-background px-4 md:min-h-svh md:px-8 md:py-10',
        MOBILE_TAB_BAR_PAGE_SHELL,
      )}
    >
      <div className='mx-auto w-full max-w-6xl'>
        <section className='mb-6 md:mb-8'>
          <p className='text-xs font-semibold uppercase tracking-[0.2em] text-primary'>
            All 50 States + DC
          </p>
          <h1 className='mt-2 font-heading text-4xl font-semibold tracking-tight text-foreground md:text-5xl'>
            Tenant Rights Atlas.
          </h1>
          <p className='mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg'>
            Deposit caps, eviction notice periods, habitability rules — written plainly.
          </p>
        </section>

        <div className='mb-6 md:mb-8'>
          <div className='relative'>
            <Search className='pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
            <input
              type='text'
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder='Search state...'
              className='h-12 w-full rounded-2xl border border-border bg-card pl-11 pr-4 text-sm text-foreground outline-none ring-0 placeholder:text-muted-foreground focus:border-primary'
            />
          </div>
        </div>

        {stateLaws === undefined ? (
          <div className='flex justify-center py-16'>
            <ShieldLoader variant='laws' embedded />
          </div>
        ) : stateLaws.length === 0 ? (
          <div className='rounded-2xl border border-border bg-card p-8 text-center'>
            <p className='font-heading text-2xl text-foreground'>No state laws found</p>
            <p className='mt-2 text-muted-foreground'>State laws haven&apos;t been populated in the database yet.</p>
          </div>
        ) : filteredStateLaws.length === 0 ? (
          <div className='rounded-2xl border border-border bg-card p-8 text-center'>
            <p className='font-heading text-2xl text-foreground'>No matching states</p>
            <p className='mt-2 text-muted-foreground'>Try searching with a different state name or 2-letter code.</p>
          </div>
        ) : (
          <div className='grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4'>
            {filteredStateLaws.map((state) => (
              <Link
                key={state.stateCode}
                href={`/state-laws/${state.stateCode}`}
                className='group relative flex flex-col rounded-2xl border border-border bg-card px-4 py-4 transition hover:bg-accent'
              >
                <ChevronRight
                  className='absolute right-3 top-3 size-4 text-muted-foreground transition group-hover:text-foreground'
                  aria-hidden
                />
                <span className='font-heading text-xl font-semibold text-primary md:text-2xl'>
                  {state.stateCode}
                </span>
                <span className='mt-1 pr-5 text-sm font-medium text-foreground'>{state.stateName}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
