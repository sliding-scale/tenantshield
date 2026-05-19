"use node"

import Stripe from "stripe"
import { action, internalAction } from "../_generated/server"
import { internal } from "../_generated/api"
import { v } from "convex/values"

function stripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set in Convex environment")
  return new Stripe(key)
}

/** Stripe may send Unix seconds as number or string on webhook payloads. */
function toUnixSeconds(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value)
    return Number.isFinite(n) ? n : null
  }
  return null
}

/**
 * Billing period bounds in ms since epoch.
 * Stripe 2025-03-31 basil+ exposes periods on subscription items; older API used the subscription root.
 */
function readStripeSubscriptionPeriodMs(sub: Stripe.Subscription): {
  startMs: number
  endMs: number
} | null {
  const candidates: unknown[] = [sub.items?.data?.[0], sub]

  for (const obj of candidates) {
    if (!obj || typeof obj !== "object") continue
    const record = obj as Record<string, unknown>
    const startSec = toUnixSeconds(record["current_period_start"])
    const endSec = toUnixSeconds(record["current_period_end"])
    if (startSec !== null && endSec !== null) {
      return { startMs: startSec * 1000, endMs: endSec * 1000 }
    }
  }

  return null
}

/** Portal cancel-at-period-end; webhook payloads may omit fields unless we retrieve the sub. */
function readCancelAtPeriodEnd(sub: Stripe.Subscription): boolean {
  const record = sub as unknown as Record<string, unknown>
  if (sub.cancel_at_period_end === true || record["cancel_at_period_end"] === true) {
    return true
  }

  const status = sub.status
  if (status !== "active" && status !== "trialing" && status !== "past_due") {
    return false
  }

  const cancelAtSec = toUnixSeconds(record["cancel_at"])
  const period = readStripeSubscriptionPeriodMs(sub)
  if (cancelAtSec !== null && period !== null) {
    const cancelAtMs = cancelAtSec * 1000
    if (Math.abs(cancelAtMs - period.endMs) <= 86_400_000) {
      return true
    }
  }

  return false
}

export const processWebhook = internalAction({
  args: {
    rawBody: v.string(),
    signature: v.string(),
  },
  handler: async (ctx, args) => {
    const whSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!whSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not set in Convex environment")

    const stripe = stripeClient()
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(args.rawBody, args.signature, whSecret)
    } catch (err) {
      console.error("Stripe webhook verification failed:", err)
      throw new Error("Invalid Stripe webhook signature")
    }

    const watched = new Set([
      "customer.subscription.created",
      "customer.subscription.updated",
      "customer.subscription.deleted",
    ])

    if (!watched.has(event.type)) {
      console.log("Stripe webhook ignored:", event.type)
      return { handled: false as const }
    }

    const eventSub = event.data.object as Stripe.Subscription

    let subscription: Stripe.Subscription = eventSub
    try {
      subscription = await stripe.subscriptions.retrieve(eventSub.id)
    } catch (e) {
      console.error("Stripe subscriptions.retrieve failed, using webhook object:", eventSub.id, e)
    }

    const metadataClerkId =
      typeof subscription.metadata?.clerkId === "string" ? subscription.metadata.clerkId : null
    const priceIdFromWebhook = subscription.items?.data?.[0]?.price?.id

    const stored =
      !metadataClerkId || !priceIdFromWebhook
        ? await ctx.runQuery(
            internal.stripe.subscriptionQueries.getClerkContextByStripeSubscriptionId,
            { stripeSubscriptionId: subscription.id },
          )
        : null

    const clerkId = metadataClerkId ?? stored?.clerkId ?? null
    if (!clerkId) {
      console.warn(
        "Stripe subscription missing metadata.clerkId and no local row for subscription:",
        subscription.id,
      )
      return { handled: false as const }
    }

    const priceId = priceIdFromWebhook ?? stored?.stripePriceId ?? null

    let plan: "pro" | "power"
    let billingPeriod: "monthly" | "yearly"

    if (priceId) {
      const resolved = await ctx.runQuery(internal.planCatalog.queries.resolvePlanFromStripePriceId, {
        stripePriceId: priceId,
      })
      if (resolved) {
        plan = resolved.tier
        billingPeriod = resolved.billingPeriod
      } else if (stored) {
        plan = stored.tier
        billingPeriod = stored.planType
      } else {
        console.warn("Unknown Stripe price — set monthlyPriceId/yearlyPriceId on planCatalog:", priceId)
        return { handled: false as const }
      }
    } else if (stored) {
      plan = stored.tier
      billingPeriod = stored.planType
    } else {
      console.warn("Stripe subscription missing price and no stored plan for:", subscription.id)
      return { handled: false as const }
    }

    const customerId =
      (typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer?.id) ??
      stored?.stripeCustomerId ??
      null
    if (!customerId) {
      console.warn("Stripe subscription missing customer:", subscription.id)
      return { handled: false as const }
    }

    let periodMs = readStripeSubscriptionPeriodMs(subscription)
    if (!periodMs && stored) {
      periodMs = {
        startMs: stored.currentPeriodStart,
        endMs: stored.currentPeriodEnd,
      }
    }
    if (!periodMs) {
      console.warn(
        "Stripe subscription missing current_period_start/end on items and root (check API version):",
        subscription.id,
      )
      return { handled: false as const }
    }

    const cancelAtPeriodEnd = readCancelAtPeriodEnd(subscription)
    if (cancelAtPeriodEnd) {
      console.log(
        "Stripe subscription scheduled to cancel at period end:",
        subscription.id,
        new Date(periodMs.endMs).toISOString(),
      )
    }

    await ctx.runMutation(internal.stripe.subscriptionMutations.applyStripeSubscription, {
      clerkId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId ?? "",
      plan,
      billingPeriod,
      stripeStatus: subscription.status,
      currentPeriodStartMs: periodMs.startMs,
      currentPeriodEndMs: periodMs.endMs,
      cancelAtPeriodEnd,
    })

    return { handled: true as const }
  },
})

