"use client"

import "./gavel-loader.css"
import { cn } from "@/lib/utils"

export type GavelLoaderVariant = "letter" | "case" | "lease" | "ask-ai"

const VARIANT_COPY: Record<
  GavelLoaderVariant,
  { label: string; defaultDescription: string }
> = {
  letter: {
    label: "Drafting your\nletter…",
    defaultDescription:
      "Our AI is writing a state-specific demand letter with citations and deadlines. This usually takes 30–60 seconds.",
  },
  case: {
    label: "Reviewing your\ncase…",
    defaultDescription:
      "Our AI is analyzing your situation against your state's tenant law. This usually takes 30–60 seconds.",
  },
  lease: {
    label: "Analyzing your\nlease…",
    defaultDescription:
      "Our AI is reviewing every clause against your state's tenant law. This usually takes 30–60 seconds.",
  },
  "ask-ai": {
    label: "Preparing Ask\nAI…",
    defaultDescription: "Setting up your legal assistant. Just a moment.",
  },
}

function GavelLoaderSvg({ className }: { className?: string }) {
  return (
    <svg
      width={110}
      height={120}
      viewBox="0 0 110 120"
      overflow="visible"
      className={className}
      aria-hidden
    >
      <g className="gavel-loader__sound-block">
        <rect
          x={12}
          y={100}
          width={86}
          height={6}
          rx={3}
          className="gavel-loader__fill-block-strike gavel-loader__stroke-deep"
          strokeWidth={1}
        />
        <rect
          x={20}
          y={87}
          width={70}
          height={15}
          rx={4}
          className="gavel-loader__fill-mid gavel-loader__stroke-body"
          strokeWidth={1.2}
        />
        <rect x={22} y={88} width={66} height={5} rx={3} className="gavel-loader__fill-face" />
        <line
          x1={35}
          y1={88}
          x2={35}
          y2={102}
          className="gavel-loader__stroke-body"
          strokeWidth={0.7}
          opacity={0.4}
        />
        <line
          x1={55}
          y1={88}
          x2={55}
          y2={102}
          className="gavel-loader__stroke-body"
          strokeWidth={0.7}
          opacity={0.4}
        />
        <line
          x1={75}
          y1={88}
          x2={75}
          y2={102}
          className="gavel-loader__stroke-body"
          strokeWidth={0.7}
          opacity={0.4}
        />
        <rect
          x={20}
          y={87}
          width={70}
          height={3}
          rx={2}
          className="gavel-loader__fill-body"
          opacity={0.5}
        />
      </g>

      <circle className="gavel-loader__ring" cx={55} cy={88} r={4} />
      <circle className="gavel-loader__ring gavel-loader__ring--delayed" cx={55} cy={88} r={4} />

      <g className="gavel-loader__sparks">
        <line
          x1={55}
          y1={84}
          x2={52}
          y2={78}
          className="gavel-loader__spark-line"
          strokeWidth={1.2}
          strokeLinecap="round"
        />
        <line
          x1={55}
          y1={84}
          x2={58}
          y2={78}
          className="gavel-loader__spark-line"
          strokeWidth={1.2}
          strokeLinecap="round"
        />
        <line
          x1={48}
          y1={85}
          x2={42}
          y2={81}
          className="gavel-loader__spark-line"
          strokeWidth={1}
          strokeLinecap="round"
        />
        <line
          x1={62}
          y1={85}
          x2={68}
          y2={81}
          className="gavel-loader__spark-line"
          strokeWidth={1}
          strokeLinecap="round"
        />
      </g>

      <g className="gavel-loader__whole">
        <rect
          x={45}
          y={10}
          width={10}
          height={8}
          rx={3}
          className="gavel-loader__fill-deep gavel-loader__stroke-shadow"
          strokeWidth={1}
        />
        <line
          x1={50}
          y1={17}
          x2={50}
          y2={67}
          className="gavel-loader__stroke-deep"
          strokeWidth={6}
          strokeLinecap="round"
        />
        <line
          x1={50}
          y1={17}
          x2={50}
          y2={67}
          className="gavel-loader__stroke-body"
          strokeWidth={4}
          strokeLinecap="round"
        />
        <line
          x1={48}
          y1={18}
          x2={48}
          y2={66}
          className="gavel-loader__stroke-mid"
          strokeWidth={1.5}
          strokeLinecap="round"
          opacity={0.5}
        />
        <rect
          x={44}
          y={64}
          width={12}
          height={7}
          rx={2}
          className="gavel-loader__fill-brass gavel-loader__stroke-brass"
          strokeWidth={1}
        />
        <rect
          x={44}
          y={65}
          width={12}
          height={3}
          rx={1}
          className="gavel-loader__fill-brass-light"
          opacity={0.6}
        />
        <rect
          x={25}
          y={69}
          width={60}
          height={18}
          rx={5}
          className="gavel-loader__fill-shadow"
          opacity={0.25}
        />
        <rect
          x={24}
          y={67}
          width={60}
          height={18}
          rx={5}
          className="gavel-loader__fill-deep gavel-loader__stroke-shadow"
          strokeWidth={1.2}
        />
        <rect x={26} y={68} width={56} height={7} rx={4} className="gavel-loader__fill-mid" />
        <rect
          x={28}
          y={68}
          width={52}
          height={3}
          rx={2}
          className="gavel-loader__fill-light"
          opacity={0.55}
        />
        <line
          x1={40}
          y1={68}
          x2={40}
          y2={85}
          className="gavel-loader__stroke-shadow"
          strokeWidth={0.7}
          opacity={0.3}
        />
        <line
          x1={56}
          y1={68}
          x2={56}
          y2={85}
          className="gavel-loader__stroke-shadow"
          strokeWidth={0.7}
          opacity={0.3}
        />
        <line
          x1={70}
          y1={68}
          x2={70}
          y2={85}
          className="gavel-loader__stroke-shadow"
          strokeWidth={0.7}
          opacity={0.3}
        />
        <rect
          x={24}
          y={67}
          width={8}
          height={18}
          rx={4}
          className="gavel-loader__fill-brass gavel-loader__stroke-body"
          strokeWidth={0.8}
        />
        <rect x={25} y={68} width={6} height={16} rx={3} className="gavel-loader__fill-brass-light" />
        <rect
          x={25}
          y={68}
          width={6}
          height={6}
          rx={2}
          className="gavel-loader__fill-face"
          opacity={0.6}
        />
        <rect
          x={76}
          y={67}
          width={8}
          height={18}
          rx={4}
          className="gavel-loader__fill-brass gavel-loader__stroke-body"
          strokeWidth={0.8}
        />
        <rect x={77} y={68} width={6} height={16} rx={3} className="gavel-loader__fill-brass-light" />
        <rect
          x={77}
          y={68}
          width={6}
          height={6}
          rx={2}
          className="gavel-loader__fill-face"
          opacity={0.6}
        />
        <rect x={26} y={82} width={56} height={3} rx={1} className="gavel-loader__fill-shadow" opacity={0.6} />
      </g>
    </svg>
  )
}

