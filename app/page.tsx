"use client";

import Image from "next/image";
import EnquiryModal from "@/components/EnquiryModal";
import Link from "next/link";
import { useState } from "react";
import LandingHero from "../components/LandingHero";
import Navbar from "../components/Navbar";


const categories = [
  {
    name: "MEN",
    description: "Modern fits. Mizo identity.",
    href: "/shop?category=men",
    image: "/media/categories/men.jpg",
  },
  {
    name: "WOMEN",
    description: "Style made to stand out.",
    href: "/shop?category=women",
    image: "/media/categories/women.jpg",
  },
  {
    name: "KIDS",
    description: "Comfort with character.",
    href: "/shop?category=kids",
    image: "/media/categories/kids.jpg",
  },
  {
    name: "ACCESSORIES",
    description: "Complete your look.",
    href: "/shop?category=accessories",
    image: "/media/categories/accessories.jpg",
  },
];

export default function Home() {
    const [enquiryOpen, setEnquiryOpen] = useState(false);

  return (
    <main className="bg-black text-white">
      
      <Navbar />

      {/* =====================================================
          LANDING SECTION
          ===================================================== */}
      <LandingHero />

      {/* =====================================================
          SECOND SECTION — SHOP THE COLLECTION
          ===================================================== */}
     <section className="relative min-h-screen overflow-hidden bg-[#111111] px-6 py-24 md:px-12 lg:px-20">
      {/* SOFT SECTION TRANSITION */}
<div
  aria-hidden="true"
  className="
    pointer-events-none
    absolute inset-x-0 top-0
    h-32
    bg-gradient-to-b
    from-black
    via-black/40
    to-transparent
  "
/>
        <div className="mx-auto max-w-7xl">
          

          {/* SECTION HEADING */}
          <div className="mb-16 max-w-3xl">
            <p className="mb-4 text-xs tracking-[0.4em] text-white/40">
              MIZO DEALS
            </p>

            <h2 className="text-4xl font-semibold tracking-[0.08em] md:text-6xl">
              SHOP THE COLLECTION
            </h2>

            <p className="mt-6 max-w-xl text-sm leading-7 tracking-wide text-white/55 md:text-base">
              Discover clothing and accessories made for people who carry
              their style with confidence.
            </p>
          </div>

                   {/* =================================================
              LIQUID GLASS CATEGORY GRID
              ================================================= */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="
                  group
                  relative
                  min-h-[300px]
                  overflow-hidden
                  rounded-[28px]
                  border
                  border-white/20
                  bg-black
                  shadow-[0_20px_70px_rgba(0,0,0,0.35)]
                  transition-all
                  duration-500
                  hover:border-white/50
                  hover:shadow-[0_25px_90px_rgba(0,0,0,0.5)]
                  md:min-h-[360px]
                "
              >

                <Image
                  src={category.image}
                  alt={`${category.name} collection`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  loading="lazy"
                  className="
                    object-cover
                    grayscale
                    transition-transform
                    duration-700
                    ease-out
                    group-hover:scale-105
                  "
                />

                {/* DARK CINEMATIC GRADIENT */}
                <div
                  className="
                    absolute
                    inset-0
                    bg-gradient-to-r
                    from-black/65
via-black/30
to-black/5
                    transition-all
                    duration-500
                    group-hover:from-black/75
                    group-hover:via-black/35
                    group-hover:to-black/10
                  "
                />

                {/* LIQUID GLASS PANEL */}
                <div
                  className="
                    absolute
                    inset-[1px]
                    rounded-[27px]
                    bg-white/[0.035]
                    backdrop-blur-[1px]
                    transition-all
                    duration-500
                    group-hover:bg-white/[0.12]
                    group-hover:backdrop-blur-[2px]
                  "
                />

                {/* GLASS HIGHLIGHT */}
                <div
                  className="
                    pointer-events-none
                    absolute
                    -left-20
                    -top-28
                    h-56
                    w-96
                    rotate-[-18deg]
                    rounded-full
                    bg-white/[0.12]
                    blur-3xl
                    transition-all
                    duration-700
                    group-hover:translate-x-16
                    group-hover:bg-white/[0.2]
                  "
                />

                {/* GLASS EDGE */}
                <div
                  className="
                    pointer-events-none
                    absolute
                    inset-0
                    rounded-[28px]
                    border
                    border-white/[0.08]
                    shadow-[inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-1px_0_rgba(255,255,255,0.05)]
                    transition-all
                    duration-500
                    group-hover:border-white/50
                    group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.65),inset_0_-1px_0_rgba(255,255,255,0.15)]
                  "
                />

                {/* CONTENT */}
                <div className="relative z-10 flex h-full min-h-[300px] flex-col justify-between p-8 md:min-h-[360px] md:p-10">

                  <div>
                    <p className="text-xs tracking-[0.35em] text-white/50 transition-colors duration-500 group-hover:text-white/70">
                      COLLECTION
                    </p>

                    <h3 className="mt-5 text-3xl font-medium tracking-[0.12em] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:translate-x-1 md:text-4xl">
                      {category.name}
                    </h3>

                    <div className="mt-6 h-px w-12 bg-white/70 transition-all duration-500 group-hover:w-20" />
                  </div>

                  <div className="flex items-end justify-between">

                    <p className="max-w-[230px] text-sm leading-6 text-white/65 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] transition-colors duration-500 group-hover:text-white/85">
                      {category.description}
                    </p>

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/60 bg-white/[0.06] text-xl backdrop-blur-xl transition-all duration-500 group-hover:border-white group-hover:bg-white/20 group-hover:translate-x-1 group-hover:scale-105">
                      →
                    </div>

                  </div>

                </div>

              </Link>
            ))}

          </div>
        </div>
      </section>

      {/* =====================================================
          THIRD SECTION — OUR STORY
          ===================================================== */}
      <section className="relative min-h-screen overflow-hidden bg-black text-white">

        {/* STORE INTERIOR IMAGE */}
        <Image
          src="/media/mizo-deals-interior.png"
          alt="Inside the MIZO DEALS store"
          fill
          sizes="100vw"
          className="object-cover brightness-110"
        />

        {/* LIGHT CINEMATIC OVERLAY */}
        <div className="absolute inset-0 bg-black/25" />

        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />

        {/* CONTENT */}
        <div className="relative z-10 flex min-h-screen items-center px-6 py-24 md:px-12 lg:px-20">

          <div className="max-w-4xl">

            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/60">
              MIZO DEALS / OUR STORY
            </p>

            <h2 className="mt-8 max-w-4xl text-6xl font-semibold leading-[0.9] tracking-[-0.04em] md:text-8xl">
              WEAR A
              <br />
              BETTER YOU.
            </h2>

            <p className="mt-8 max-w-3xl text-base leading-7 text-white/75 md:text-lg">
              More than a clothing store. MIZO DEALS is a place where
              personal style meets Mizo identity, modern design, and the
              simple confidence of wearing something that feels like you.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">

              <Link
                href="/shop"
                className="rounded-full bg-white/60 px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-black transition-all duration-300 hover:-translate-y-1 hover:bg-white/70"
              >
                EXPLORE COLLECTION
              </Link>

              <Link
                href="/orders"
                className="rounded-full border border-white/30 bg-black/30 px-8 py-4 text-xs 
                font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-md 
                transition-all duration-300 hover:-translate-y-1 hover:border-white/60 
                hover:bg-white/10"
              >
                <span>TRACK YOUR ORDER</span>

