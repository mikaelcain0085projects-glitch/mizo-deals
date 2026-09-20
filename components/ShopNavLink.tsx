"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

type ShopNavLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export default function ShopNavLink({
  href,
  children,
  className = "",
}: ShopNavLinkProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isPending, startTransition] = useTransition();

  const currentUrl =
    pathname +
    (searchParams.toString()
      ? `?${searchParams.toString()}`
      : "");

  const isCurrent = currentUrl === href;

  function handleClick(
    event: React.MouseEvent<HTMLAnchorElement>
  ) {
    if (isCurrent || isPending) {
      event.preventDefault();
      return;
    }

    event.preventDefault();

    startTransition(() => {
      router.push(href);
    });
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      aria-busy={isPending}
      className={`relative ${className}`}
    >
      {isPending ? (
        <span className="flex items-center justify-center gap-2">
          <span
            className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent"
            aria-hidden="true"
          />

          <span>Loading...</span>
        </span>
      ) : (
        children
      )}
    </Link>
  );
}