type GavelLoaderProps = {
  variant: GavelLoaderVariant
  label?: string
  description?: string
  className?: string
  /** Omit card chrome when embedding in a page section */
  embedded?: boolean
}

export function GavelLoader({
  variant,
  label,
  description,
  className,
  embedded = false,
}: GavelLoaderProps) {
  const copy = VARIANT_COPY[variant]
  const heading = label ?? copy.label
  const body = description ?? copy.defaultDescription

  return (
    <div
      className={cn(
        "gavel-loader flex flex-col items-center gap-5",
        !embedded &&
          "rounded-[1.25rem] border border-border bg-card px-10 py-10 shadow-sm",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <GavelLoaderSvg />
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="whitespace-pre-line font-heading text-lg font-semibold leading-snug text-foreground sm:text-xl">
          {heading}
        </p>
        {body ? (
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{body}</p>
        ) : null}
        <div className="gavel-loader__dots flex gap-1.5 pt-1" aria-hidden>
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  )
}

type GavelLoaderOverlayProps = {
  show: boolean
  variant: GavelLoaderVariant
  description?: string
}

export function GavelLoaderOverlay({ show, variant, description }: GavelLoaderOverlayProps) {
  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 px-4 backdrop-blur-sm">
      <GavelLoader variant={variant} description={description} />
    </div>
  )
}
