"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { LUXE_EASE, fadeUp, staggerParent, viewportOnce, wordReveal } from "@/lib/motion";
import { useBoutique } from "@/lib/store";
import { MagneticButton } from "@/components/ui/MagneticButton";

const COLUMNS = [
  {
    title: "Institute",
    links: ["Our physicians", "Diagnostics", "Longevity programme", "Editorial"],
  },
  {
    title: "Protocols",
    links: ["Skin rejuvenation", "Body sculpting", "Hair restoration", "Anti-aging"],
  },
  {
    title: "Clinics",
    links: ["Zurich · Bahnhofstrasse", "Dubai · DIFC", "Singapore · Orchard"],
  },
];

export function Footer() {
  const { openBooking } = useBoutique();

  return (
    <footer className="relative overflow-hidden border-t border-ink/[0.09] pt-28">
      <div
        className="glow -bottom-40 left-1/2 h-[640px] w-[1040px] -translate-x-1/2"
        style={{ "--glow": "rgba(201,162,39,0.14)" } as React.CSSProperties}
      />

      <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10">
        {/* Closing call */}
        <motion.div
          variants={staggerParent(0.06)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="flex flex-col items-start gap-10 pb-24 lg:flex-row lg:items-end lg:justify-between"
        >
          <h2 className="max-w-2xl font-display text-display-lg text-ink">
            {"Begin with a".split(" ").map((w) => (
              <span key={w} className="mask-line">
                <motion.span variants={wordReveal} className="inline-block pr-[0.24em]">
                  {w}
                </motion.span>
              </span>
            ))}
            <span className="mask-line">
              <motion.span variants={wordReveal} className="text-gradient-gold inline-block italic">
                conversation
              </motion.span>
            </span>
          </h2>

          <motion.div variants={fadeUp} className="flex flex-col gap-5">
            <p className="max-w-sm text-[14px] leading-relaxed text-ink-muted">
              Ninety minutes with a physician, full diagnostic imaging, and an honest
              answer about whether we can help.
            </p>
            <MagneticButton
              onClick={() => openBooking()}
              icon={<ArrowUpRight className="h-4 w-4" strokeWidth={1.6} />}
            >
              Book your consultation
            </MagneticButton>
          </motion.div>
        </motion.div>

        {/* Link grid */}
        <div className="grid gap-12 border-t border-ink/[0.09] py-16 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-5">
            <span className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full border border-champagne/55">
                <span className="font-display text-[15px] italic text-champagne-deep">V</span>
              </span>
              <span className="font-display text-[17px] tracking-wide text-ink">VESSANTE</span>
            </span>
            <p className="max-w-[240px] text-[12px] leading-relaxed text-ink-muted">
              Physician-led aesthetic and longevity medicine. Registered with the Swiss
              Medical Association.
            </p>
          </div>

          {COLUMNS.map((col, i) => (
            <motion.div
              key={col.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewportOnce}
              transition={{ duration: 0.7, ease: LUXE_EASE, delay: i * 0.08 }}
              className="flex flex-col gap-4"
            >
              <span className="eyebrow">{col.title}</span>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <button
                      data-cursor="link"
                      data-cursor-magnet="0.35"
                      className="group relative text-[13px] text-ink-soft transition-colors duration-500 hover:text-ink"
                    >
                      {link}
                      <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-champagne/60 transition-all duration-500 ease-luxe group-hover:w-full" />
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-t border-ink/[0.09] py-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-ink-muted/85">
            © {new Date().getFullYear()} Vessante Aesthetic Institute · Concept demo, not a
            real clinic
          </p>
          <div className="flex gap-6">
            {["Privacy", "Medical disclaimer", "Imprint"].map((item) => (
              <button
                key={item}
                data-cursor="link"
                className="text-[11px] text-ink-muted/85 transition-colors duration-500 hover:text-champagne-deep"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Oversized wordmark bleeding off the bottom edge */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 1.4, ease: LUXE_EASE }}
        aria-hidden
        className="pointer-events-none select-none px-6 lg:px-10"
      >
        <span className="block translate-y-[18%] bg-gradient-to-b from-ink/[0.09] to-transparent bg-clip-text text-center font-display text-[clamp(3.5rem,17vw,15rem)] leading-none text-transparent">
          VESSANTE
        </span>
      </motion.div>
    </footer>
  );
}
