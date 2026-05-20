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
      width={120}
      height={120}
      viewBox="0 0 120 120"
      overflow="visible"
      className={className}
      aria-hidden
    >
      <g className="gavel-loader__sound-block">
        <rect
          x={18}
          y={98}
          width={74}
          height={6}
          rx={3}
          className="gavel-loader__fill-block-strike gavel-loader__stroke-deep"
          strokeWidth={1}
        />
        <rect
          x={22}
          y={82}
          width={66}
          height={18}
          rx={4}
          className="gavel-loader__fill-mid gavel-loader__stroke-body"
          strokeWidth={1.2}
        />
        <rect x={24} y={83} width={62} height={6} rx={3} className="gavel-loader__fill-face" />
        <rect x={22} y={82} width={66} height={3} rx={2} className="gavel-loader__fill-body" opacity={0.55} />
        <line
          x1={38}
          y1={83}
          x2={38}
          y2={100}
          className="gavel-loader__stroke-body"
          strokeWidth={0.7}
          opacity={0.35}
        />
        <line
          x1={55}
          y1={83}
          x2={55}
          y2={100}
          className="gavel-loader__stroke-body"
          strokeWidth={0.7}
          opacity={0.35}
        />
        <line
          x1={72}
          y1={83}
          x2={72}
          y2={100}
          className="gavel-loader__stroke-body"
          strokeWidth={0.7}
          opacity={0.35}
        />
      </g>

      <circle className="gavel-loader__ring" cx={55} cy={83} r={4} />
      <circle className="gavel-loader__ring gavel-loader__ring--delayed" cx={55} cy={83} r={4} />

      <g className="gavel-loader__sparks">
        <line
          x1={43}
          y1={80}
          x2={38}
          y2={73}
          className="gavel-loader__spark-line"
          strokeWidth={1.3}
          strokeLinecap="round"
        />
        <line
          x1={50}
          y1={79}
          x2={48}
          y2={72}
          className="gavel-loader__spark-line"
          strokeWidth={1.3}
          strokeLinecap="round"
        />
        <line
          x1={57}
          y1={79}
          x2={58}
          y2={72}
          className="gavel-loader__spark-line"
          strokeWidth={1.3}
          strokeLinecap="round"
        />
        <line
          x1={63}
          y1={80}
          x2={68}
          y2={74}
          className="gavel-loader__spark-line"
          strokeWidth={1.1}
          strokeLinecap="round"
        />
      </g>

      <g className="gavel-loader__arm">
        <line
          x1={89}
          y1={38}
          x2={44}
          y2={38}
          className="gavel-loader__stroke-deep"
          strokeWidth={7}
          strokeLinecap="round"
        />
        <line
          x1={89}
          y1={38}
          x2={44}
          y2={38}
          className="gavel-loader__stroke-body"
          strokeWidth={5}
          strokeLinecap="round"
        />
        <line
          x1={88}
          y1={36}
          x2={45}
          y2={36}
          className="gavel-loader__stroke-mid"
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.45}
        />
        <rect
          x={39}
          y={33}
          width={9}
          height={10}
          rx={2}
          className="gavel-loader__fill-brass gavel-loader__stroke-brass"
          strokeWidth={0.9}
        />
        <rect
          x={39.5}
          y={34}
          width={8}
          height={4}
          rx={1}
          className="gavel-loader__fill-brass-light"
          opacity={0.55}
        />
        <rect
          x={24}
          y={22}
          width={21}
          height={34}
          rx={4}
          className="gavel-loader__fill-shadow"
          opacity={0.2}
        />
        <rect
          x={22}
          y={20}
          width={21}
          height={34}
          rx={4}
          className="gavel-loader__fill-deep gavel-loader__stroke-shadow"
          strokeWidth={1.3}
        />
        <rect x={24} y={22} width={17} height={30} rx={3} className="gavel-loader__fill-mid" />
        <rect x={25} y={22} width={15} height={10} rx={2} className="gavel-loader__fill-light" opacity={0.55} />
        <line
          x1={24}
          y1={30}
          x2={41}
          y2={30}
          className="gavel-loader__stroke-shadow"
          strokeWidth={0.7}
          opacity={0.3}
        />
        <line
          x1={24}
          y1={38}
          x2={41}
          y2={38}
          className="gavel-loader__stroke-shadow"
          strokeWidth={0.7}
          opacity={0.3}
        />
        <line
          x1={24}
          y1={46}
          x2={41}
          y2={46}
          className="gavel-loader__stroke-shadow"
          strokeWidth={0.7}
          opacity={0.3}
        />
        <rect
          x={22}
          y={20}
          width={21}
          height={7}
          rx={3}
          className="gavel-loader__fill-brass gavel-loader__stroke-body"
          strokeWidth={0.9}
        />
        <rect x={23} y={21} width={19} height={4} rx={2} className="gavel-loader__fill-brass-light" opacity={0.7} />
        <rect
          x={22}
          y={47}
          width={21}
          height={7}
          rx={3}
          className="gavel-loader__fill-brass gavel-loader__stroke-body"
          strokeWidth={0.9}
        />
        <rect x={23} y={48} width={19} height={4} rx={2} className="gavel-loader__fill-brass-light" opacity={0.7} />
        <rect x={23} y={51} width={19} height={2} rx={1} className="gavel-loader__fill-shadow" opacity={0.5} />
      </g>

      <circle
        cx={92}
        cy={38}
        r={5}
        className="gavel-loader__fill-deep gavel-loader__stroke-shadow"
        strokeWidth={1}
      />
      <circle cx={92} cy={38} r={2.5} className="gavel-loader__fill-body" />
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
