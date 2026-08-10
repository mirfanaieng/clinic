"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeUp, staggerParent, viewportOnce, wordReveal } from "@/lib/motion";

type Props = {
  eyebrow: string;
  title: string;
  /** Words rendered in italic serif with the gold gradient. */
  accent?: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  accent,
  description,
  align = "left",
  className,
}: Props) {
  const words = title.split(" ");

  return (
    <motion.div
      variants={staggerParent(0.055)}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      className={cn(
        "flex max-w-3xl flex-col gap-6",
        align === "center" && "mx-auto items-center text-center",
        className,
      )}
    >
      <motion.div variants={fadeUp} className="flex items-center gap-4">
        <span className="h-px w-10 bg-gradient-to-r from-champagne-deep/80 to-transparent" />
        <span className="eyebrow">{eyebrow}</span>
      </motion.div>

      <h2 className="font-display text-display-md text-ink">
        {words.map((word, i) => (
          <span key={`${word}-${i}`} className="mask-line">
            <motion.span variants={wordReveal} className="inline-block pr-[0.26em]">
              {word}
            </motion.span>
          </span>
        ))}
        {accent && (
          <span className="mask-line">
            <motion.span
              variants={wordReveal}
              className="text-gradient-gold inline-block font-display italic"
            >
              {accent}
            </motion.span>
          </span>
        )}
      </h2>

      {description && (
        <motion.p
          variants={fadeUp}
          className="max-w-xl text-[15px] leading-relaxed text-ink-muted"
        >
          {description}
        </motion.p>
      )}
    </motion.div>
  );
}
