import { z } from "zod"
import { US_STATES, type USStateAbbr } from "@/lib/constants/us-states"

export const signInSchema = z.object({
  emailAddress: z
    .string()
    .trim()
    .min(1, "Enter your email.")
    .email("Enter a valid email."),
  password: z.string().min(1, "Enter your password."),
})

export type SignInValues = z.infer<typeof signInSchema>

export const signInMfaSchema = z.object({
  code: z.string().trim().min(1, "Enter the verification code."),
})

export type SignInMfaValues = z.infer<typeof signInMfaSchema>

export const signUpSchema = z.object({
  fullName: z.string().trim().min(1, "Enter your full name."),
  emailAddress: z
    .string()
    .trim()
    .min(1, "Enter your email.")
    .email("Enter a valid email."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  state: z
    .string()
    .min(1, "Select your state.")
    .refine(
      (value) => US_STATES.includes(value as USStateAbbr),
      "Select a valid state.",
    ),
})

export type SignUpValues = z.infer<typeof signUpSchema>

export const emailVerificationSchema = z.object({
  code: z.string().trim().min(1, "Enter the verification code."),
})

export type EmailVerificationValues = z.infer<typeof emailVerificationSchema>
