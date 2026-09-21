"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboardBackButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        startTransition(() => {
          router.push("/admin");
        });
      }}
      className="rounded-full border border-white/15 px-5 py-2.5 text-xs text-orange-500 tracking-[0.15em] transition hover:bg-white/70 hover:text-black disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isPending ? (
  <span
    className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-orange-500/30 border-t-orange-500"
    aria-label="Loading"
  />
) : (
  "ADMIN DASHBOARD"
)}
    </button>
  );
}
