"use client";

import Link from "next/link";
import { useState } from "react";

type AdminNavLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export default function AdminNavLink({
  href,
  children,
  className = "",
}: AdminNavLinkProps) {
  const [loading, setLoading] = useState(false);

  return (
    <Link
      href={href}
      onClick={() => setLoading(true)}
      aria-busy={loading}
      className={`relative ${className}`}
    >
      {loading ? (
        <div className="flex min-h-full flex-col">
          <div className="flex flex-1 items-center justify-center">
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.15em] text-white/70">
              <span
                className="h-3 w-3 animate-spin rounded-full border border-white/50 border-t-transparent"
                aria-hidden="true"
              />
              LOADING...
            </span>
          </div>
        </div>
      ) : (
        children
      )}
    </Link>
  );
}