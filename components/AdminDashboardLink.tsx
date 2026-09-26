"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboardLink() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    startTransition(() => {
      router.push("/admin");
    });
  };

  return (
    <Link
      href="/admin"
      onClick={handleClick}
      aria-busy={isPending}
      className="inline-flex w-fit items-center justify-center rounded-full border border-white/20 px-5 py-2.5 text-xs font-semibold tracking-[0.15em] text-orange-600 transition hover:bg-white hover:text-black"
    >
      {isPending ? (
        <span
          className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-orange-600/30 border-t-orange-600"
          aria-label="Loading"
        />
      ) : (
        "ADMIN DASHBOARD"
      )}
    </Link>
  );
}