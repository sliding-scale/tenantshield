"use client"

import { useState, type ChangeEvent, type ComponentProps } from "react"
import { cn } from "@/lib/utils"

const inputBaseClass =
  "w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

const floatedLabelClass = "top-1.5 text-[9px] leading-none text-muted-foreground"

type FloatingLabelInputProps = Omit<ComponentProps<"input">, "placeholder"> & {
  label: string
  onValueChange?: (value: string) => void
}

export function FloatingLabelInput({
  label,
  value,
  className,
  onFocus,
  onBlur,
  onChange,
  onValueChange,
  ...props
}: FloatingLabelInputProps) {
  const [focused, setFocused] = useState(false)
  const hasValue = String(value ?? "").length > 0
  const floated = focused || hasValue

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event)
    onValueChange?.(event.target.value)
  }

  return (
    <div className="relative">
      <label
        htmlFor={props.id}
        className={cn(
          "pointer-events-none absolute left-4 origin-left transition-all duration-150",
          floated ? floatedLabelClass : "top-1/2 -translate-y-1/2 text-sm text-muted-foreground",
        )}
      >
        {label}
      </label>
      <input
        {...props}
        value={value}
        placeholder=""
        onChange={handleChange}
        onFocus={(event) => {
          setFocused(true)
          onFocus?.(event)
        }}
        onBlur={(event) => {
          setFocused(false)
          onBlur?.(event)
        }}
        className={cn(inputBaseClass, "h-11", floated ? "pt-4 pb-1" : "", className)}
      />
    </div>
  )
}

type FloatingLabelTextareaProps = Omit<ComponentProps<"textarea">, "placeholder"> & {
  label: string
  onValueChange?: (value: string) => void
}

export function FloatingLabelTextarea({
  label,
  value,
  className,
  onFocus,
  onBlur,
  onChange,
  onValueChange,
  rows = 4,
  ...props
}: FloatingLabelTextareaProps) {
  const [focused, setFocused] = useState(false)
  const hasValue = String(value ?? "").length > 0
  const floated = focused || hasValue

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(event)
    onValueChange?.(event.target.value)
  }

  return (
    <div className="relative">
      <label
        htmlFor={props.id}
        className={cn(
          "pointer-events-none absolute left-4 origin-left transition-all duration-150",
          floated ? floatedLabelClass : "top-4 text-sm text-muted-foreground",
        )}
      >
        {label}
      </label>
      <textarea
        {...props}
        rows={rows}
        value={value}
        placeholder=""
        onChange={handleChange}
        onFocus={(event) => {
          setFocused(true)
          onFocus?.(event)
        }}
        onBlur={(event) => {
          setFocused(false)
          onBlur?.(event)
        }}
        className={cn(
          inputBaseClass,
          "min-h-28 resize-y",
          floated ? "pt-6 pb-3" : "py-3",
          className,
        )}
      />
    </div>
  )
}
