import type { Metadata } from "next";

import { AuthCard } from "@/components/auth-card";

export const metadata: Metadata = {
  title: "Create your account",
  description:
    "Create an account to publish and install security-scanned AI agent skills.",
};

export default function SignUpPage() {
  return (
    <main className="mx-auto max-w-sm px-4 py-16 sm:py-24">
      <AuthCard mode="sign-up" />
    </main>
  );
}
