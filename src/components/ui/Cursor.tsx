"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { LUXE_EASE } from "@/lib/motion";

type CursorMode = "default" | "link" | "view" | "drag" | "text";

const MODE_STYLE: Record<CursorMode, { size: number; border: string; bg: string; dot: number }> = {
  default: { size: 34, border: "rgba(138,109,20,0.6)", bg: "rgba(201,162,39,0.08)", dot: 4 },
  link: { size: 62, border: "rgba(31,26,23,0.35)", bg: "rgba(31,26,23,0.05)", dot: 0 },
  view: { size: 96, border: "rgba(138,109,20,0.75)", bg: "rgba(201,162,39,0.14)", dot: 0 },
  drag: { size: 84, border: "rgba(138,109,20,0.7)", bg: "rgba(255,255,255,0.55)", dot: 0 },
  text: { size: 16, border: "rgba(31,26,23,0.85)", bg: "rgba(31,26,23,0.85)", dot: 0 },
};

/**
 * Magnetic cursor. The ring lags the pointer on a spring; when the pointer is
 * over an element carrying `data-cursor`, the ring grows, adopts that mode's
 * styling, and is pulled toward the element's centre (the magnet effect).
 */
export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<CursorMode>("default");
  const [label, setLabel] = useState<string | null>(null);
  const [pressed, setPressed] = useState(false);
  const [visible, setVisible] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const ringX = useSpring(x, { stiffness: 380, damping: 34, mass: 0.7 });
  const ringY = useSpring(y, { stiffness: 380, damping: 34, mass: 0.7 });
  const dotX = useSpring(x, { stiffness: 1100, damping: 50, mass: 0.35 });
  const dotY = useSpring(y, { stiffness: 1100, damping: 50, mass: 0.35 });

  const style = MODE_STYLE[mode];

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const active = fine.matches && !reduced.matches;
    setEnabled(active);
    if (!active) return;

    document.documentElement.classList.add("has-custom-cursor");

    const onMove = (e: PointerEvent) => {
      setVisible(true);

      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-cursor]");

      if (target) {
        const nextMode = (target.dataset.cursor as CursorMode) || "link";
        setMode(nextMode);
        setLabel(target.dataset.cursorLabel ?? null);

        // Magnetic pull: bias the ring toward the element's centre, scaled by
        // how far into the element the pointer already is.
        const rect = target.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const strength = Number(target.dataset.cursorMagnet ?? 0.28);
        x.set(e.clientX + (cx - e.clientX) * strength);
        y.set(e.clientY + (cy - e.clientY) * strength);
      } else {
        setMode("default");
        setLabel(null);
        x.set(e.clientX);
        y.set(e.clientY);
      }
    };

    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);
    const onLeave = () => setVisible(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("pointerleave", onLeave);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[9999]">
      {/* Ring — outer node carries position, inner node self-centres so the
          size can animate without the offset jumping. */}
      <motion.div className="absolute left-0 top-0" style={{ x: ringX, y: ringY }}>
        <motion.div
          className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border backdrop-blur-[2px]"
          animate={{
            width: style.size,
            height: style.size,
            borderColor: style.border,
            backgroundColor: style.bg,
            scale: pressed ? 0.82 : 1,
            opacity: visible ? 1 : 0,
          }}
          transition={{ duration: 0.45, ease: LUXE_EASE }}
        >
          <AnimatePresence>
            {label && (
              <motion.span
                key={label}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.3, ease: LUXE_EASE }}
                className="whitespace-nowrap px-2 text-[9px] font-medium uppercase tracking-[0.24em] text-ink"
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Precision dot — hidden whenever the ring is doing the talking. */}
      <motion.div
        className="absolute left-0 top-0 rounded-full bg-champagne-deep"
        style={{ x: dotX, y: dotY, translateX: "-50%", translateY: "-50%" }}
        animate={{
          width: style.dot,
          height: style.dot,
          opacity: visible && style.dot > 0 ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: LUXE_EASE }}
      />
    </div>
  );
}
