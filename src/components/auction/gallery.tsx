"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { useReducedMotion } from "@/components/motion/motion-provider";
import { cn } from "@/lib/utils";
import type { ListingImage } from "@/types";

export function Gallery({ images, title }: { images: ListingImage[]; title: string }) {
  const [index, setIndex] = React.useState(0);
  const [lightbox, setLightbox] = React.useState(false);
  const reduced = useReducedMotion();

  const count = images.length;
  const go = React.useCallback(
    (delta: number) => setIndex((i) => (i + delta + count) % count),
    [count],
  );

  React.useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, go]);

  if (!count) return null;
  const active = images[index]!;

  return (
    <>
      <div className="space-y-3">
        {/* main frame */}
        <div className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-line bg-ink-2 md:aspect-[16/10]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active.id}
              className="absolute inset-0"
              initial={reduced ? false : { opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduced ? undefined : { opacity: 0 }}
              transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image
                src={active.url}
                alt={active.alt}
                fill
                priority={index === 0}
                sizes="(max-width: 1024px) 100vw, 62vw"
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>

          {/* controls */}
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous photo"
            className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-line bg-ink/70 text-ivory opacity-0 backdrop-blur-sm transition-opacity hover:bg-ink focus-visible:opacity-100 group-hover:opacity-100"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next photo"
            className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-line bg-ink/70 text-ivory opacity-0 backdrop-blur-sm transition-opacity hover:bg-ink focus-visible:opacity-100 group-hover:opacity-100"
          >
            <ChevronRight className="size-5" />
          </button>

          <button
            type="button"
            onClick={() => setLightbox(true)}
            aria-label="Open full screen"
            className="absolute right-3 top-3 grid size-9 place-items-center rounded-md border border-line bg-ink/70 text-ivory backdrop-blur-sm transition-colors hover:bg-ink"
          >
            <Expand className="size-4" />
          </button>

          <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-2">
            {active.angle && (
              <span className="rounded-full border border-line bg-ink/70 px-2.5 py-1 text-[11.5px] text-ivory backdrop-blur-sm">
                {active.angle}
              </span>
            )}
            <span className="rounded-full border border-line bg-ink/70 px-2.5 py-1 font-mono text-[11.5px] text-muted backdrop-blur-sm tnum">
              {index + 1} / {count}
            </span>
          </div>
        </div>

        {/* thumbnails */}
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`View photo ${i + 1}: ${img.angle ?? ""}`}
              aria-current={i === index}
              className={cn(
                "relative h-16 w-24 shrink-0 overflow-hidden rounded-md border-2 transition-all duration-200",
                i === index
                  ? "border-brand-500 opacity-100"
                  : "border-transparent opacity-55 hover:opacity-90",
              )}
            >
              <Image
                src={img.url}
                alt=""
                fill
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-[80] flex flex-col bg-ink/97 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-label={`${title} — photo gallery`}
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <p className="truncate text-sm text-muted">
                {title}
                {active.angle && (
                  <span className="ml-2 text-muted-2">· {active.angle}</span>
                )}
              </p>
              <div className="flex items-center gap-4">
                <span className="font-mono text-sm text-muted tnum">
                  {index + 1} / {count}
                </span>
                <button
                  type="button"
                  onClick={() => setLightbox(false)}
                  aria-label="Close gallery"
                  className="grid size-9 place-items-center rounded-md border border-line text-muted transition-colors hover:bg-surface hover:text-ivory"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            <div className="relative flex-1">
              <Image
                src={active.url}
                alt={active.alt}
                fill
                sizes="100vw"
                className="object-contain"
              />
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous photo"
                className="absolute left-4 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full border border-line bg-surface/80 text-ivory transition-colors hover:bg-surface-2"
              >
                <ChevronLeft className="size-6" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next photo"
                className="absolute right-4 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full border border-line bg-surface/80 text-ivory transition-colors hover:bg-surface-2"
              >
                <ChevronRight className="size-6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
