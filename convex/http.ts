import { verifyWebhook } from "@clerk/backend/webhooks"
import { httpRouter } from "convex/server"
import { httpAction } from "./_generated/server"
import { internal } from "./_generated/api"

type ClerkUser = {
  id: string
  username?: string | null
  first_name: string | null
  last_name: string | null
  primary_email_address_id: string | null
  email_addresses: Array<{ id: string; email_address: string }>
  unsafe_metadata?: Record<string, unknown> | null
  public_metadata?: Record<string, unknown> | null
}

function getEmailAndName(clerkUser: ClerkUser): { email: string; name: string } {
  const primaryEmail = clerkUser.email_addresses.find(
    (e) => e.id === clerkUser.primary_email_address_id,
  )
  const email =
    primaryEmail?.email_address ??
    clerkUser.email_addresses[0]?.email_address ??
    ""
  const fullName = [clerkUser.first_name, clerkUser.last_name]
    .filter(Boolean)
    .join(" ")
    .trim()
  const username = (clerkUser.username ?? "").trim()
  const name = fullName || username || "Unknown"
  return { email, name }
}

function roleFromClerkUser(clerkUser: ClerkUser): "admin" | "tenant" {
  const raw =
    clerkUser.unsafe_metadata?.role ?? clerkUser.public_metadata?.role
  if (raw === "admin") return "admin"
  return "tenant"
}

const handleClerkWebhook = httpAction(async (ctx, request) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 })
  }

  const signingSecret =
    process.env.CLERK_WEBHOOK_SECRET ??
    process.env.CLERK_WEBHOOK_SIGNING_SECRET
  if (!signingSecret) {
    console.error(
      "Missing CLERK_WEBHOOK_SECRET (or CLERK_WEBHOOK_SIGNING_SECRET) in Convex environment variables.",
    )
    return new Response("Webhook signing secret not configured", { status: 500 })
  }

  let event
  try {
    event = await verifyWebhook(request, { signingSecret })
  } catch (err) {
    console.error("Clerk webhook verification failed:", err)
    return new Response("Webhook verification failed", { status: 400 })
  }

  try {
    switch (event.type) {
      case "user.created":
      case "user.updated": {
        const clerkUser = event.data as ClerkUser
        const { email, name } = getEmailAndName(clerkUser)
        if (!email) {
          console.warn("Clerk user webhook missing email:", clerkUser.id)
          break
        }
        await ctx.runMutation(internal.users.mutations.createOrUpdateFromClerk, {
          clerkId: clerkUser.id,
          email,
          name,
          role: roleFromClerkUser(clerkUser),
        })
        break
      }
      case "user.deleted": {
        const id = (event.data as { id?: string })?.id
        if (!id) {
          console.warn("user.deleted webhook missing id")
          break
        }
        await ctx.runMutation(internal.users.mutations.deleteByClerkId, {
          clerkId: id,
        })
        break
      }
      default:
        console.log("Ignored Clerk webhook event:", event.type)
    }
  } catch (err) {
    console.error("Clerk webhook handler failed:", err)
    return new Response("Webhook handler failed", { status: 500 })
  }

  return new Response(null, { status: 200 })
})

const http = httpRouter()
http.route({
  path: "/clerk/register",
  method: "POST",
  handler: handleClerkWebhook,
})

export default http
