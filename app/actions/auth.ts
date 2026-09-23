"use server"

import { AuthError } from "next-auth"
import { signIn, signOut } from "@/auth"

export interface SignInState {
  error?: string
}

export async function signInAction(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/admin",
    })
    return {}
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password. Please try again." }
    }
    // Re-throw redirect errors so Next.js can perform the redirect.
    throw error
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: "/sign-in" })
}
