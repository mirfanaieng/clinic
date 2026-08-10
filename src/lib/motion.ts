import type { Transition, Variants } from "framer-motion";

/** House easing — long tail, no overshoot. Used for every reveal. */
export const LUXE_EASE = [0.22, 1, 0.36, 1] as const;
export const SILK_EASE = [0.65, 0, 0.35, 1] as const;

export const luxe = (duration = 0.9, delay = 0): Transition => ({
  duration,
  delay,
  ease: LUXE_EASE,
});

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: luxe(1),
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: luxe(1.2) },
};

export const staggerParent = (stagger = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

/** Per-word mask reveal: the word slides out from under a clipping parent. */
export const wordReveal: Variants = {
  hidden: { y: "115%", opacity: 0, rotate: 2 },
  visible: {
    y: "0%",
    opacity: 1,
    rotate: 0,
    transition: { duration: 1.1, ease: LUXE_EASE },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: luxe(0.8) },
};

export const drawerSlide: Variants = {
  hidden: { x: "100%" },
  visible: { x: 0, transition: { duration: 0.7, ease: LUXE_EASE } },
  exit: { x: "100%", transition: { duration: 0.45, ease: SILK_EASE } },
};

/** Step transitions inside the booking flow — direction-aware. */
export const stepVariants: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 48 : -48, filter: "blur(8px)" }),
  center: { opacity: 1, x: 0, filter: "blur(0px)", transition: luxe(0.6) },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? -48 : 48,
    filter: "blur(8px)",
    transition: { duration: 0.35, ease: SILK_EASE },
  }),
};

export const viewportOnce = { once: true, amount: 0.25 } as const;
