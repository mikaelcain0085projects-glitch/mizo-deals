"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase-browser";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();
  

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(() => {
  if (typeof window === "undefined") {
    return "";
  }

  const errorCode = new URLSearchParams(window.location.search).get(
    "error"
  );

  if (errorCode === "admin_access_denied") {
    return "Access denied. This Google account does not have administrator access.";
  }

  if (errorCode === "profile_check_failed") {
    return "We couldn't verify administrator access. Please try again.";
  }

  if (errorCode === "auth_callback_failed") {
    return "Google sign-in could not be completed. Please try again.";
  }

  return "";
});
  

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const { data, error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    if (!data.user) {
      setError("Login failed. Please try again.");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", data.user.id)
        .maybeSingle();

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    if (!profile || profile.role !== "admin") {
      await supabase.auth.signOut();

      setError(
        "Access denied. This account does not have administrator access."
      );

      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  async function handleGoogleLogin() {
    setError("");
    setGoogleLoading(true);

    const { error: googleError } =
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/admin`,
        },
      });

    if (googleError) {
      setError(googleError.message);
      setGoogleLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 py-16 text-white">
      <div className="w-full max-w-md">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">
            MIZO DEALS
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            Admin Login
          </h1>

          <p className="mt-3 text-sm text-white/50">
            Sign in to access the MIZO DEALS administration panel.
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-8"
        >
          <div>
            <label
              htmlFor="email"
              className="text-sm font-medium text-white/80"
            >
              Admin Email
            </label>

            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter admin email"
              autoComplete="email"
              className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/40"
            />
          </div>

          <div className="mt-5">
            <label
              htmlFor="password"
              className="text-sm font-medium text-white/80"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter admin password"
              autoComplete="current-password"
              className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/40"
            />
          </div>

          {error && (
            <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm leading-6 text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="mt-6 w-full rounded-full bg-white px-6 py-4 text-sm font-semibold tracking-[0.18em] text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "SIGNING IN..." : "ADMIN LOGIN"}
          </button>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs uppercase tracking-[0.2em] text-white/30">
              Or
            </span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading || googleLoading}
            className="flex w-full items-center justify-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-6 py-4 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {googleLoading ? (
              "CONNECTING TO GOOGLE..."
            ) : (
              <>
                <span className="text-lg font-bold">G</span>
                CONTINUE WITH GOOGLE
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/account/login"
            className="text-sm text-white/50 transition hover:text-white"
          >
            ← Back to customer login
          </Link>
        </div>
      </div>
    </main>
  );
}