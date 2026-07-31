"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Gavel, Play, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Counter } from "@/components/motion/counter";
import { useReducedMotion } from "@/components/motion/motion-provider";
import { formatPKRShort } from "@/lib/format";
import type { PlatformStats } from "@/types";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const HEADLINE = ["Every car verified.", "Every price in the open."];

export function Hero({ stats }: { stats: PlatformStats }) {
  const root = React.useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  React.useEffect(() => {
    if (reduced || !root.current) return;

    // gsap.context scopes every selector to this subtree and gives us a single
    // revert() that kills the tweens *and* their ScrollTriggers on unmount.
    const ctx = gsap.context(() => {
      gsap.to("[data-hero-orb='1']", {
        yPercent: 26,
        xPercent: 8,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.8,
        },
      });

      gsap.to("[data-hero-orb='2']", {
        yPercent: -18,
        xPercent: -10,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.1,
        },
      });

      gsap.to("[data-hero-grid]", {
        yPercent: 12,
        opacity: 0.25,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
        },
      });

      gsap.to("[data-hero-content]", {
        y: -60,
        opacity: 0.35,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "center top",
          end: "bottom top",
          scrub: 0.5,
        },
      });
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={root}
      className="relative isolate overflow-hidden pb-24 pt-20 md:pb-32 md:pt-28"
    >
      {/* ambience */}
      <div
        data-hero-grid
        className="bg-grid bg-grid-fade pointer-events-none absolute inset-0 -z-10"
        aria-hidden
      />
      <div
        data-hero-orb="1"
        className="pointer-events-none absolute -left-40 -top-40 -z-10 size-[36rem] rounded-full bg-brand-500/16 blur-[130px] motion-safe:animate-drift"
        aria-hidden
      />
      <div
        data-hero-orb="2"
        className="pointer-events-none absolute -right-32 top-32 -z-10 size-[30rem] rounded-full bg-gold/8 blur-[130px]"
        aria-hidden
      />

      <div className="container-page" data-hero-content>
        <div className="mx-auto max-w-4xl text-center">
          {/* eyebrow */}
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 py-1.5 pl-2 pr-3.5 backdrop-blur-sm"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/15 px-2 py-0.5 text-[11px] font-semibold text-brand-300">
              <span className="live-dot" aria-hidden />
              {stats.liveAuctions.toLocaleString("en-PK")} live
            </span>
            <span className="text-[12.5px] text-muted">
              auctions running right now
            </span>
          </motion.div>

          {/* headline — masked line reveal */}
          <h1 className="mt-7 text-balance font-bold tracking-[-0.04em] text-ivory">
            {HEADLINE.map((line, i) => (
              <span key={line} className="block overflow-hidden">
                <motion.span
                  className="block text-[clamp(2.5rem,7.5vw,5rem)] leading-[1.02]"
                  initial={reduced ? false : { y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{
                    duration: 0.85,
                    delay: 0.1 + i * 0.1,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {i === 1 ? (
                    <span className="text-gradient-brand">{line}</span>
                  ) : (
                    line
                  )}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-6 max-w-2xl text-pretty text-[17px] leading-relaxed text-muted md:text-lg"
          >
            Pakistan&rsquo;s first inspection-backed car auction. Bid on lots
            with a 200+ point report attached, sell by auction or classified,
            and book a doorstep inspection in six cities.
          </motion.p>

          {/* actions */}
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.52, ease: [0.16, 1, 0.3, 1] }}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link href="/auctions">
                <Gavel />
                Browse live auctions
                <ArrowRight />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="w-full sm:w-auto"
            >
              <Link href="/sell/new">
                <Sparkles />
                Sell your car
              </Link>
            </Button>
          </motion.div>

          <motion.p
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.68 }}
            className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] text-muted-2"
          >
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-brand-500" aria-hidden />
              200+ point inspection
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Gavel className="size-4 text-brand-500" aria-hidden />
              Proxy bidding &amp; soft close
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Play className="size-4 text-brand-500" aria-hidden />
              Report in 45 minutes
            </span>
          </motion.p>
        </div>

        {/* stat strip */}
        <motion.dl
          initial={reduced ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="edge-light mx-auto mt-16 grid max-w-5xl grid-cols-2 divide-line rounded-xl border border-line bg-surface/60 backdrop-blur-sm md:grid-cols-4 md:divide-x"
        >
          {[
            {
              label: "Cars sold",
              value: stats.carsSold,
              format: (n: number) => Math.round(n).toLocaleString("en-PK"),
              suffix: "+",
            },
            {
              label: "Inspections done",
              value: stats.inspectionsCompleted,
              format: (n: number) => Math.round(n).toLocaleString("en-PK"),
              suffix: "+",
            },
            {
              label: "Registered bidders",
              value: stats.registeredBidders,
              format: (n: number) => Math.round(n).toLocaleString("en-PK"),
              suffix: "+",
            },
            {
              label: "GMV this month",
              value: stats.gmvThisMonth,
              format: (n: number) => formatPKRShort(n, false),
              suffix: "",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="border-b border-line px-5 py-6 text-center md:border-b-0"
            >
              <dd className="font-mono text-2xl font-semibold tracking-tight text-ivory tnum md:text-3xl">
                <Counter
                  value={stat.value}
                  format={stat.format}
                  suffix={stat.suffix}
                />
              </dd>
              <dt className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
                {stat.label}
              </dt>
            </div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}
