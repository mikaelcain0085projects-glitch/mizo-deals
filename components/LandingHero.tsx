"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const INTRO_STORAGE_KEY = "mizo-deals-intro-seen";

type IntroState = "intro" | "glitch" | "storefront";

export default function LandingHero() {
  const [introState, setIntroState] =
    useState<IntroState>("intro");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const finishedRef = useRef(false);

  /*
   * Check the browser session after mounting.
   *
   * IMPORTANT:
   * We start with "intro" so the first server render and
   * first client render match.
   */
  useEffect(() => {
    const alreadySeen =
      window.sessionStorage.getItem(
        INTRO_STORAGE_KEY
      ) === "true";

    if (alreadySeen) {
      setIntroState("storefront");
    }
  }, []);

  /*
   * Watch the actual video position.
   *
   * There is NO initializedRef here.
   *
   * React Strict Mode may run this effect more than once.
   * That is okay because every run creates its own watchdog
   * and cleanup only removes that particular watchdog.
   */
  useEffect(() => {
    if (introState !== "intro") {
      return;
    }

    let animationFrame = 0;

    const checkVideo = () => {
      const video = videoRef.current;

      if (!video || finishedRef.current) {
        return;
      }

      if (
        Number.isFinite(video.duration) &&
        video.duration > 0
      ) {
        const remaining =
          video.duration - video.currentTime;

        /*
         * Trigger slightly before the absolute final frame.
         *
         * This prevents the video from sitting frozen on
         * 6.633333 seconds.
         */
        if (
          remaining <= 0.15 ||
          video.ended
        ) {
          finishIntro();
          return;
        }
      }

      animationFrame =
        window.requestAnimationFrame(checkVideo);
    };

    animationFrame =
      window.requestAnimationFrame(checkVideo);

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [introState]);

  /*
   * Finish the cinematic.
   *
   * This function is deliberately protected by finishedRef
   * so multiple watchdogs/events cannot trigger the sequence
   * twice.
   */
  function finishIntro() {
    if (finishedRef.current) {
      return;
    }

    finishedRef.current = true;

    /*
     * Stop the cinematic at its final frame.
     */
    if (videoRef.current) {
      videoRef.current.pause();
    }

    /*
     * Start the cyberpunk interruption.
     */
    setIntroState("glitch");

    /*
     * After 700ms:
     * reveal storefront and remember this session.
     */
    window.setTimeout(() => {
      setIntroState("storefront");

      window.sessionStorage.setItem(
        INTRO_STORAGE_KEY,
        "true"
      );
    }, 700);
  }

  /*
   * Backup event.
   */
  function handleVideoEnded() {
    finishIntro();
  }

  const showingIntro =
    introState === "intro";

  const showingGlitch =
    introState === "glitch";

  const showingStorefront =
    introState === "storefront";

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">

      {/* =====================================================
          STOREFRONT IMAGE
          ===================================================== */}

      <Image
        src="/media/mizo-deals-storefront.jpg"
        alt="MIZO DEALS storefront"
        fill
        priority
        className="object-cover"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 z-10 bg-black/25" />

      {/* =====================================================
          EARTH → MIZO DEALS CINEMATIC
          ===================================================== */}

      {showingIntro && (
        <video
          ref={videoRef}
          className="absolute inset-0 z-20 h-full w-full object-cover"
          src="/media/earth-to-store.mp4"
          autoPlay
          muted
          playsInline
          preload="auto"
          onEnded={handleVideoEnded}
        />
      )}

      {/* =====================================================
          STOREFRONT CONTENT
          ===================================================== */}

      <div
        className={`absolute inset-0 z-30 flex flex-col items-center justify-end pb-16 text-center text-white transition-opacity duration-500 ${
          showingStorefront
            ? "opacity-100"
            : "opacity-0"
        }`}
      >
        <h1 className="text-5xl font-semibold tracking-[0.2em] md:text-7xl">
          MIZO DEALS
        </h1>

        <p className="mt-4 text-sm tracking-[0.35em] text-white/80 md:text-base">
          FASHION • STYLE • IDENTITY
        </p>

       <Link
  href="/shop"
  className="mt-8 rounded-full border border-white/60 px-8 py-3 text-sm tracking-[0.2em] transition hover:bg-white hover:text-black"
>
  SHOP COLLECTION
</Link>
        <div className="mt-10 animate-bounce text-xs tracking-[0.3em] text-white/70">
          SCROLL TO EXPLORE
        </div>
      </div>

      {/* =====================================================
          CYBERPUNK TV SIGNAL INTERRUPTION
          ===================================================== */}

      {showingGlitch && (
        <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden">

          {/* Black interference */}
          <div className="absolute inset-0 bg-black/70" />

          {/* RGB RED */}
          <div
            className="absolute inset-0 bg-red-500/20 mix-blend-screen"
            style={{
              animation:
                "rgbRed 55ms steps(2) infinite",
            }}
          />

          {/* RGB CYAN */}
          <div
            className="absolute inset-0 bg-cyan-400/20 mix-blend-screen"
            style={{
              animation:
                "rgbCyan 50ms steps(2) infinite",
            }}
          />

          {/* CRT scanlines */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(255,255,255,.18) 3px, transparent 4px)",
            }}
          />

          {/* Signal tears */}
          <div
            className="absolute left-[-20%] top-[15%] h-3 w-[140%] bg-white/80"
            style={{
              animation:
                "tear 70ms steps(2) infinite",
            }}
          />

          <div
            className="absolute left-[-20%] top-[35%] h-5 w-[140%] bg-red-400/70"
            style={{
              animation:
                "tear 85ms steps(2) infinite reverse",
            }}
          />

          <div
            className="absolute left-[-20%] top-[55%] h-2 w-[140%] bg-cyan-300/80"
            style={{
              animation:
                "tear 60ms steps(2) infinite",
            }}
          />

          <div
            className="absolute left-[-20%] top-[75%] h-4 w-[140%] bg-white/70"
            style={{
              animation:
                "tear 75ms steps(2) infinite reverse",
            }}
          />

          {/* Digital blocks */}
          <div
            className="absolute left-[8%] top-[22%] h-8 w-[28%] bg-red-500/60"
            style={{
              animation:
                "blocks 90ms steps(2) infinite",
            }}
          />

          <div
            className="absolute right-[5%] top-[42%] h-10 w-[25%] bg-cyan-400/60"
            style={{
              animation:
                "blocks 80ms steps(2) infinite reverse",
            }}
          />

          <div
            className="absolute left-[25%] top-[63%] h-7 w-[20%] bg-white/40"
            style={{
              animation:
                "blocks 100ms steps(2) infinite",
            }}
          />

          <div
            className="absolute left-[55%] top-[28%] h-4 w-[18%] bg-cyan-300/50"
            style={{
              animation:
                "blocks 75ms steps(2) infinite reverse",
            }}
          />

          <div
            className="absolute left-[12%] top-[70%] h-5 w-[15%] bg-red-400/50"
            style={{
              animation:
                "blocks 65ms steps(2) infinite",
            }}
          />

          {/* TV collapse line */}
          <div
            className="absolute left-0 top-1/2 h-1 w-full bg-white"
            style={{
              boxShadow:
                "0 0 45px 18px rgba(255,255,255,.95)",
              animation:
                "collapse 700ms ease-out forwards",
            }}
          />

          {/* Final flash */}
          <div
            className="absolute inset-0 bg-white"
            style={{
              animation:
                "flash 700ms ease-out forwards",
            }}
          />
        </div>
      )}

      {/* =====================================================
          ANIMATIONS
          ===================================================== */}

      <style jsx>{`
        @keyframes rgbRed {
          0% {
            transform: translateX(0);
          }

          20% {
            transform: translateX(-25px);
          }

          40% {
            transform: translateX(18px);
          }

          60% {
            transform: translateX(-30px);
          }

          80% {
            transform: translateX(16px);
          }

          100% {
            transform: translateX(0);
          }
        }

        @keyframes rgbCyan {
          0% {
            transform: translateX(0);
          }

          20% {
            transform: translateX(25px);
          }

          40% {
            transform: translateX(-18px);
          }

          60% {
            transform: translateX(30px);
          }

          80% {
            transform: translateX(-16px);
          }

          100% {
            transform: translateX(0);
          }
        }

        @keyframes tear {
          0% {
            transform: translateX(0) skewX(0);
          }

          25% {
            transform: translateX(-18%) skewX(-12deg);
          }

          50% {
            transform: translateX(15%) skewX(10deg);
          }

          75% {
            transform: translateX(-10%) skewX(-8deg);
          }

          100% {
            transform: translateX(0);
          }
        }

        @keyframes blocks {
          0% {
            transform: translate(0, 0);
            opacity: 0.3;
          }

          25% {
            transform: translate(-35px, 15px);
            opacity: 1;
          }

          50% {
            transform: translate(40px, -15px);
            opacity: 0.5;
          }

          75% {
            transform: translate(-20px, 10px);
            opacity: 0.9;
          }

          100% {
            transform: translate(0, 0);
            opacity: 0.3;
          }
        }

        @keyframes collapse {
          0% {
            transform: scaleY(1);
            opacity: 0;
          }

          15% {
            transform: scaleY(1);
            opacity: 1;
          }

          45% {
            transform: scaleY(0.3);
            opacity: 1;
          }

          72% {
            transform: scaleY(0.025);
            opacity: 1;
          }

          100% {
            transform: scaleY(0);
            opacity: 0;
          }
        }

        @keyframes flash {
          0% {
            opacity: 0;
          }

          72% {
            opacity: 0;
          }

          81% {
            opacity: 0.9;
          }

          87% {
            opacity: 0.1;
          }

          100% {
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
}