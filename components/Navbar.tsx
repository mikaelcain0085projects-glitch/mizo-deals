"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-black/70 text-white backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

        {/* LOGO */}
        <Link
          href="/"
          className="text-xl font-medium tracking-[0.25em]"
        >
          MIZO DEALS
        </Link>

        {/* NAVIGATION */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/shop"
            className="text-sm tracking-widest text-white/50 transition hover:text-white"
          >
            SHOP
          </Link>

          <Link
            href="/shop?category=men"
            className="text-sm tracking-widest text-white/50 transition hover:text-white"
          >
            MEN
          </Link>

          <Link
            href="/shop?category=women"
            className="text-sm tracking-widest text-white/50 transition hover:text-white"
          >
            WOMEN
          </Link>

          <Link
            href="/shop?category=kids"
            className="text-sm tracking-widest text-white/50 transition hover:text-white"
          >
            KIDS
          </Link>

          <Link
            href="/shop?category=accessories"
            className="text-sm tracking-widest text-white/50 transition hover:text-white"
          >
            ACCESSORIES
          </Link>
        </nav>

        {/* ACTIONS */}
        <div className="flex items-center gap-5">

          {/* WISHLIST */}
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="text-xl transition hover:scale-110"
          >
            ♡
          </Link>

          {/* CART */}
          <Link
            href="/cart"
            aria-label="Shopping cart"
            className="text-xl transition hover:scale-110"
          >
            🛒
          </Link>

          {/* ACCOUNT */}
          <Link
            href="/account"
            aria-label="Account"
             className="text-orange-500 transition hover:text-white"
          >
            ACCOUNT
          </Link>
          <Link
  href="/admin/login"
 className="hidden text-sm tracking-widest text-white/80 transition hover:text-white sm:block"
>
  ADMIN
</Link>

        </div>
      </div>
    </header>
  );
}