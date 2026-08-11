"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { LUXE_EASE, drawerSlide } from "@/lib/motion";
import { formatPrice } from "@/lib/utils";
import { useBoutique } from "@/lib/store";
import { useLockScroll } from "@/components/providers/SmoothScrollProvider";
import { MagneticButton } from "@/components/ui/MagneticButton";

const SHIPPING_THRESHOLD = 25000;
const SHIPPING_FEE = 2400;

export function CartDrawer() {
  const { lines, cartOpen, setCartOpen, setQty, removeFromCart, subtotal, count } = useBoutique();
  useLockScroll(cartOpen);

  const shipping = subtotal === 0 || subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;
  const toFreeShipping = Math.max(0, SHIPPING_THRESHOLD - subtotal);

  return (
    <Dialog.Root open={cartOpen} onOpenChange={setCartOpen}>
      <AnimatePresence>
        {cartOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: LUXE_EASE }}
                className="fixed inset-0 z-[100] bg-ink/25 backdrop-blur-md"
              />
            </Dialog.Overlay>

            <Dialog.Content asChild>
              <motion.div
                variants={drawerSlide}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="fixed inset-y-0 right-0 z-[101] flex w-full max-w-[440px] flex-col border-l border-ink/10 bg-canvas/95 backdrop-blur-2xl"
              >
                <div
                  className="glow -left-20 top-16 h-[400px] w-[400px]"
                  style={{ "--glow": "rgba(201,162,39,0.14)" } as React.CSSProperties}
                />

                <div className="relative flex items-center justify-between gap-4 border-b border-ink/[0.09] px-6 py-6">
                  <Dialog.Title className="font-display text-xl text-ink">
                    Luxury Cart
                    {count > 0 && (
                      <span className="ml-2 text-[12px] font-sans tracking-[0.14em] text-ink-muted">
                        {count} {count === 1 ? "ITEM" : "ITEMS"}
                      </span>
                    )}
                  </Dialog.Title>
                  <Dialog.Close asChild>
                    <button
                      data-cursor="link"
                      aria-label="Close cart"
                      className="grid h-10 w-10 place-items-center rounded-full border border-ink/10 text-ink-soft transition-colors duration-500 hover:border-champagne/65 hover:text-champagne-deep"
                    >
                      <X className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  </Dialog.Close>
                </div>
                <Dialog.Description className="sr-only">
                  Review the products in your cart and adjust quantities.
                </Dialog.Description>

                {/* Free-shipping meter */}
                {count > 0 && (
                  <div className="relative border-b border-ink/[0.09] px-6 py-4">
                    <p className="mb-2.5 text-[11px] text-ink-muted">
                      {toFreeShipping > 0 ? (
                        <>
                          <span className="text-champagne-deep">{formatPrice(toFreeShipping)}</span> from
                          complimentary courier delivery
                        </>
                      ) : (
                        <span className="text-champagne-deep">Complimentary courier delivery unlocked</span>
                      )}
                    </p>
                    <span className="block h-[3px] w-full overflow-hidden rounded-full bg-canvas-warm">
                      <motion.span
                        initial={false}
                        animate={{ scaleX: Math.min(1, subtotal / SHIPPING_THRESHOLD) }}
                        transition={{ duration: 0.8, ease: LUXE_EASE }}
                        style={{ originX: 0 }}
                        className="block h-full bg-gradient-to-r from-champagne-deep via-champagne to-champagne"
                      />
                    </span>
                  </div>
                )}

                {/* Lines */}
                <div className="relative flex-1 overflow-y-auto px-6 py-5">
                  {count === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
                      <span className="grid h-16 w-16 place-items-center rounded-full border border-ink/10 text-ink-muted">
                        <ShoppingBag className="h-6 w-6" strokeWidth={1.2} />
                      </span>
                      <p className="max-w-[220px] text-[13px] leading-relaxed text-ink-muted">
                        Your cart is empty. Everything in the boutique is compounded in our own lab.
                      </p>
                      <MagneticButton variant="ghost" onClick={() => setCartOpen(false)}>
                        Browse the boutique
                      </MagneticButton>
                    </div>
                  ) : (
                    <ul className="flex flex-col gap-3">
                      <AnimatePresence initial={false} mode="popLayout">
                        {lines.map((line) => (
                          <motion.li
                            key={line.product.id}
                            layout
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 40, height: 0, marginBottom: -12 }}
                            transition={{ duration: 0.5, ease: LUXE_EASE }}
                            className="glass flex gap-4 rounded-2xl p-3.5"
                          >
                            {/* Bottle chip — a CSS stand-in for the 3D render */}
                            <span
                              className="grid h-[76px] w-[58px] shrink-0 place-items-center rounded-xl border border-ink/10"
                              style={{
                                background: `linear-gradient(160deg, ${line.product.glass}33, ${line.product.liquid}66 60%, #EDE4D8)`,
                              }}
                            >
                              <span
                                className="h-9 w-3.5 rounded-b-[3px] rounded-t-sm"
                                style={{ background: line.product.liquid }}
                              />
                            </span>

                            <div className="flex min-w-0 flex-1 flex-col gap-2">
                              <div className="flex items-start justify-between gap-3">
                                <span className="flex flex-col gap-0.5">
                                  <span className="truncate text-[13px] text-ink">
                                    {line.product.name}
                                  </span>
                                  <span className="text-[11px] text-ink-muted">
                                    {line.product.volume}
                                  </span>
                                </span>
                                <button
                                  onClick={() => removeFromCart(line.product.id)}
                                  data-cursor="link"
                                  aria-label={`Remove ${line.product.name}`}
                                  className="shrink-0 text-ink-muted transition-colors duration-400 hover:text-red-300"
                                >
                                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                                </button>
                              </div>

                              <div className="mt-auto flex items-center justify-between gap-3">
                                <span className="flex items-center gap-1 rounded-full border border-ink/10 p-1">
                                  <button
                                    onClick={() => setQty(line.product.id, line.qty - 1)}
                                    data-cursor="link"
                                    aria-label="Decrease quantity"
                                    className="grid h-6 w-6 place-items-center rounded-full text-ink-soft transition-colors hover:bg-canvas-warm hover:text-ink"
                                  >
                                    <Minus className="h-3 w-3" strokeWidth={2} />
                                  </button>
                                  <span className="w-5 text-center text-[12px] tabular-nums text-ink">
                                    {line.qty}
                                  </span>
                                  <button
                                    onClick={() => setQty(line.product.id, line.qty + 1)}
                                    data-cursor="link"
                                    aria-label="Increase quantity"
                                    className="grid h-6 w-6 place-items-center rounded-full text-ink-soft transition-colors hover:bg-canvas-warm hover:text-ink"
                                  >
                                    <Plus className="h-3 w-3" strokeWidth={2} />
                                  </button>
                                </span>

                                <motion.span
                                  key={line.qty}
                                  initial={{ opacity: 0.4, y: -4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.35, ease: LUXE_EASE }}
                                  className="font-display text-[15px] text-ink"
                                >
                                  {formatPrice(line.product.price * line.qty)}
                                </motion.span>
                              </div>
                            </div>
                          </motion.li>
                        ))}
                      </AnimatePresence>
                    </ul>
                  )}
                </div>

                {/* Totals */}
                {count > 0 && (
                  <div className="relative flex flex-col gap-4 border-t border-ink/[0.09] bg-canvas-warm/70 px-6 py-6">
                    <dl className="flex flex-col gap-2 text-[13px]">
                      <div className="flex justify-between text-ink-muted">
                        <dt>Subtotal</dt>
                        <dd className="tabular-nums text-ink-soft">{formatPrice(subtotal)}</dd>
                      </div>
                      <div className="flex justify-between text-ink-muted">
                        <dt>Courier</dt>
                        <dd className="tabular-nums text-ink-soft">
                          {shipping === 0 ? "Complimentary" : formatPrice(shipping)}
                        </dd>
                      </div>
                      <div className="mt-1 flex items-baseline justify-between border-t border-ink/[0.09] pt-3">
                        <dt className="text-[11px] uppercase tracking-[0.2em] text-ink-muted">
                          Total
                        </dt>
                        <motion.dd
                          key={total}
                          initial={{ opacity: 0.5, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, ease: LUXE_EASE }}
                          className="font-display text-2xl tabular-nums text-ink"
                        >
                          {formatPrice(total)}
                        </motion.dd>
                      </div>
                    </dl>

                    <MagneticButton className="w-full justify-center">
                      Proceed to checkout
                    </MagneticButton>
                    <p className="text-center text-[10px] uppercase tracking-[0.18em] text-ink-muted/80">
                      Demo storefront · no payment is taken
                    </p>
                  </div>
                )}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
