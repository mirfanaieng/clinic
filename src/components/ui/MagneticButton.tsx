"use client";

import { useRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

type Variant = "gold" | "ghost" | "champagne";

/**
 * On ivory the primary action carries weight through darkness, not colour —
 * a champagne fill can't hold ivory text at an accessible contrast.
 */
const VARIANTS: Record<Variant, string> = {
  gold: "bg-ink text-canvas shadow-lift hover:bg-champagne-deep",
  ghost:
    "border border-ink/12 bg-white/75 text-ink backdrop-blur-xl hover:border-champagne/70 hover:bg-white",
  champagne: "bg-champagne text-ink hover:bg-champagne-light",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  icon?: ReactNode;
  /** How far the button chases the pointer, in px. */
  pull?: number;
};

/**
 * Button that physically leans toward the cursor while hovered, with the label
 * travelling slightly further than the shell for a parallax feel.
 */
export function MagneticButton({
  children,
  className,
  variant = "gold",
  icon,
  pull = 14,
  ...props
}: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const spring = { stiffness: 260, damping: 18, mass: 0.5 };
  const x = useSpring(mx, spring);
  const y = useSpring(my, spring);

  // Inner content overshoots the shell by 45% for depth.
  const labelX = useTransform(x, (v) => v * 0.45);
  const labelY = useTransform(y, (v) => v * 0.45);

  const handleMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    mx.set(Math.max(-1, Math.min(1, dx)) * pull);
    my.set(Math.max(-1, Math.min(1, dy)) * pull);
  };

  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.button
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      style={{ x, y }}
      whileTap={{ scale: 0.96 }}
      data-cursor="link"
      className={cn(
        "group relative isolate inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full px-7 py-3.5",
        "text-[13px] font-medium tracking-[0.02em] transition-colors duration-500 ease-luxe",
        VARIANTS[variant],
        className,
      )}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {/* Sheen wipe on hover */}
      <span className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-full">
        <span className="absolute inset-y-0 -left-full w-1/2 skew-x-[-20deg] bg-white/60 opacity-0 transition-opacity duration-300 group-hover:animate-shimmer group-hover:opacity-100" />
      </span>

      <motion.span style={{ x: labelX, y: labelY }} className="flex items-center gap-2.5">
        {children}
        {icon}
      </motion.span>
    </motion.button>
  );
}
