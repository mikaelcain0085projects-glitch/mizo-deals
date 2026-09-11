import Image from "next/image";
import Link from "next/link";
import Navbar from "../../components/Navbar";

const values = [
  {
    number: "01",
    title: "Mizo Identity",
    text: "A modern fashion space shaped by where we come from and how we choose to move forward.",
  },
  {
    number: "02",
    title: "Curated Style",
    text: "Thoughtfully selected clothing and accessories designed to make everyday dressing feel effortless.",
  },
  {
    number: "03",
    title: "Quality First",
    text: "We believe good style starts with pieces you actually enjoy wearing, season after season.",
  },
  {
    number: "04",
    title: "People Matter",
    text: "Behind every order is a person. We are here to make the shopping experience feel personal.",
  },
];

export default function AboutPage() {
  return (
    <main className="bg-black text-white">
      <Navbar />

      {/* =====================================================
          HERO
          ===================================================== */}
      <section className="relative min-h-screen overflow-hidden">
        <Image
          src="/media/mizo-deals-interior.png"
          alt="Inside the MIZO DEALS store"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

       {/* Cinematic overlay */}
<div className="absolute inset-0 bg-black/25" />
<div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
        {/* Hero content */}
        <div className="relative z-10 flex min-h-screen items-end px-6 pb-16 pt-32 md:px-12 md:pb-24 lg:px-20">
          <div className="mx-auto w-full max-w-7xl">
            <div className="max-w-3xl">
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.4em] text-white/60">
                MIZO DEALS / OUR STORY
              </p>

              <h1 className="text-5xl font-semibold tracking-[-0.04em] md:text-7xl lg:text-8xl">
                WEAR A
                <br />
                BETTER YOU.
              </h1>

              <p className="mt-7 max-w-2xl text-base leading-7 text-white/70 md:text-lg">
                More than a clothing store. MIZO DEALS is a place where
                personal style meets Mizo identity, modern design, and the
                simple confidence of wearing something that feels like you.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href="/shop"
                  className="rounded-full bg-white px-7 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-white/90"
                >
                  Explore Collection
                </Link>

                <Link
                  href="/orders"
                  className="rounded-full border border-white/30 bg-white/10 px-7 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-xl transition hover:bg-white/20"
                >
                  Track Your Order
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          INTRO
          ===================================================== */}
      <section className="relative overflow-hidden bg-[#111111] px-6 py-24 md:px-12 lg:px-20">
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/35">
              WHY MIZO DEALS
            </p>

            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.03em] md:text-6xl">
              STYLE WITH
              <br />
              SOMETHING TO SAY.
            </h2>
          </div>

          <div>
            <p className="text-lg leading-8 text-white/65 md:text-xl">
              Fashion should feel personal. It should give you confidence,
              reflect your personality, and fit naturally into your everyday
              life.
            </p>

            <p className="mt-6 text-base leading-7 text-white/45">
              That is the idea behind MIZO DEALS. We are building a modern
              fashion destination where clothing, culture, people, and
              creativity come together.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          VALUES / ACCOLADES
          ===================================================== */}
      <section className="bg-black px-6 py-24 md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/35">
              WHAT WE STAND FOR
            </p>

            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.03em] md:text-6xl">
              BUILT AROUND
              <br />
              THE DETAILS.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {values.map((value) => (
              <div
                key={value.number}
                className="
                  group
                  relative
                  overflow-hidden
                  rounded-[28px]
                  border border-white/10
                  bg-white/[0.045]
                  p-7
                  backdrop-blur-xl
                  transition-all
                  duration-500
                  hover:-translate-y-1
                  hover:border-white/25
                  hover:bg-white/[0.07]
                  md:p-9
                "
              >
                {/* Glass reflection */}
                <div
                  className="
                    pointer-events-none
                    absolute
                    -right-20
                    -top-24
                    h-48
                    w-48
                    rounded-full
                    bg-white/[0.07]
                    blur-3xl
                    transition-transform
                    duration-700
                    group-hover:translate-x-8
                    group-hover:translate-y-8
                  "
                />

                <div className="relative z-10">
                  <p className="text-xs tracking-[0.25em] text-white/25">
                    {value.number}
                  </p>

                  <h3 className="mt-10 text-2xl font-medium tracking-tight">
                    {value.title}
                  </h3>

                  <p className="mt-4 max-w-md text-sm leading-7 text-white/50">
                    {value.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          STORE QUOTE
          ===================================================== */}
      <section className="relative overflow-hidden border-y border-white/10 bg-[#0d0d0d] px-6 py-28 md:px-12 lg:px-20">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/30">
            MIZO DEALS
          </p>

          <blockquote className="mt-7 text-3xl font-medium leading-tight tracking-[-0.03em] md:text-5xl lg:text-6xl">
            “Good outfits brighten days.
            <br />
            Great style becomes part of your story.”
          </blockquote>

          <div className="mx-auto mt-9 h-px w-12 bg-white/30" />

          <p className="mt-6 text-sm uppercase tracking-[0.25em] text-white/40">
            Clothes · People · Stories
          </p>
        </div>
      </section>

      {/* =====================================================
          TRACK ORDER CTA
          ===================================================== */}
      <section className="relative overflow-hidden bg-[#111111] px-6 py-24 md:px-12 lg:px-20">
        <div
          className="
            mx-auto
            max-w-7xl
            overflow-hidden
            rounded-[32px]
            border
            border-white/15
            bg-white/[0.045]
            p-8
            backdrop-blur-xl
            md:p-12
            lg:p-16
          "
        >
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/35">
                YOUR ORDER
              </p>

              <h2 className="mt-5 text-4xl font-semibold tracking-[-0.03em] md:text-5xl">
                WHERE'S YOUR
                <br />
                ORDER NOW?
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-white/50 md:text-base">
                Check your orders and keep an eye on your latest MIZO DEALS
                purchase.
              </p>
            </div>

            <Link
              href="/orders"
              className="
                inline-flex
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-white
                px-8
                py-4
                text-xs
                font-semibold
                uppercase
                tracking-[0.18em]
                text-black
                transition
                hover:bg-white/90
              "
            >
              Track Your Order →
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
          ===================================================== */}
      <footer className="border-t border-white/10 bg-black px-6 py-10 md:px-12 lg:px-20">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-xs uppercase tracking-[0.2em] text-white/30 md:flex-row md:items-center md:justify-between">
          <span>MIZO DEALS</span>
          <span>Wear A Better You</span>
        </div>
      </footer>
    </main>
  );
}