import type { Metadata } from "next";

import { AuthCard } from "@/components/auth-card";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to publish and install security-scanned AI agent skills.",
};

export default function SignInPage() {
  return (
    <main className="mx-auto max-w-sm px-4 py-16 sm:py-24">
      <AuthCard mode="sign-in" />
    </main>
  );
}
