"use client";

import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase-browser";

export default function AdminLogout() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();

    await supabase.auth.signOut();

    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-full border border-white/20 px-5 py-2.5 text-xs font-semibold tracking-[0.15em] transition hover:bg-white hover:text-black"
    >
      LOG OUT
    </button>
  );
}