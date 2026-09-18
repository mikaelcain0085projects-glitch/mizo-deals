"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase-browser";

export default function AccountPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAccount() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/account/login");
        return;
      }

      setEmail(user.email ?? "");
      setFullName(user.user_metadata?.full_name ?? "");
      setLoading(false);
    }

    loadAccount();
  }, [router, supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-sm tracking-[0.3em] text-white/50">
          LOADING ACCOUNT...
        </p>
      </main>
    );
  }

  return (
   <main
  className="relative min-h-screen overflow-hidden px-6 py-32 text-white"
  style={{
    backgroundImage: 'url("/media/shopping-bag.png")',
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
  }}
>
  {/* Dark cinematic overlay */}
  <div className="absolute inset-0 bg-black/55" />

  {/* Cinematic vignette */}
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_12%,rgba(0,0,0,0.28)_55%,rgba(0,0,0,0.72)_100%)]" />

  <div className="relative mx-auto max-w-5xl">
      
        <div>
          <p className="text-sm tracking-[0.3em] text-white/50">
            MIZO DEALS
          </p>

          <h1 className="mt-4 text-5xl font-semibold md:text-7xl">
            My Account
          </h1>

          <p className="mt-5 text-white/50">
            Welcome back
            {fullName ? `, ${fullName}` : ""}.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">
              Account Information
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-sm text-white/40">
                  Name
                </p>

                <p className="mt-1 text-lg">
                  {fullName || "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-sm text-white/40">
                  Email
                </p>

                <p className="mt-1 text-lg">
                  {email}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">
              Shopping
            </p>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => router.push("/shop")}
                className="w-full rounded-full bg-white px-6 py-3 text-sm font-semibold tracking-widest text-black transition hover:bg-white/80"
              >
                CONTINUE SHOPPING
              </button>

              <Link
                href="/orders"
                className="block w-full rounded-full border border-white/20 px-6 py-3 text-center text-sm tracking-widest transition hover:border-white hover:bg-white hover:text-black"
              >
                MY ORDERS
              </Link>

              <Link
                href="/wishlist"
                className="block w-full rounded-full border border-white/20 px-6 py-3 text-center text-sm tracking-widest transition hover:border-white hover:bg-white hover:text-black"
              >
                WISHLIST
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-red-500/30 px-6 py-3 text-sm tracking-widest text-red-300 transition hover:border-red-400 hover:text-red-200"
          >
            LOG OUT
          </button>
        </div>
      </div>
    </main>
  );
}