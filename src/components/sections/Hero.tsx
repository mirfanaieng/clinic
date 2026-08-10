"use client";

import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowUpRight, CalendarCheck, Sparkles } from "lucide-react";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { LUXE_EASE, fadeUp, staggerParent, wordReveal } from "@/lib/motion";
import { useBoutique } from "@/lib/store";
import { useLenis } from "@/components/providers/SmoothScrollProvider";

// WebGL has no server render — keep it out of the SSR pass entirely.
const HeroCanvas = dynamic(() => import("@/components/HeroCanvas"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-canvas" />,
});

const HEADLINE = ["Redefining", "Clinical", "Elegance"];
const ACCENT = ["&", "Cellular", "Longevity"];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { openBooking } = useBoutique();
  const lenis = useLenis();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Content drifts up and dissolves faster than the canvas behind it.
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const canvasScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);

  return (
    <section
      ref={ref}
      className="grain relative flex min-h-[100svh] flex-col justify-center overflow-hidden"
    >
      <motion.div style={{ scale: canvasScale }} className="absolute inset-0">
        <HeroCanvas className="!absolute inset-0" />
      </motion.div>

      {/* Legibility scrim. The type sits left of centre, so the mask is biased
          that way rather than being a symmetrical vignette. */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(100deg,rgba(251,248,244,0.96)_0%,rgba(251,248,244,0.9)_38%,rgba(251,248,244,0.62)_68%,rgba(251,248,244,0.18)_88%,transparent_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(140%_100%_at_50%_0%,rgba(251,248,244,0.6)_0%,transparent_45%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-canvas via-canvas/85 to-transparent" />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 mx-auto w-full max-w-[1400px] px-6 pt-24 lg:px-10"
      >
        <motion.div variants={staggerParent(0.06, 0.5)} initial="hidden" animate="visible">
          <motion.div variants={fadeUp} className="mb-8 flex items-center gap-4">
            <span className="h-px w-10 bg-gradient-to-r from-champagne-deep/80 to-transparent" />
            <span className="eyebrow">Zurich · Dubai · Singapore</span>
          </motion.div>

          {/* Each line is its own block so the break is deliberate rather than
              left to wrapping, which shifts with the viewport. */}
          <h1 className="font-display text-display-xl text-ink">
            <span className="block">
              {HEADLINE.map((word, i) => (
                <span key={word} className="mask-line">
                  <motion.span
                    variants={wordReveal}
                    custom={i}
                    className="inline-block pr-[0.22em]"
                  >
                    {word}
                  </motion.span>
                </span>
              ))}
            </span>
            <span className="block">
              {ACCENT.map((word) => (
                <span key={word} className="mask-line">
                  <motion.span
                    variants={wordReveal}
                    className="text-gradient-gold inline-block pr-[0.22em] italic"
                  >
                    {word}
                  </motion.span>
                </span>
              ))}
            </span>
          </h1>

          <motion.p
            variants={fadeUp}
            className="mt-8 max-w-lg text-[15px] leading-relaxed text-ink-muted"
          >
            A physician-led institute where diagnostic imaging, regenerative medicine and
            an obsession with restraint converge. We read your biology before we
            recommend a single thing.
          </motion.p>

          {/* Floating glass action bar */}
          <motion.div
            variants={fadeUp}
            className="glass glass-edge mt-9 inline-flex flex-col gap-4 rounded-[28px] p-3 sm:flex-row sm:items-center sm:rounded-full sm:pr-6"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <MagneticButton
                onClick={() => openBooking()}
                icon={<ArrowUpRight className="h-4 w-4" strokeWidth={1.6} />}
                data-cursor-label="Book"
              >
                Book Consultation
              </MagneticButton>

              <MagneticButton
                variant="ghost"
                onClick={() => {
                  const el = document.querySelector("#treatments");
                  if (el && lenis) lenis.scrollTo(el as HTMLElement, { offset: -80, duration: 1.8 });
                  else el?.scrollIntoView({ behavior: "smooth" });
                }}
                icon={<Sparkles className="h-4 w-4" strokeWidth={1.6} />}
              >
                Explore Treatments
              </MagneticButton>
            </div>

            {/* Real-time slot indicator */}
            <div className="flex items-center gap-2.5 rounded-full border border-champagne/45 bg-champagne/16 px-4 py-2.5 sm:ml-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-pulse-slot rounded-full bg-champagne" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-champagne" />
              </span>
              <span className="whitespace-nowrap text-[11px] tracking-[0.06em] text-champagne-deep">
                3 consultation slots left this week
              </span>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1, ease: LUXE_EASE }}
        style={{ opacity: contentOpacity }}
        className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 min-[1100px]:flex"
      >
        <span className="text-[9px] uppercase tracking-[0.32em] text-ink-muted">Scroll</span>
        <span className="relative h-12 w-px overflow-hidden bg-white/10">
          <motion.span
            animate={{ y: ["-100%", "100%"] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-x-0 h-1/2 bg-gradient-to-b from-transparent via-champagne-deep to-transparent"
          />
        </span>
      </motion.div>

      {/* Next-availability pill, bottom right */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.8, duration: 1, ease: LUXE_EASE }}
        style={{ opacity: contentOpacity }}
        className="glass glass-edge absolute bottom-8 right-6 z-10 hidden items-center gap-3 rounded-full py-2.5 pl-3 pr-5 lg:right-10 lg:flex"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-champagne/16 text-champagne-deep">
          <CalendarCheck className="h-3.5 w-3.5" strokeWidth={1.5} />
        </span>
        <span className="flex flex-col leading-tight">
          <span className="text-[9px] uppercase tracking-[0.24em] text-ink-muted">
            Next availability
          </span>
          <span className="text-[12px] text-ink">Thursday · 14:30 CET</span>
        </span>
      </motion.div>
    </section>
  );
}
