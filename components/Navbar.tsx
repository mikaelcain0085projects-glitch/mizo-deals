"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="fixed left-0 right-0 top-4 z-50 px-4 md:px-6">
      <div
        className="
          relative mx-auto flex h-16 max-w-7xl items-center justify-between
          rounded-full border border-white/15
          bg-white/[0.025]
          px-5 text-white
          shadow-[0_8px_40px_rgba(0,0,0,0.35)]
          backdrop-blur-lg
          transition-all duration-500
          hover:border-white/25
          hover:bg-white/[0.075]
          hover:shadow-[0_12px_50px_rgba(0,0,0,0.45)]
          md:px-7
        "
      >
        {/* TOP GLASS REFLECTION */}
        <div
          className="
            pointer-events-none absolute inset-x-10 top-0 h-px
            bg-gradient-to-r from-transparent via-white/50 to-transparent
          "
        />

        {/* LOGO */}
        <Link
          href="/"
          className="
            relative z-10 text-sm font-medium tracking-[0.28em]
            text-white transition-all duration-300
            hover:tracking-[0.34em] md:text-base
          "
        >
          MIZO DEALS
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className="relative z-10 hidden items-center gap-1 md:flex">
          <Link
            href="/shop"
            className="rounded-full px-4 py-2 text-xs font-medium tracking-[0.18em] text-white/80 transition-all duration-300 hover:bg-white/10 hover:text-[#b45309]"
          >
            SHOP
          </Link>

          <Link
            href="/shop?category=men"
            className="rounded-full px-4 py-2 text-xs font-medium tracking-[0.18em] text-white/80 transition-all duration-300 hover:bg-white/10 hover:text-[#b45309]"
          >
            MEN
          </Link>

          <Link
            href="/shop?category=women"
            className="rounded-full px-4 py-2 text-xs font-medium tracking-[0.18em] text-white/80 transition-all duration-300 hover:bg-white/10 hover:text-[#b45309]"
          >
            WOMEN
          </Link>

          <Link
            href="/shop?category=kids"
            className="rounded-full px-4 py-2 text-xs font-medium tracking-[0.18em] text-white/80 transition-all duration-300 hover:bg-white/10 hover:text-[#b45309]"
          >
            KIDS
          </Link>

          <Link
            href="/shop?category=accessories"
            className="rounded-full px-4 py-2 text-xs font-medium tracking-[0.18em] text-white/80 transition-all duration-300 hover:bg-white/10 hover:text-[#b45309]"
          >
            ACCESSORIES
          </Link>
        </nav>

        {/* RIGHT SIDE */}
        <div className="relative z-10 flex items-center gap-2">
          {/* WISHLIST */}
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="
              flex h-9 w-9 items-center justify-center
              rounded-full text-lg text-white/70
              transition-all duration-300
              hover:scale-105 hover:bg-white/10 hover:text-white
            "
          >
            ♡
          </Link>

          {/* CART */}
          <Link
            href="/cart"
            aria-label="Shopping cart"
            className="
              flex h-9 w-9 items-center justify-center
              rounded-full text-base text-white/70
              transition-all duration-300
              hover:scale-105 hover:bg-white/10 hover:text-white
            "
          >
            🛒
          </Link>

          {/* DESKTOP ACCOUNT */}
          <Link
            href="/account"
            className="
              hidden rounded-full px-4 py-2
              text-xs font-semibold tracking-[0.12em]
              text-[#b45309] transition-all duration-300
              hover:bg-white hover:text-black sm:block
            "
          >
            ACCOUNT
          </Link>

          {/* DESKTOP ADMIN */}
          <Link
            href="/admin/login"
            className="
              hidden rounded-full border border-white/10
              px-4 py-2 text-xs font-medium tracking-[0.15em]
              text-white/45 transition-all duration-300
              hover:border-white/25 hover:bg-white/10 hover:text-white
              sm:block
            "
          >
            ADMIN
          </Link>

          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="
              flex h-9 w-9 items-center justify-center
              rounded-full border border-white/10
              bg-white/[0.03]
              text-white/75
              transition-all duration-300
              hover:bg-white/10 hover:text-white
              md:hidden
            "
          >
            <span className="relative flex h-4 w-4 flex-col justify-center gap-1">
              <span
                className={`block h-px w-4 bg-current transition-all duration-300 ${
                  menuOpen ? "translate-y-[3px] rotate-45" : ""
                }`}
              />
              <span
                className={`block h-px w-4 bg-current transition-all duration-300 ${
                  menuOpen ? "-rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>

        {/* MOBILE DROPDOWN */}
        <div
          className={`
            absolute left-0 right-0 top-[calc(100%+10px)]
            overflow-hidden rounded-[24px]
            border border-white/15
            bg-black/80
            shadow-[0_20px_60px_rgba(0,0,0,0.5)]
            backdrop-blur-xl
            transition-all duration-300
            md:hidden
            ${
              menuOpen
                ? "pointer-events-auto translate-y-0 opacity-100"
                : "pointer-events-none -translate-y-2 opacity-0"
            }
          `}
        >
          <div className="p-3">
            <div className="mb-2 px-4 py-3">
              <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-white/25">
                MIZO DEALS
              </p>
            </div>

            <div className="space-y-1">
              <Link
                href="/shop"
                onClick={closeMenu}
                className="block rounded-2xl px-4 py-3 text-xs font-medium tracking-[0.2em] text-white/65 transition-all hover:bg-white/10 hover:text-white"
              >
                SHOP
              </Link>

              <Link
                href="/shop?category=men"
                onClick={closeMenu}
                className="block rounded-2xl px-4 py-3 text-xs font-medium tracking-[0.2em] text-white/65 transition-all hover:bg-white/10 hover:text-white"
              >
                MEN
              </Link>

              <Link
                href="/shop?category=women"
                onClick={closeMenu}
                className="block rounded-2xl px-4 py-3 text-xs font-medium tracking-[0.2em] text-white/65 transition-all hover:bg-white/10 hover:text-white"
              >
                WOMEN
              </Link>

              <Link
                href="/shop?category=kids"
                onClick={closeMenu}
                className="block rounded-2xl px-4 py-3 text-xs font-medium tracking-[0.2em] text-white/65 transition-all hover:bg-white/10 hover:text-white"
              >
                KIDS
              </Link>

              <Link
                href="/shop?category=accessories"
                onClick={closeMenu}
                className="block rounded-2xl px-4 py-3 text-xs font-medium tracking-[0.2em] text-white/65 transition-all hover:bg-white/10 hover:text-white"
              >
                ACCESSORIES
              </Link>
            </div>

            <div className="my-3 h-px bg-white/10" />

            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/account"
                onClick={closeMenu}
                className="
                  rounded-2xl border border-white/10
                  bg-white/[0.03] px-4 py-3
                  text-center text-[10px] font-semibold
                  tracking-[0.15em] text-white/60
                  transition-all duration-300
                  hover:border-white/25 hover:bg-white/30 hover:text-white
                "
              >
                ACCOUNT
              </Link>

              <Link
                href="/admin/login"
                onClick={closeMenu}
                className="
                  rounded-2xl border border-white/10
                  bg-white/[0.03] px-4 py-3
                  text-center text-[10px] font-semibold
                  tracking-[0.15em] text-white/60
                  transition-all duration-300
                  hover:border-white/25 hover:bg-white/10 hover:text-white
                "
              >
                ADMIN
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}