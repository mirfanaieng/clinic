"use client";

import { useEffect, useRef, useState } from "react";

/** Values accepted in `data-cursor` around the page. */
type Mode = "default" | "link" | "view" | "drag" | "text";

const MODES: ReadonlySet<string> = new Set(["default", "link", "view", "drag", "text"]);

/**
 * Two-part cursor: a dot that is always exactly under the pointer, and a ring
 * that trails it.
 *
 * The dot is the contract — it marks precisely where a click will land, it is
 * written synchronously on every move, and it is never displaced or hidden
 * (except over text, where the real caret takes over). The ring is decoration:
 * it lags on a lerp and reacts to what is underneath.
 *
 * Everything runs on refs, direct transform writes and CSS transitions, so
 * moving the mouse costs zero React renders and the cursor does not depend on
 * an animation library being alive to be visible.
 */
export function Cursor() {
  const [enabled, setEnabled] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(fine && !reduced);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const root = rootRef.current;
    const ring = ringRef.current;
    const dot = dotRef.current;
    const label = labelRef.current;
    if (!root || !ring || !dot || !label) return;

    // Pointer truth, and the ring's lagging copy of it.
    let px = 0;
    let py = 0;
    let rx = 0;
    let ry = 0;
    let tracking = false;
    let raf = 0;

    const loop = () => {
      rx += (px - rx) * 0.19;
      ry += (py - ry) * 0.19;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;

      // Written straight to the node — the dot must never lag behind the real
      // pointer, so it does not wait on the rAF loop.
      dot.style.transform = `translate3d(${px}px, ${py}px, 0)`;

      if (!tracking) {
        tracking = true;
        // Start the ring where the pointer already is, so it does not fly in
        // from the top-left corner on the first move.
        rx = px;
        ry = py;
        ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;

        /* The system cursor is hidden only now, once tracking is proven to
           work. If anything above had failed, the page would still have a
           usable native cursor rather than none at all. */
        document.documentElement.classList.add("has-custom-cursor");
        raf = requestAnimationFrame(loop);
      }

      // Any movement reveals the cursor. Relying on `pointerenter` here is a
      // trap: it does not fire when the pointer is already over the page as
      // the listener attaches, which is the normal case on a fresh load.
      if (root.dataset.visible !== "true") root.dataset.visible = "true";
    };

    // Fires once per hovered-element change rather than once per move event.
    const onOver = (e: PointerEvent) => {
      const el = e.target as HTMLElement | null;

      // Text fields keep the real caret — see the `cursor: text` exception in
      // globals.css — so the custom cursor steps aside entirely.
      if (el?.closest("input, textarea, select, [contenteditable='true']")) {
        root.dataset.mode = "text";
        root.dataset.hasLabel = "false";
        label.textContent = "";
        return;
      }

      const target = el?.closest<HTMLElement>("[data-cursor]") ?? null;
      const raw = target?.dataset.cursor;
      const mode: Mode = raw && MODES.has(raw) ? (raw as Mode) : target ? "link" : "default";

      root.dataset.mode = mode;

      const text = target?.dataset.cursorLabel ?? "";
      if (label.textContent !== text) label.textContent = text;
      root.dataset.hasLabel = text ? "true" : "false";
    };

    const onDown = () => (root.dataset.pressed = "true");
    const onUp = () => (root.dataset.pressed = "false");
    const hide = () => (root.dataset.visible = "false");

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("pointerleave", hide);
    window.addEventListener("blur", hide);

    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", hide);
      window.removeEventListener("blur", hide);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="cursor-root"
      data-visible="false"
      data-mode="default"
      data-pressed="false"
      data-has-label="false"
    >
      <div ref={ringRef} className="cursor-layer">
        <span className="cursor-ring" />
        <span ref={labelRef} className="cursor-label" />
      </div>

      <div ref={dotRef} className="cursor-layer">
        <span className="cursor-dot" />
      </div>
    </div>
  );
}
