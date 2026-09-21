"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export default function AdminProductsBackButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        startTransition(() => {
          router.push("/admin/products");
        });
      }}
      className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isPending ? (
        <span
          className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white"
          aria-label="Loading"
        />
      ) : (
        "← Products"
      )}
    </button>
  );
}