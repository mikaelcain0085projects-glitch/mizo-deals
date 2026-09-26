"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "../../../lib/supabase-browser";

export default function LoginPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGoogleLogin() {
    setError("");
    setLoading(true);

    const { error: googleError } =
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

    if (googleError) {
      setError(googleError.message);
      setLoading(false);
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
            Welcome
          </h1>

          <p className="mt-3 text-sm text-white/50">
            Continue with your Google account to shop.
          </p>
        </div>

        <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl md:p-8">
          {error && (
            <div className="mb-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm leading-6 text-red-300">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-full border border-white/10 bg-white/[0.06] px-6 py-4 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              "CONNECTING TO GOOGLE..."
            ) : (
              <>
                <span className="text-lg text-orange-600 font-bold">G</span>
                CONTINUE WITH GOOGLE
              </>
            )}
          </button>

          <div className="mt-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />

            <span className="text-xs uppercase tracking-[0.2em] text-white/30">
              Secure
            </span>

            <div className="h-px flex-1 bg-white/10" />
          </div>

          <p className="mt-6 text-center text-xs leading-5 text-white/35">
            Secure sign-in powered by Google.
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-orange-600 transition hover:text-white/60"
          >
            ← Back to MIZO DEALS
          </Link>
        </div>
      </div>
    </main>
  );
}