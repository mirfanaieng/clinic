"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, RotateCcw } from "lucide-react";
import { PRODUCTS, type Product } from "@/lib/data";
import { LUXE_EASE, viewportOnce } from "@/lib/motion";
import { cn, formatPrice } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useBoutique } from "@/lib/store";

const Product3DViewer = dynamic(() => import("@/components/Product3DViewer"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center">
      <span className="h-16 w-16 animate-pulse-slot rounded-full bg-champagne/[0.14] blur-xl" />
    </div>
  ),
});

function ProductCard({ product, index }: { product: Product; index: number }) {
  const { addToCart } = useBoutique();
  const [hovered, setHovered] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 44 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewportOnce}
      transition={{ duration: 0.9, ease: LUXE_EASE, delay: index * 0.09 }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      data-active={hovered}
      className="glass glass-edge group relative flex flex-col overflow-hidden rounded-[26px]"
    >
      {/* Product stage */}
      <div className="relative h-[320px] overflow-hidden">
        <motion.div
          animate={{
            background: hovered
              ? `radial-gradient(circle at 50% 42%, ${product.glass}22, transparent 62%)`
              : `radial-gradient(circle at 50% 42%, ${product.glass}11, transparent 62%)`,
          }}
          transition={{ duration: 0.9, ease: LUXE_EASE }}
          className="absolute inset-0"
        />

        <Product3DViewer product={product} className="absolute inset-0" />

        {/* Drag affordance */}
        <motion.div
          animate={{ opacity: hovered ? 1 : 0.45, y: hovered ? 0 : 6 }}
          transition={{ duration: 0.5, ease: LUXE_EASE }}
          className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-ink/10 bg-white/[0.88] px-3.5 py-1.5"
        >
          <RotateCcw className="h-3 w-3 text-champagne-deep" strokeWidth={1.5} />
          <span className="text-[10px] uppercase tracking-[0.18em] text-ink-soft">
            Drag to rotate
          </span>
        </motion.div>
      </div>

      {/* Meta */}
      <div className="flex flex-1 flex-col gap-4 border-t border-ink/[0.09] p-6">
        <div className="flex flex-col gap-1.5">
          <h3 className="font-display text-[21px] leading-tight text-ink">{product.name}</h3>
          <p className="text-[12px] text-ink-muted">{product.subtitle}</p>
        </div>

        <ul className="flex flex-wrap gap-1.5">
          {product.notes.map((note) => (
            <li
              key={note}
              className="rounded-full border border-ink/[0.09] px-2.5 py-1 text-[10px] tracking-[0.04em] text-ink-muted"
            >
              {note}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex items-end justify-between gap-4 pt-2">
          <span className="flex flex-col leading-tight">
            <span className="font-display text-xl text-ink">{formatPrice(product.price)}</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-ink-muted">
              {product.volume}
            </span>
          </span>

          <button
            onClick={() => addToCart(product.id)}
            data-cursor="link"
            className={cn(
              "inline-flex items-center gap-2 rounded-full border border-ink/[0.12] px-4 py-2.5 text-[12px] text-ink",
              "transition-all duration-500 ease-luxe hover:border-champagne hover:bg-ink hover:text-canvas",
            )}
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.8} />
            Add to cart
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export function Boutique() {
  return (
    <section id="boutique" className="relative py-32 lg:py-44">
      <div
        className="glow right-0 top-1/4 h-[600px] w-[600px]"
        style={{ "--glow": "rgba(245,228,226,0.62)" } as React.CSSProperties}
      />

      <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionHeading
          eyebrow="The Boutique"
          title="Formulated in-clinic,"
          accent="dispensed by protocol"
          description="Every formulation is compounded for our own patients first. Rotate any bottle to inspect it — the glass, liquid and cap are rendered live in WebGL, not photographed."
        />

        <div className="mt-16 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {PRODUCTS.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
