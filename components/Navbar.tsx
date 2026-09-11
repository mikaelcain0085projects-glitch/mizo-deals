"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <header className="fixed left-0 right-0 top-4 z-50 px-4 md:px-6">
      <div
        className="
          mx-auto
          flex
          h-16
          max-w-7xl
          items-center
          justify-between
          rounded-full
          border
          border-white/15
          bg-white/[0.015]
          px-5
          text-white
          shadow-[0_8px_40px_rgba(0,0,0,0.35)]
         backdrop-blur-lg
          transition-all
          duration-500
          hover:border-white/25
          hover:bg-white/[0.075]
          hover:shadow-[0_12px_50px_rgba(0,0,0,0.45)]
          md:px-7
        "
      >

        {/* =====================================================
            GLASS REFLECTION
            ===================================================== */}
        <div
          className="
            pointer-events-none
            absolute
            inset-x-10
            top-0
            h-px
            bg-gradient-to-r
            from-transparent
            via-white/50
            to-transparent
          "
        />

        {/* =====================================================
            LOGO
            ===================================================== */}
        <Link
          href="/"
          className="
            relative
            z-10
            text-sm
            font-medium
            tracking-[0.28em]
            text-white
            transition-all
            duration-300
            hover:tracking-[0.34em]
            md:text-base
          "
        >
          MIZO DEALS
        </Link>

        {/* =====================================================
            DESKTOP NAVIGATION
            ===================================================== */}
        <nav className="relative z-10 hidden items-center gap-1 md:flex">

          <Link
            href="/shop"
            className="
              rounded-full
              px-4
              py-2
              text-xs
              font-medium
              tracking-[0.18em]
              text-white/50
              transition-all
              duration-300
              hover:bg-white/10
              hover:text-white
            "
          >
            SHOP
          </Link>

          <Link
            href="/shop?category=men"
            className="
              rounded-full
              px-4
              py-2
              text-xs
              font-medium
              tracking-[0.18em]
              text-white/50
              transition-all
              duration-300
              hover:bg-white/10
              hover:text-white
            "
          >
            MEN
          </Link>

          <Link
            href="/shop?category=women"
            className="
              rounded-full
              px-4
              py-2
              text-xs
              font-medium
              tracking-[0.18em]
              text-white/50
              transition-all
              duration-300
              hover:bg-white/10
              hover:text-white
            "
          >
            WOMEN
          </Link>

          <Link
            href="/shop?category=kids"
            className="
              rounded-full
              px-4
              py-2
              text-xs
              font-medium
              tracking-[0.18em]
              text-white/50
              transition-all
              duration-300
              hover:bg-white/10
              hover:text-white
            "
          >
            KIDS
          </Link>

          <Link
            href="/shop?category=accessories"
            className="
              rounded-full
              px-4
              py-2
              text-xs
              font-medium
              tracking-[0.18em]
              text-white/50
              transition-all
              duration-300
              hover:bg-white/10
              hover:text-white
            "
          >
            ACCESSORIES
          </Link>

        </nav>

        {/* =====================================================
            ACTIONS
            ===================================================== */}
        <div className="relative z-10 flex items-center gap-2">

          {/* WISHLIST */}
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              text-lg
              text-white/70
              transition-all
              duration-300
              hover:bg-white/10
              hover:text-white
              hover:scale-105
            "
          >
            ♡
          </Link>

          {/* CART */}
          <Link
            href="/cart"
            aria-label="Shopping cart"
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              text-base
              text-white/70
              transition-all
              duration-300
              hover:bg-white/10
              hover:text-white
              hover:scale-105
            "
          >
            🛒
          </Link>

          {/* ACCOUNT */}
          <Link
            href="/account"
            aria-label="Account"
            className="
              hidden
              rounded-full
              px-4
              py-2
              text-xs
              font-semibold
              tracking-[0.12em]
              text-white/70
              transition-all
              duration-300
              hover:bg-white
              hover:text-black
              sm:block
            "
          >
            ACCOUNT
          </Link>

          {/* ADMIN */}
          <Link
            href="/admin/login"
            className="
              hidden
              rounded-full
              border
              border-white/10
              px-4
              py-2
              text-xs
              font-medium
              tracking-[0.15em]
              text-white/45
              transition-all
              duration-300
              hover:border-white/25
              hover:bg-white/10
              hover:text-white
              sm:block
            "
          >
            ADMIN
          </Link>

        </div>

      </div>
    </header>
  );
}