"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase-browser";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const { error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    router.push("/account");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-black px-6 py-32 text-white">
      <div className="mx-auto max-w-md">

        {/* HEADER */}
        <div className="text-center">
          <p className="text-sm tracking-[0.3em] text-white/50">
            MIZO DEALS
          </p>

          <h1 className="mt-4 text-4xl font-semibold">
            Welcome Back
          </h1>

          <p className="mt-4 text-white/50">
            Login to continue shopping.
          </p>
        </div>

        {/* LOGIN FORM */}
        <form
          onSubmit={handleLogin}
          className="mt-10 space-y-5"
        >

          {/* EMAIL */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm text-white/70"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition placeholder:text-white/30 focus:border-white/40"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm text-white/70"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
              autoComplete="current-password"
              placeholder="Your password"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition placeholder:text-white/30 focus:border-white/40"
            />
          </div>

          {/* ERROR */}
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-white px-8 py-4 text-sm font-semibold tracking-widest text-black transition hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "LOGGING IN..." : "LOGIN"}
          </button>
        </form>

        {/* REGISTER */}
        <p className="mt-8 text-center text-sm text-white/50">
          Don&apos;t have an account?{" "}
          <Link
            href="/account/register"
            className="text-white underline underline-offset-4"
          >
            Create Account
          </Link>
        </p>

        {/* BACK TO SHOP */}
        <div className="mt-6 text-center">
          <Link
            href="/shop"
            className="text-sm tracking-widest text-white/40 transition hover:text-white"
          >
            ← BACK TO SHOP
          </Link>
        </div>

      </div>
    </main>
  );
}