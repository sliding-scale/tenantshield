"use node"

import Stripe from "stripe"
import { action, internalAction, type ActionCtx } from "../_generated/server"
import { internal } from "../_generated/api"
import { v } from "convex/values"
import {
  computeShouldHavePaidPlan,
  readCancelAtPeriodEnd,
  readStripeSubscriptionPeriodMs,
} from "../../lib/stripe/subscriptionSync"

function stripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set in Convex environment")
  return new Stripe(key)
}

async function resolveAndApplyStripeSubscription(
  ctx: ActionCtx,
  subscription: Stripe.Subscription,
): Promise<{ handled: boolean; applied?: boolean }> {
  const metadataClerkId =
    typeof subscription.metadata?.clerkId === "string" ? subscription.metadata.clerkId : null
  const priceIdFromWebhook = subscription.items?.data?.[0]?.price?.id

  const stored =
    !metadataClerkId || !priceIdFromWebhook
      ? await ctx.runQuery(internal.stripe.subscriptionQueries.getClerkContextByStripeSubscriptionId, {
          stripeSubscriptionId: subscription.id,
        })
      : null

  const clerkId = metadataClerkId ?? stored?.clerkId ?? null
  if (!clerkId) {
    console.warn(
      "Stripe subscription missing metadata.clerkId and no local row for subscription:",
      subscription.id,
    )
    return { handled: false }
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
      return { handled: false }
    }
  } else if (stored) {
    plan = stored.tier
    billingPeriod = stored.planType
  } else {
    console.warn("Stripe subscription missing price and no stored plan for:", subscription.id)
    return { handled: false }
  }

  const customerId =
    (typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id) ??
    stored?.stripeCustomerId ??
    null
  if (!customerId) {
    console.warn("Stripe subscription missing customer:", subscription.id)
    return { handled: false }
  }

  let periodMs = readStripeSubscriptionPeriodMs(subscription as unknown as Parameters<typeof readStripeSubscriptionPeriodMs>[0])
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
    return { handled: false }
  }

  const cancelAtPeriodEnd = readCancelAtPeriodEnd(
    subscription as unknown as Parameters<typeof readCancelAtPeriodEnd>[0],
  )
  if (cancelAtPeriodEnd) {
    console.log(
      "Stripe subscription scheduled to cancel at period end:",
      subscription.id,
      new Date(periodMs.endMs).toISOString(),
    )
  }

  const nowMs = Date.now()
  const shouldHavePaidPlan = computeShouldHavePaidPlan(subscription.status, periodMs.endMs, nowMs)

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
    shouldHavePaidPlan,
  })

  return { handled: true, applied: true }
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

    const duplicate = await ctx.runQuery(internal.stripe.webhookDedup.isEventProcessed, {
      eventId: event.id,
    })
    if (duplicate) {
      return { handled: true as const, duplicate: true as const }
    }

    const watchedSubscriptions = new Set([
      "customer.subscription.created",
      "customer.subscription.updated",
      "customer.subscription.deleted",
    ])

    let result: { handled: boolean; applied?: boolean } = { handled: false }

    if (watchedSubscriptions.has(event.type)) {
      const eventSub = event.data.object as Stripe.Subscription
      let subscription: Stripe.Subscription = eventSub
      try {
        subscription = await stripe.subscriptions.retrieve(eventSub.id)
      } catch (e) {
        console.error("Stripe subscriptions.retrieve failed, using webhook object:", eventSub.id, e)
      }
      result = await resolveAndApplyStripeSubscription(ctx, subscription)
    } else if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session
      const subId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id
      if (!subId) {
        console.warn("checkout.session.completed missing subscription id:", session.id)
        result = { handled: false }
      } else {
        try {
          const subscription = await stripe.subscriptions.retrieve(subId)
          result = await resolveAndApplyStripeSubscription(ctx, subscription)
        } catch (e) {
          console.error("checkout.session.completed: retrieve subscription failed:", subId, e)
          result = { handled: false }
        }
      }
    } else {
      console.log("Stripe webhook ignored:", event.type)
      return { handled: false as const }
    }

    if (result.applied) {
      await ctx.runMutation(internal.stripe.webhookDedup.markEventProcessed, { eventId: event.id })
    }

    return { handled: result.handled as true | false }
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

    const gate = await ctx.runQuery(internal.planUsage.queries.checkoutShouldUsePortalInstead, {
      clerkId: identity.subject,
    })
    if (gate.blocked) {
      throw new Error(gate.message)
    }

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
    const existingCustomer = await ctx.runQuery(internal.planUsage.queries.stripeCustomerForClerk, {
      clerkId: identity.subject,
    })

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      line_items: [{ price: stripePriceId, quantity: 1 }],
      success_url: `${baseUrl}/dashboard`,
      cancel_url: cancelUrl,
      client_reference_id: identity.subject,
      metadata: { clerkId: identity.subject },
      subscription_data: {
        metadata: { clerkId: identity.subject },
      },
    }

    if (existingCustomer) {
      sessionParams.customer = existingCustomer
    } else {
      sessionParams.customer_email = contact.email
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

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
