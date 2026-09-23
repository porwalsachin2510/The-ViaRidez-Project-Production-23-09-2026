"use server"

import { connectToDatabase } from "@/lib/db/mongoose"
import { Subscriber } from "@/models"
import { legacyUnsubscribeToken } from "@/lib/email/notify"

export type UnsubscribeResult =
  | { status: "done"; email: string }
  | { status: "already"; email: string }
  | { status: "invalid" }
  | { status: "error" }

/**
 * Honours an unsubscribe link. Verified by the per-subscriber token so a third
 * party can't unsubscribe an address they merely know, while still accepting
 * the deterministic legacy token for rows created before tokens existed.
 */
export async function unsubscribeByToken(
  emailRaw: string,
  token: string,
): Promise<UnsubscribeResult> {
  const email = String(emailRaw || "").trim().toLowerCase()
  if (!email || !token) return { status: "invalid" }

  try {
    await connectToDatabase()
    const subscriber = await Subscriber.findOne({ email })
    if (!subscriber) return { status: "invalid" }

    const stored = String(subscriber.unsubscribeToken || "")
    const valid = stored ? stored === token : token === legacyUnsubscribeToken(email)
    if (!valid) return { status: "invalid" }

    if (subscriber.status === "unsubscribed") return { status: "already", email }

    subscriber.status = "unsubscribed"
    subscriber.unsubscribedAt = new Date()
    await subscriber.save()
    return { status: "done", email }
  } catch (error) {
    console.log(
      "[v0] unsubscribeByToken error:",
      error instanceof Error ? error.message : error,
    )
    return { status: "error" }
  }
}

/** Re-subscribe from the confirmation screen, in case the click was a mistake. */
export async function resubscribeByToken(
  emailRaw: string,
  token: string,
): Promise<UnsubscribeResult> {
  const email = String(emailRaw || "").trim().toLowerCase()
  if (!email || !token) return { status: "invalid" }

  try {
    await connectToDatabase()
    const subscriber = await Subscriber.findOne({ email })
    if (!subscriber) return { status: "invalid" }

    const stored = String(subscriber.unsubscribeToken || "")
    const valid = stored ? stored === token : token === legacyUnsubscribeToken(email)
    if (!valid) return { status: "invalid" }

    subscriber.status = "subscribed"
    subscriber.unsubscribedAt = null
    await subscriber.save()
    return { status: "done", email }
  } catch (error) {
    console.log(
      "[v0] resubscribeByToken error:",
      error instanceof Error ? error.message : error,
    )
    return { status: "error" }
  }
}
