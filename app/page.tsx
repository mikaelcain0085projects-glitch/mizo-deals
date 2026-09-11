import Image from "next/image";
import Link from "next/link";
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
      <section className="min-h-screen bg-[#111111] px-6 py-24 md:px-12 lg:px-20">
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

                {/* =================================================
                    CATEGORY IMAGE
                    ================================================= */}
                <Image
  src={category.image}
  alt={`${category.name} collection`}
  fill
  sizes="(max-width: 768px) 100vw, 50vw"
  loading="lazy"
  unoptimized
  className="
    object-cover
    grayscale
    transition-transform
    duration-700
    ease-out
    group-hover:scale-105
  "
/>

                {/* =================================================
                    DARK CINEMATIC GRADIENT
                    ================================================= */}
                <div
                  className="
                    absolute
                    inset-0
                    bg-gradient-to-r
                    from-black/90
                    via-black/55
                    to-black/15
                    transition-all
                    duration-500
                    group-hover:from-black/75
                    group-hover:via-black/35
                    group-hover:to-black/10
                  "
                />

                {/* =================================================
                    LIQUID GLASS PANEL
                    ================================================= */}
                <div
                  className="
                    absolute
                    inset-[1px]
                    rounded-[27px]
                    bg-white/[0.035]
                    backdrop-blur-[1px]
                    transition-all
                    duration-500
                    group-hover:bg-[#f2f0eb]/[0.12]
                    group-hover:backdrop-blur-[2px]                 
                    "
                />

                {/* =================================================
                    GLASS HIGHLIGHT
                    ================================================= */}
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

                {/* =================================================
                    GLASS EDGE LIGHT
                    ================================================= */}
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
                    group-hover:border-[#f2f0eb]/50
                    group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.65),inset_0_-1px_0_rgba(255,255,255,0.15)]
                  "
                />

                {/* =================================================
                    CONTENT
                    ================================================= */}
                <div className="relative z-10 flex h-full min-h-[300px] flex-col justify-between p-8 md:min-h-[360px] md:p-10">

                  {/* TOP */}
                  <div>
                    <p
                      className="
                        text-xs
                        tracking-[0.35em]
                        text-white/50
                        transition-colors
                        duration-500
                        group-hover:text-white/70
                      "
                    >
                      COLLECTION
                    </p>

                    <h3
                      className="
                        mt-5
                        text-3xl
                        font-medium
                        tracking-[0.12em]
                        text-white
                        drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]
                        transition-transform
                        duration-500
                        group-hover:translate-x-1
                        md:text-4xl
                      "
                    >
                      {category.name}
                    </h3>

                    {/* SMALL GLASS LINE */}
                    <div
                      className="
                        mt-6
                        h-px
                        w-12
                        bg-white/70
                        transition-all
                        duration-500
                        group-hover:w-20
                        group-hover:bg-[#f2f0eb]
                      "
                    />
                  </div>

                  {/* BOTTOM */}
                  <div className="flex items-end justify-between">

                    <p
                      className="
                        max-w-[230px]
                        text-sm
                        leading-6
                        text-white/65
                        drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]
                        transition-colors
                        duration-500
                        group-hover:text-white/85
                      "
                    >
                      {category.description}
                    </p>

                    {/* CIRCULAR ARROW */}
                    <div
                      className="
                        flex
                        h-12
                        w-12
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-white/60
                        bg-white/[0.06]
                        text-xl
                        backdrop-blur-xl
                        transition-all
                        duration-500
                        group-hover:border-[#f2f0eb]
                        group-hover:bg-[#f2f0eb]/20
                        group-hover:translate-x-1
                        group-hover:scale-105
                      "
                    >
                      →
                    </div>

                  </div>

                </div>

              </Link>
            ))}

          </div>

        </div>
      </section>
    </main>
  );
}