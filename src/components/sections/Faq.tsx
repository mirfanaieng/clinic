"use client";

import { useMemo, useState } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Search } from "lucide-react";
import { FAQS } from "@/lib/data";
import { LUXE_EASE, viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/SectionHeading";

/** Wraps every match of `query` in the answer/question text with a mark. */
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;

  const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.trim().toLowerCase() ? (
          <mark key={i} className="rounded bg-champagne/25 px-0.5 text-champagne-deep">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export function Faq() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string>("faq-0");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQS.map((f, i) => ({ ...f, key: `faq-${i}` }));
    return FAQS.map((f, i) => ({ ...f, key: `faq-${i}` })).filter(
      (f) =>
        f.q.toLowerCase().includes(q) ||
        f.a.toLowerCase().includes(q) ||
        f.tag.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <section id="faq" className="relative py-32 lg:py-44">
      <div
        className="glow bottom-0 left-1/3 h-[520px] w-[520px]"
        style={{ "--glow": "rgba(201,162,39,0.13)" } as React.CSSProperties}
      />

      <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div className="flex flex-col gap-8">
            <SectionHeading
              eyebrow="Considered Answers"
              title="Questions we'd want"
              accent="answered first"
              description="If what you need isn't here, the concierge line is answered by a clinician, not a call centre."
            />

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewportOnce}
              transition={{ duration: 0.8, ease: LUXE_EASE }}
              className="glass glass-edge flex items-center gap-3 rounded-full px-5 py-4"
            >
              <Search className="h-4 w-4 shrink-0 text-champagne-deep" strokeWidth={1.5} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search downtime, financing, physicians…"
                data-cursor="text"
                aria-label="Search frequently asked questions"
                className="w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-muted/70"
              />
              <AnimatePresence>
                {query && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="shrink-0 whitespace-nowrap text-[11px] tabular-nums text-ink-muted"
                  >
                    {results.length} result{results.length === 1 ? "" : "s"}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Accordion */}
          <Accordion.Root
            type="single"
            collapsible
            value={open}
            onValueChange={setOpen}
            className="flex flex-col gap-2.5"
          >
            <AnimatePresence mode="popLayout">
              {results.map((faq, i) => (
                <motion.div
                  key={faq.key}
                  layout
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12, scale: 0.98 }}
                  transition={{ duration: 0.55, ease: LUXE_EASE, delay: i * 0.04 }}
                >
                  <Accordion.Item
                    value={faq.key}
                    data-active={open === faq.key}
                    className="glass glass-edge overflow-hidden rounded-2xl"
                  >
                    <Accordion.Header>
                      <Accordion.Trigger
                        data-cursor="link"
                        className="group flex w-full items-center justify-between gap-5 px-6 py-5 text-left"
                      >
                        <span className="flex flex-col gap-2">
                          <span className="text-[10px] uppercase tracking-[0.22em] text-champagne-deep/80">
                            {faq.tag}
                          </span>
                          <span className="text-[15px] leading-snug text-ink">
                            <Highlight text={faq.q} query={query} />
                          </span>
                        </span>

                        <motion.span
                          animate={{ rotate: open === faq.key ? 45 : 0 }}
                          transition={{ duration: 0.5, ease: LUXE_EASE }}
                          className={cn(
                            "grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-colors duration-500",
                            open === faq.key
                              ? "border-champagne/65 bg-champagne/25 text-champagne-deep"
                              : "border-ink/10 text-ink-soft group-hover:border-champagne/55",
                          )}
                        >
                          <Plus className="h-4 w-4" strokeWidth={1.5} />
                        </motion.span>
                      </Accordion.Trigger>
                    </Accordion.Header>

                    <AnimatePresence initial={false}>
                      {open === faq.key && (
                        <Accordion.Content forceMount asChild>
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.55, ease: LUXE_EASE }}
                            className="overflow-hidden"
                          >
                            <p className="border-t border-ink/[0.08] px-6 py-5 text-[13px] leading-relaxed text-ink-muted">
                              <Highlight text={faq.a} query={query} />
                            </p>
                          </motion.div>
                        </Accordion.Content>
                      )}
                    </AnimatePresence>
                  </Accordion.Item>
                </motion.div>
              ))}
            </AnimatePresence>

            {results.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl px-6 py-10 text-center"
              >
                <p className="text-[13px] text-ink-muted">
                  Nothing matches “{query}”. Our concierge answers within the hour on{" "}
                  <span className="text-champagne-deep">+41 44 000 00 00</span>.
                </p>
              </motion.div>
            )}
          </Accordion.Root>
        </div>
      </div>
    </section>
  );
}
