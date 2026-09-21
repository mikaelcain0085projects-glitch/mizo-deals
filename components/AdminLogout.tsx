"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "../lib/supabase-browser";

export default function AdminLogout() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    const supabase = createClient();

    await supabase.auth.signOut();

    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      disabled={isLoggingOut}
      onClick={handleLogout}
      className="rounded-full border bg-orange-600 border-white/10 px-5 py-2.5 text-xs font-semibold tracking-[0.15em] transition hover:bg-white/50 hover:text-black disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isLoggingOut ? (
        <span
          className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white"
          aria-label="Logging out"
        />
      ) : (
        "LOG OUT"
      )}
    </button>
  );
}