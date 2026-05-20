"use client"

import { useEffect, useState } from "react"

const PLACEHOLDER = "/placeholder-property.svg"

type Props = {
  imageUrl: string | null | undefined
  /** Reset loaded URL when the row identity changes (pagination / search). */
  propertyId: string
}

/**
 * Ratings grid hero: stable box size (inline aspect-ratio avoids Tailwind arbitrary % bugs),
 * Convex URL + onError fallback to local SVG.
 */
export function PropertyCardImage({ imageUrl, propertyId }: Props) {
  const resolved = imageUrl?.trim() ? imageUrl.trim() : PLACEHOLDER
  const [src, setSrc] = useState(resolved)

  useEffect(() => {
    setSrc(imageUrl?.trim() ? imageUrl.trim() : PLACEHOLDER)
  }, [propertyId, imageUrl])

  return (
    <div
      className="relative w-full shrink-0 overflow-hidden border-b border-border bg-accent"
      style={{ aspectRatio: "16 / 10", minHeight: 176 }}
    >
      <img
        src={src}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center transition duration-300 group-hover:scale-[1.02]"
        loading="lazy"
        decoding="async"
        onError={() => setSrc(PLACEHOLDER)}
      />
    </div>
  )
}
