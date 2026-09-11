"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "../../../lib/supabase-browser";

export default function RegisterPage() {
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const {
  data: authData,
  error: signUpError,
} = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: "http://localhost:3000/auth/callback",
    data: {
      full_name: fullName,
      phone,
    },
  },
});

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Create the profile immediately if a user session exists.
    if (authData.user && authData.session) {
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: authData.user.id,
          full_name: fullName,
          phone,
          role: "customer",
        });

      if (profileError) {
        console.error("Profile creation error:", profileError);
      }
    }

    setMessage(
      authData.session
        ? "Account created successfully! You can now continue shopping."
        : "Account created! Please check your email to confirm your account."
    );

    setFullName("");
    setPhone("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");

    setLoading(false);
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
            Create Account
          </h1>

          <p className="mt-4 text-white/50">
            Create your account and start shopping.
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleRegister}
          className="mt-10 space-y-5"
        >

          {/* FULL NAME */}
          <div>
            <label
              htmlFor="fullName"
              className="mb-2 block text-sm text-white/70"
            >
              Full Name
            </label>

            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(event) =>
                setFullName(event.target.value)
              }
              required
              placeholder="Your full name"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition placeholder:text-white/30 focus:border-white/40"
            />
          </div>

          {/* PHONE */}
          <div>
            <label
              htmlFor="phone"
              className="mb-2 block text-sm text-white/70"
            >
              Phone Number
            </label>

            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(event) =>
                setPhone(event.target.value)
              }
              required
              placeholder="Your phone number"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition placeholder:text-white/30 focus:border-white/40"
            />
          </div>

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
              minLength={6}
              placeholder="At least 6 characters"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition placeholder:text-white/30 focus:border-white/40"
            />
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm text-white/70"
            >
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              required
              minLength={6}
              placeholder="Enter password again"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition placeholder:text-white/30 focus:border-white/40"
            />
          </div>

          {/* ERROR */}
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* SUCCESS */}
          {message && (
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-300">
              {message}
            </div>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-white px-8 py-4 text-sm font-semibold tracking-widest text-black transition hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
          </button>

        </form>

        {/* LOGIN LINK */}
        <p className="mt-8 text-center text-sm text-white/50">
          Already have an account?{" "}
          <Link
            href="/account/login"
            className="text-white underline underline-offset-4"
          >
            Login
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