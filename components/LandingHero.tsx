"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

const HERO_IMAGES = [
  "/media/mizo-deals-storefront.jpg",
  "/media/models1.png",
  "/media/models2.png",
  "/media/models3.png",
];

export default function LandingHero() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const slideshowTimer = setInterval(() => {
      setActiveSlide((current) => {
        return (current + 1) % HERO_IMAGES.length;
      });
    }, 1500);

    return () => {
      clearInterval(slideshowTimer);
    };
  }, []);

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">

      {/* ------------------------------------------------ */}
      {/* BACKGROUND SLIDESHOW                              */}
      {/* ------------------------------------------------ */}

      {HERO_IMAGES.map((image, index) => (
        <div
          key={image}
          className={`absolute inset-0 transition-all duration-[700ms] ease-out ${
            activeSlide === index
              ? "scale-100 opacity-100"
              : "scale-[1.035] opacity-0"
          }`}
        >
          <Image
            src={image}
            alt={
              index === 0
                ? "MIZO DEALS storefront"
                : `MIZO DEALS fashion model ${index}`
            }
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover"
          />
        </div>
      ))}

      {/* ------------------------------------------------ */}
      {/* CINEMATIC OVERLAYS                                */}
      {/* ------------------------------------------------ */}

      <div className="absolute inset-0 bg-black/25" />

      <div
        className="
          absolute inset-0
          bg-gradient-to-t
          from-black
          via-black/20
          to-black/25
        "
      />

      <div
        className="
          absolute inset-0
          bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.25)_65%,rgba(0,0,0,0.65)_100%)]
        "
      />

      {/* ------------------------------------------------ */}
      {/* HERO CONTENT                                      */}
      {/* ------------------------------------------------ */}

      <div
        className="
          absolute inset-0 z-10
          flex flex-col
          items-center
          justify-end
          px-6
          pb-16
          text-center
          text-white
          md:pb-20
        "
      >

        <p
          className="
            mb-4
            text-xs
            tracking-[0.45em]
            text-white/65
            md:text-sm
          "
        >
          WELCOME TO
        </p>

        <h1
          className="
            max-w-4xl
            text-4xl
            font-medium
            tracking-[0.12em]
            drop-shadow-[0_4px_25px_rgba(0,0,0,0.65)]
            sm:text-5xl
            md:text-7xl
            lg:text-8xl
          "
        >
          MIZO DEALS
        </h1>

        <p
          className="
            mt-4
            text-xs
            tracking-[0.3em]
            text-white/80
            md:text-base
            md:tracking-[0.35em]
          "
        >
          FASHION • STYLE • IDENTITY
        </p>

        <Link
          href="/shop"
          className="
            group
            mt-8
            inline-flex
            items-center
            justify-center
            rounded-full
            border
            border-white/60
            bg-black/20
            px-8
            py-3
            text-sm
            tracking-[0.2em]
            backdrop-blur-sm
            transition-all
            duration-500
            hover:-translate-y-1
            hover:bg-white
            hover:text-black
          "
        >
          SHOP COLLECTION

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
        </Link>

        {/* ------------------------------------------------ */}
        {/* SLIDESHOW INDICATORS                              */}
        {/* ------------------------------------------------ */}

        <div className="mt-10 flex items-center gap-2">
          {HERO_IMAGES.map((_, index) => (
            <span
              key={index}
              className={`
                h-1.5
                rounded-full
                transition-all
                duration-700
                ${
                  activeSlide === index
                    ? "w-7 bg-white"
                    : "w-1.5 bg-white/40"
                }
              `}
            />
          ))}
        </div>

        <div
          className="
            mt-8
            text-[10px]
            tracking-[0.35em]
            text-white/55
            md:text-xs
          "
        >
          SCROLL TO EXPLORE
        </div>

      </div>

    </section>
  );
}