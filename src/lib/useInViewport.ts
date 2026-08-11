"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Tracks whether a node is on screen.
 *
 * WebGL canvases each drive their own render loop, and a loop that keeps
 * running while its canvas is scrolled three sections away is pure waste. This
 * is what lets those loops be parked instead.
 *
 * Tab visibility is deliberately not handled here — browsers already stop
 * firing rAF in a backgrounded tab, so there is nothing left to save.
 *
 * `rootMargin` starts the loop slightly before the canvas is actually visible
 * so it is already warm by the time it scrolls in.
 */
export function useInViewport<T extends HTMLElement>(rootMargin = "200px") {
  const ref = useRef<T>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), {
      rootMargin,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return { ref, active };
}
