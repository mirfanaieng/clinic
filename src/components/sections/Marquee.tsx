"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { LUXE_EASE, viewportOnce } from "@/lib/motion";

const STATS = [
  { value: "17", label: "Years in practice" },
  { value: "24k", label: "Protocols delivered" },
  { value: "9", label: "Board-certified physicians" },
  { value: "4", label: "Outcome studies published" },
];

const CREDENTIALS = [
  "Swiss Medical Association",
  "ISO 13485 Certified Lab",
  "VISIA Multispectral Imaging",
  "Board-Certified Dermatology",
  "Epigenetic Age Panelling",
  "GMP Compounding Suite",
];

/**
 * Credential band between the hero and the treatment map. Scroll position
 * drives the horizontal offset, so the strip reads as part of the page motion
 * rather than a detached loop.
 */
export function Marquee() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const x = useTransform(scrollYProgress, [0, 1], ["2%", "-22%"]);

  return (
    <div ref={ref} className="relative border-y border-ink/[0.08] bg-canvas-warm/50">
      {/* Registry figures, lifted out of the hero so the fold stays uncluttered. */}
      <motion.dl
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="mx-auto grid max-w-[1400px] grid-cols-2 gap-y-10 px-6 py-14 lg:grid-cols-4 lg:px-10"
      >
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            variants={{
              hidden: { opacity: 0, y: 22 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: LUXE_EASE, delay: i * 0.09 } },
            }}
            className="flex flex-col gap-2 border-l border-ink/[0.09] pl-5"
          >
            <dt className="font-display text-4xl text-ink">{stat.value}</dt>
            <dd className="max-w-[16ch] text-[11px] uppercase leading-relaxed tracking-[0.2em] text-ink-muted">
              {stat.label}
            </dd>
          </motion.div>
        ))}
      </motion.dl>

      <div className="relative overflow-hidden border-t border-ink/[0.08] py-6">
      <motion.div style={{ x }} className="flex w-max items-center gap-14 whitespace-nowrap">
        {/* Doubled so the band still fills the viewport at either scroll extreme. */}
        {[...CREDENTIALS, ...CREDENTIALS].map((item, i) => (
          <span key={`${item}-${i}`} className="flex items-center gap-14">
            <span className="text-[11px] uppercase tracking-[0.28em] text-ink-muted">
              {item}
            </span>
            <span className="h-1 w-1 rounded-full bg-champagne" />
          </span>
        ))}
      </motion.div>

        {/* Edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-canvas-warm to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-canvas-warm to-transparent" />
      </div>
    </div>
  );
}
