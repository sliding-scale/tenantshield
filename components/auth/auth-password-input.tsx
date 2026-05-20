"use client"

import { Eye, EyeOff } from "lucide-react"
import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type AuthPasswordInputProps = Omit<React.ComponentProps<typeof Input>, "type">

export const AuthPasswordInput = React.forwardRef<HTMLInputElement, AuthPasswordInputProps>(
  function AuthPasswordInput({ className, ...props }, ref) {
    const [visible, setVisible] = React.useState(false)

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={visible ? "text" : "password"}
          className={cn("pr-12", className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground transition-colors hover:text-foreground"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          {visible ? (
            <EyeOff className="size-5" strokeWidth={1.75} aria-hidden />
          ) : (
            <Eye className="size-5" strokeWidth={1.75} aria-hidden />
          )}
        </button>
      </div>
    )
  },
)

AuthPasswordInput.displayName = "AuthPasswordInput"