<span
  className="
    ml-3 inline-block
    transition-all duration-500 ease-out
    group-hover:translate-x-1.5
  "
>
  →
</span>
              </Link>

            </div>

          </div>

        </div>
            </section>

      {/* =====================================================
          FOURTH SECTION — STYLE WITH SOMETHING TO SAY
          ===================================================== */}
      <section className="relative overflow-hidden bg-[#111111] px-6 py-28 md:px-12 lg:px-20">
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[1fr_1.2fr] lg:items-center">

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/35">
              WHY MIZO DEALS
            </p>

            <h2 className="mt-6 text-5xl font-semibold leading-[0.95] tracking-[-0.04em] md:text-7xl">
              STYLE WITH
              <br />
              SOMETHING TO
              <br />
              SAY.
            </h2>
          </div>

          <div className="max-w-2xl">
            <p className="text-lg leading-8 text-white/65 md:text-xl">
              Fashion should feel personal. It should give you confidence,
              reflect your personality, and fit naturally into your everyday
              life.
            </p>

            <p className="mt-7 text-base leading-7 text-white/45 md:text-lg">
              That is the idea behind MIZO DEALS. We are building a modern
              fashion destination where clothing, culture, people, and
              creativity come together.
            </p>
          </div>

        </div>
      </section>

      {
      
      /* =====================================================
    FIFTH SECTION — ENQUIRY
    ===================================================== */}
<section
  className="relative overflow-hidden px-6 py-32 text-white md:px-12 lg:px-20"
  style={{
    backgroundImage: 'url("/media/contact-background.png")',
    backgroundSize: "cover",
    backgroundPosition: "center",
  }}
