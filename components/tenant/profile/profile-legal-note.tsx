const DISCLAIMER =
  "TenantShield provides general information, status updates, and drafted letters only. We are not lawyers. For decisions, high stakes, eviction, large disputes, or similar matters, we recommend consulting an attorney licensed in your state."

export function ProfileLegalNote() {
  return (
    <section aria-label="Legal notice" className="mt-8 md:mt-10">
      <div className="rounded-2xl bg-accent p-4 sm:p-5 md:p-6" role="note">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground md:text-xs">
          A note on legality
        </p>
        <p className="mt-2 text-sm leading-relaxed text-foreground md:text-base md:leading-relaxed">
          {DISCLAIMER}
        </p>
      </div>
    </section>
  )
}
