"use client"

import { useId } from "react"
import "./shield-loader.css"
import { cn } from "@/lib/utils"

export type ShieldLoaderVariant =
  | "route"
  | "account"
  | "onboarding"
  | "auth"
  | "verify"
  | "letters"
  | "letter"
  | "cases"
  | "case"
  | "leases"
  | "lease"
  | "laws"
  | "ratings"
  | "property"
  | "admin"
  | "upload"
  | "generic"

const VARIANT_COPY: Record<ShieldLoaderVariant, { label: string; description?: string }> = {
  route: { label: "Loading…" },
  account: { label: "Loading your\naccount…" },
  onboarding: { label: "Checking\nonboarding…" },
  auth: { label: "Signing you in…" },
  verify: { label: "Verifying your\nemail…" },
  letters: { label: "Loading your\nletters…" },
  letter: { label: "Loading your\nletter…" },
  cases: { label: "Loading your\ncases…" },
  case: { label: "Loading your\ncase…" },
  leases: { label: "Loading your\nleases…" },
  lease: { label: "Loading your\nlease…" },
  laws: { label: "Loading state\nlaws…" },
  ratings: { label: "Loading…" },
  property: { label: "Loading\nproperty…" },
  admin: { label: "Loading…" },
  upload: { label: "Uploading\nfile…" },
  generic: { label: "Verifying tenant\nrights…" },
}

const SHIELD_PATH = "M40 5 L72 16 L72 48 Q72 70 40 86 Q8 70 8 48 L8 16 Z"

function ShieldLoaderSvg({
  className,
  clipId,
}: {
  className?: string
  clipId: string
}) {
  const clip = `url(#${clipId})`

  return (
    <svg
      width={80}
      height={92}
      viewBox="0 0 80 92"
      overflow="visible"
      className={className}
      aria-hidden
    >
      <defs>
        <clipPath id={clipId}>
          <path d={SHIELD_PATH} />
        </clipPath>
      </defs>
      <path className="shield-loader__bg" d={SHIELD_PATH} />
      <line className="shield-loader__stripe" x1={8} y1={30} x2={72} y2={30} clipPath={clip} />
      <line className="shield-loader__stripe" x1={8} y1={44} x2={72} y2={44} clipPath={clip} />
      <line className="shield-loader__stripe" x1={8} y1={58} x2={72} y2={58} clipPath={clip} />
      <path
        className="shield-loader__progress"
        d={SHIELD_PATH}
        clipPath={clip}
        pathLength={200}
      />
      <path className="shield-loader__outline" d={SHIELD_PATH} />
      <path className="shield-loader__check" d="M28 46 L37 56 L54 38" />
    </svg>
  )
}

type ShieldLoaderProps = {
  variant?: ShieldLoaderVariant
  label?: string
  description?: string
  className?: string
  /** Omit card chrome when embedding in a page section */
  embedded?: boolean
  /** Center on cream page (full viewport section) */
  fullPage?: boolean
  /** Icon + dots only (buttons / inline) */
  compact?: boolean
}

export function ShieldLoader({
  variant = "generic",
  label,
  description,
  className,
  embedded = false,
  fullPage = false,
  compact = false,
}: ShieldLoaderProps) {
  const clipId = useId()
  const copy = VARIANT_COPY[variant]
  const headline = label ?? copy.label
  const body = description ?? copy.description

  const loader = (
    <div
      className={cn(
        compact ? "inline-flex items-center" : "flex flex-col items-center gap-5",
        !compact &&
          !embedded &&
          "rounded-[1.25rem] border border-cream-border bg-cream-surface px-10 py-10 shadow-sm",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={headline.replace("\n", " ")}
    >
      <div className={cn(compact && "origin-center scale-[0.32]")}>
        <ShieldLoaderSvg clipId={clipId} />
      </div>
      {!compact ? (
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="whitespace-pre-line font-heading text-lg font-semibold leading-snug text-ink-warm sm:text-xl">
            {headline}
          </p>
          {body ? (
            <p className="max-w-md text-sm leading-relaxed text-ink-warm-muted">{body}</p>
          ) : null}
          <div className="shield-loader__dots flex gap-1.5 pt-1" aria-hidden>
            <span />
            <span />
            <span />
          </div>
        </div>
      ) : null}
    </div>
  )

  if (!fullPage) return loader

  return (
    <div
      className={cn(
        "flex min-h-[50dvh] items-center justify-center bg-cream-page px-4 md:min-h-[calc(100vh-5rem)]",
        className,
      )}
    >
      {loader}
    </div>
  )
}

type ShieldLoaderOverlayProps = {
  show: boolean
  variant?: ShieldLoaderVariant
  label?: string
  description?: string
}

export function ShieldLoaderOverlay({
  show,
  variant = "generic",
  label,
  description,
}: ShieldLoaderOverlayProps) {
  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-cream-page/90 px-4 backdrop-blur-sm">
      <ShieldLoader variant={variant} label={label} description={description} />
    </div>
  )
}
