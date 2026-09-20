"use client";

import Link from "next/link";
import { useTransition } from "react";

type LoadingLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export default function LoadingLink({
  href,
  children,
  className = "",
}: LoadingLinkProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <Link
      href={href}
      onClick={() => {
        startTransition(() => {});
      }}
      className={`relative ${className}`}
      aria-busy={isPending}
    >
      {isPending ? (
        <span className="inline-flex items-center justify-center gap-2">
          <span
            className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent"
            aria-hidden="true"
          />
          Loading...
        </span>
      ) : (
        children
      )}
    </Link>
  );
}