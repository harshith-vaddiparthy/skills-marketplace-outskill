"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Centered auth card, shared by /auth/sign-in and /auth/sign-up. This is UI
 * only for now: Better Auth is configured server-side but not yet wired to
 * these forms, so submit is intercepted and no credentials are stored.
 */
export function AuthCard({ mode }: { mode: "sign-in" | "sign-up" }) {
  const [submitting, setSubmitting] = useState(false);
  const isSignUp = mode === "sign-up";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    toast("Auth is not wired up in this demo yet.", {
      description: "Better Auth lands later. No password was stored.",
    });
    setSubmitting(false);
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <Logo withWordmark={false} className="[&_svg]:size-8" />
          <h1 className="mt-4 text-xl font-semibold tracking-tight text-foreground">
            {isSignUp ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {isSignUp
              ? "Join to publish and install vetted skills."
              : "Sign in to publish and install vetted skills."}
          </p>
        </div>

        <p className="mt-5 flex items-start gap-2 rounded-lg border border-caution/30 bg-caution/10 px-3 py-2 text-xs leading-relaxed text-caution">
          <ShieldAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          Demo preview. Sign-in is not connected yet, so nothing you type is
          saved.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          {isSignUp && (
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Ada Lovelace"
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {isSignUp ? "Create account" : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isSignUp ? (
            <>
              Already have an account?{" "}
              <Link
                href="/auth/sign-in"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </>
          ) : (
            <>
              New here?{" "}
              <Link
                href="/auth/sign-up"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Create an account
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