>
  {/* Dark cinematic overlay */}
  <div className="absolute inset-0 bg-black/25" />
  {/* Subtle cinematic gradient */}
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,rgba(0,0,0,0.35)_55%,rgba(0,0,0,0.85)_100%)]" />

  {/* Bottom transition */}
  <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent" />

  {/* Content */}
  <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">

    <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/45">
      LET'S CONNECT
    </p>

    <h2
      className="
        mt-6
        max-w-4xl
        text-5xl
        font-semibold
        leading-[0.95]
        tracking-[-0.04em]
        sm:text-6xl
        md:text-7xl
        lg:text-8xl
      "
    >
      HAVE SOMETHING
      <br />
      TO ASK?
    </h2>

    <p className="mt-7 max-w-xl text-sm leading-7 text-white/60 md:text-base">
      Whether you have a question about an order, a product, or simply
      want to know more, we would love to hear from you.
    </p>

    {/* Premium Enquiry Button */}
    <button
  type="button"
  onClick={() => setEnquiryOpen(true)}
  
      className="
        group
        relative
        mt-10
        inline-flex
        items-center
        justify-center
        overflow-hidden
        rounded-full
        border
        border-orange-300/40
        bg-[#b45309]
        px-8
        py-4
        text-sm
        font-semibold
        tracking-[0.18em]
        text-white
        shadow-[0_10px_40px_rgba(180,83,9,0.20)]
        transition-all
        duration-500
        hover:-translate-y-1
        hover:border-orange-200/70
        hover:bg-[#c4620a]
        hover:shadow-[0_16px_50px_rgba(180,83,9,0.40)]
        active:translate-y-0
      "
    >
      <span>ENQUIRE WITH US</span>

      <span
        className="
          ml-3
          transition-transform
          duration-500
          group-hover:translate-x-1.5
        "
      >
        →
      </span>
    </button>

  </div>
</section>
      {/* =====================================================
          SIXTH SECTION — BRAND STATEMENT
          ===================================================== */}
      <section className="relative overflow-hidden border-y border-white/10 bg-[#0d0d0d] px-6 py-32 md:px-12 lg:px-20">
  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_50%,rgba(180,83,9,0.16),transparent_45%)]" />
        <div className="mx-auto max-w-5xl text-center">

          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/30">
            MIZO DEALS
          </p>

          <blockquote className="mt-8 text-4xl font-medium leading-[1.05] tracking-[-0.04em] md:text-6xl lg:text-7xl">
            “Good outfits brighten days.
            <br />
            Great style becomes part of your story.”
          </blockquote>

          <div className="mx-auto mt-10 h-px w-12 bg-white/30" />

          <p className="mt-7 text-xs uppercase tracking-[0.3em] text-white/40">
            Clothes · People · Stories
          </p>

        </div>

      </section>

      {
            /* =====================================================
          SEVENTH SECTION — TRACK YOUR ORDER
          ===================================================== */}
      <section
        className="relative overflow-hidden px-6 py-28 md:px-12 lg:px-20"
        style={{
          backgroundImage: 'url("/media/shopping-bag.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >

        {/* Dark cinematic overlay */}
       <div className="absolute inset-0 bg-black/25" />
        {/* Cinematic depth / vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_12%,rgba(0,0,0,0.18)_55%,rgba(0,0,0,0.42)_100%)]" />
        {/* Subtle bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#111111] to-transparent" />

        <div
          className="
            relative
            mx-auto
            max-w-7xl
            overflow-hidden
            rounded-[32px]
            border
            border-white/15
            bg-white/[0.015]
p-8
backdrop-blur-[2px]
            md:p-12
            lg:p-16
          "
        >

          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">

            <div className="max-w-2xl">

              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/35">
                YOUR ORDER
              </p>

              <h2 className="mt-6 text-5xl font-semibold leading-[0.95] tracking-[-0.04em] md:text-6xl">
                WHERE'S YOUR
                <br />
                ORDER NOW?
              </h2>

              <p className="mt-6 max-w-xl text-sm leading-7 text-white/50 md:text-base">
                Check your orders and keep an eye on your latest MIZO DEALS
                purchase.
              </p>

            </div>

            <Link
              href="/orders"
              className="
  group relative inline-flex items-center justify-center
  overflow-hidden rounded-full
  border border-orange-400/40
  bg-[#b45309]
  px-7 py-3
  text-sm font-semibold tracking-[0.12em] text-white
  shadow-[0_8px_30px_rgba(180,83,9,0.18)]
  transition-all duration-500 ease-out
  hover:-translate-y-1
  hover:border-orange-300/70
  hover:bg-[#c4620a]
  hover:shadow-[0_14px_40px_rgba(180,83,9,0.38)]
  active:translate-y-0
"
            >
              <span>TRACK YOUR ORDER</span>

              <span
                className="
                  ml-3 inline-block
                  transition-transform duration-300
                  group-hover:translate-x-1
                "
              >
                →
              </span>
            </Link>

          </div>

        </div>

      </section>
      {
      /* =====================================================
          FOOTER
          ===================================================== */}
      <footer className="border-t border-white/10 bg-black px-6 py-12">

        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-xs uppercase tracking-[0.25em] text-white/30 md:flex-row md:items-center md:justify-between">

          <span>MIZO DEALS</span>

          <span>WEAR A BETTER YOU</span>

        </div>

      </footer>
      <EnquiryModal
  open={enquiryOpen}
  onClose={() => setEnquiryOpen(false)}
/>

    </main>
  );
}