export const createCheckoutSession = action({
  args: {
    plan: v.union(v.literal("pro"), v.literal("power")),
    planType: v.union(v.literal("monthly"), v.literal("yearly")),
    checkoutSource: v.union(v.literal("onboarding"), v.literal("billing")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthenticated")

    const baseUrl = process.env.SITE_URL?.replace(/\/$/, "")
    if (!baseUrl) {
      throw new Error("SITE_URL is not set in Convex environment")
    }

    const stripePriceId = await ctx.runQuery(internal.planCatalog.queries.getStripePriceIdForPlan, {
      tier: args.plan,
      billingPeriod: args.planType,
    })
    if (!stripePriceId) {
      throw new Error(
        "Stripe price ID missing in planCatalog for this plan. Set monthlyPriceId and yearlyPriceId on the pro/power rows (Dashboard), or run planCatalog/seed:seedPlanCatalog.",
      )
    }

    const contact = await ctx.runQuery(internal.users.queries.getUserContactByClerkId, {
      clerkId: identity.subject,
    })
    if (!contact?.email) {
      throw new Error("Your account has no email; cannot start checkout.")
    }

    const cancelUrl =
      args.checkoutSource === "billing"
        ? `${baseUrl}/billing`
        : `${baseUrl}/onboarding/plans`

    const stripe = stripeClient()
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: stripePriceId, quantity: 1 }],
      success_url: `${baseUrl}/dashboard`,
      cancel_url: cancelUrl,
      client_reference_id: identity.subject,
      customer_email: contact.email,
      metadata: { clerkId: identity.subject },
      subscription_data: {
        metadata: { clerkId: identity.subject },
      },
    })

    if (!session.url) {
      throw new Error("Stripe Checkout did not return a URL")
    }

    return { url: session.url }
  },
})

export const createBillingPortalSession = action({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthenticated")

    const baseUrl = process.env.SITE_URL?.replace(/\/$/, "")
    if (!baseUrl) {
      throw new Error("SITE_URL is not set in Convex environment")
    }

    const customerId = await ctx.runQuery(internal.planUsage.queries.stripeCustomerForClerk, {
      clerkId: identity.subject,
    })
    if (!customerId) {
      throw new Error("No billing profile yet. Subscribe through Checkout first.")
    }

    const stripe = stripeClient()
    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${baseUrl}/billing`,
    })

    if (!portal.url) {
      throw new Error("Stripe Billing Portal did not return a URL")
    }

    return { url: portal.url }
  },
})
