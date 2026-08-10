"use client";

import { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Dna,
  Droplets,
  Scissors,
  Sparkles,
  Timer,
  Waves,
  X,
  Zap,
} from "lucide-react";
import { TIME_SLOTS, TREATMENTS, type Treatment } from "@/lib/data";
import { LUXE_EASE, drawerSlide, stepVariants } from "@/lib/motion";
import { cn, formatPrice } from "@/lib/utils";
import { useBoutique } from "@/lib/store";
import { useLockScroll } from "@/components/providers/SmoothScrollProvider";
import { MagneticButton } from "@/components/ui/MagneticButton";

const STEPS = ["Protocol", "Schedule", "Details"] as const;

const ICONS: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  "fractional-laser": Zap,
  "prp-signature": Droplets,
  "hydrafacial-couture": Waves,
  "cryo-sculpt": Sparkles,
  "emsculpt-core": Zap,
  "follicle-matrix": Dna,
  "fue-artistry": Scissors,
  "cellular-longevity": Dna,
  "polynucleotide-lift": Sparkles,
};

/* ------------------------------------------------------------------ dates */

function useUpcomingDays(count = 14) {
  return useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 1; i <= count; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push(d);
    }
    return days;
  }, [count]);
}

/** Deterministic pseudo-availability so a given day always reads the same. */
function slotsForDay(date: Date) {
  const key = date.getDate() + date.getMonth() * 31;
  return TIME_SLOTS.map((time, i) => ({
    time,
    available: (key * 7 + i * 13) % 5 !== 0 && date.getDay() !== 0,
  }));
}

/* --------------------------------------------------------------- confetti */

function Confetti() {
  const shards = useMemo(
    () =>
      Array.from({ length: 44 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 460,
        y: -(120 + Math.random() * 300),
        rotate: Math.random() * 720 - 360,
        delay: Math.random() * 0.35,
        scale: 0.5 + Math.random() * 0.9,
        color: ["#C9A227", "#8A6D14", "#C99A94", "#1F1A17"][i % 4],
        width: Math.random() > 0.5 ? 3 : 6,
      })),
    [],
  );

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center overflow-hidden">
      {shards.map((s) => (
        <motion.span
          key={s.id}
          initial={{ opacity: 0, x: 0, y: 0, rotate: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
            x: s.x,
            y: [0, s.y, s.y + 340],
            rotate: s.rotate,
            scale: s.scale,
          }}
          transition={{ duration: 2.1, delay: s.delay, ease: [0.15, 0.6, 0.4, 1] }}
          style={{ background: s.color, width: s.width, height: s.width * 2.6 }}
          className="absolute rounded-[1px]"
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ steps */

function StepProtocol({
  selected,
  onSelect,
}: {
  selected: Treatment | null;
  onSelect: (t: Treatment) => void;
}) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {TREATMENTS.map((t, i) => {
        const Icon = ICONS[t.id] ?? Sparkles;
        const active = selected?.id === t.id;
        return (
          <motion.button
            key={t.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: LUXE_EASE, delay: i * 0.035 }}
            onClick={() => onSelect(t)}
            data-cursor="link"
            data-active={active}
            className={cn(
              "glass glass-edge group flex items-start gap-3.5 rounded-2xl p-4 text-left transition-colors duration-500",
              active ? "border-champagne/60 bg-champagne/16" : "hover:bg-canvas-warm/70",
            )}
          >
            <span
              className={cn(
                "mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-colors duration-500",
                active
                  ? "border-champagne/65 bg-champagne/25 text-champagne-deep"
                  : "border-ink/10 bg-canvas-warm/70 text-ink-soft",
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={1.4} />
            </span>

            <span className="flex min-w-0 flex-col gap-1">
              <span className="text-[13px] leading-snug text-ink">{t.name}</span>
              <span className="text-[11px] text-ink-muted">
                {t.duration} · from {formatPrice(t.from)}
              </span>
            </span>

            <AnimatePresence>
              {active && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: LUXE_EASE }}
                  className="ml-auto mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-ink text-canvas"
                >
                  <Check className="h-3 w-3" strokeWidth={2.5} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}

function StepSchedule({
  date,
  time,
  onDate,
  onTime,
}: {
  date: Date | null;
  time: string | null;
  onDate: (d: Date) => void;
  onTime: (t: string) => void;
}) {
  const days = useUpcomingDays();
  const slots = date ? slotsForDay(date) : [];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="eyebrow mb-4">Select a date</p>
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
          {days.map((d, i) => {
            const active = date?.toDateString() === d.toDateString();
            const closed = d.getDay() === 0;
            return (
              <motion.button
                key={d.toISOString()}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: LUXE_EASE, delay: i * 0.025 }}
                disabled={closed}
                onClick={() => onDate(d)}
                data-cursor="link"
                className={cn(
                  "relative flex h-[86px] w-[68px] shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border transition-colors duration-500",
                  closed && "cursor-not-allowed opacity-25",
                  active
                    ? "border-champagne/70 bg-champagne/16"
                    : "border-ink/10 bg-white/70 hover:border-ink/15",
                )}
              >
                <span className="text-[10px] uppercase tracking-[0.16em] text-ink-muted">
                  {d.toLocaleDateString("en-US", { weekday: "short" })}
                </span>
                <span
                  className={cn(
                    "font-display text-2xl",
                    active ? "text-champagne-deep" : "text-ink",
                  )}
                >
                  {d.getDate()}
                </span>
                <span className="text-[9px] uppercase tracking-[0.14em] text-ink-muted">
                  {d.toLocaleDateString("en-US", { month: "short" })}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {date && (
          <motion.div
            key={date.toDateString()}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: LUXE_EASE }}
          >
            <p className="eyebrow mb-4">Available times · CET</p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((slot, i) => (
                <motion.button
                  key={slot.time}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: LUXE_EASE, delay: i * 0.04 }}
                  disabled={!slot.available}
                  onClick={() => onTime(slot.time)}
                  data-cursor={slot.available ? "link" : undefined}
                  className={cn(
                    "relative overflow-hidden rounded-xl border py-3 text-[13px] transition-colors duration-500",
                    !slot.available && "cursor-not-allowed border-ink/[0.07] text-ink-muted/55 line-through",
                    slot.available && time === slot.time
                      ? "border-champagne bg-ink text-canvas"
                      : slot.available && "border-ink/10 bg-white/70 text-ink hover:border-champagne/65",
                  )}
                >
                  {slot.time}
                  {slot.available && time !== slot.time && (
                    <span className="absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-champagne/70" />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type Patient = { name: string; email: string; phone: string; notes: string };

function StepDetails({
  patient,
  onChange,
  errors,
}: {
  patient: Patient;
  onChange: (p: Patient) => void;
  errors: Partial<Record<keyof Patient, string>>;
}) {
  const fields: { key: keyof Patient; label: string; type: string; placeholder: string }[] = [
    { key: "name", label: "Full name", type: "text", placeholder: "Elena Vasquez" },
    { key: "email", label: "Email", type: "email", placeholder: "elena@studio.com" },
    { key: "phone", label: "Phone", type: "tel", placeholder: "+41 79 000 00 00" },
  ];

  return (
    <div className="flex flex-col gap-5">
      {fields.map((f, i) => (
        <motion.label
          key={f.key}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: LUXE_EASE, delay: i * 0.06 }}
          className="flex flex-col gap-2"
        >
          <span className="eyebrow">{f.label}</span>
          <input
            type={f.type}
            value={patient[f.key]}
            placeholder={f.placeholder}
            onChange={(e) => onChange({ ...patient, [f.key]: e.target.value })}
            data-cursor="text"
            aria-invalid={Boolean(errors[f.key])}
            className={cn(
              "w-full rounded-xl border bg-white/70 px-4 py-3.5 text-[14px] text-ink outline-none transition-colors duration-500 placeholder:text-ink-muted/60",
              errors[f.key]
                ? "border-red-400/50 focus:border-red-400/70"
                : "border-ink/10 focus:border-champagne/70",
            )}
          />
          {errors[f.key] && (
            <motion.span
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[11px] text-red-300/80"
            >
              {errors[f.key]}
            </motion.span>
          )}
        </motion.label>
      ))}

      <motion.label
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: LUXE_EASE, delay: 0.2 }}
        className="flex flex-col gap-2"
      >
        <span className="eyebrow">Anything we should know</span>
        <textarea
          rows={3}
          value={patient.notes}
          placeholder="Previous treatments, sensitivities, goals…"
          onChange={(e) => onChange({ ...patient, notes: e.target.value })}
          data-cursor="text"
          className="w-full resize-none rounded-xl border border-ink/10 bg-white/70 px-4 py-3.5 text-[14px] text-ink outline-none transition-colors duration-500 placeholder:text-ink-muted/60 focus:border-champagne/70"
        />
      </motion.label>
    </div>
  );
}

/* ------------------------------------------------------------------ shell */

export function BookingDrawer() {
  const { bookingOpen, closeBooking, bookingSeed } = useBoutique();
  useLockScroll(bookingOpen);

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [treatment, setTreatment] = useState<Treatment | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [patient, setPatient] = useState<Patient>({ name: "", email: "", phone: "", notes: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof Patient, string>>>({});
  const [confirmed, setConfirmed] = useState(false);

  // Seed the flow when opened from a specific treatment card.
  useEffect(() => {
    if (!bookingOpen) return;
    setConfirmed(false);
    setErrors({});
    if (bookingSeed) {
      const seeded = TREATMENTS.find((t) => t.id === bookingSeed) ?? null;
      setTreatment(seeded);
      setStep(seeded ? 1 : 0);
    } else {
      setStep(0);
    }
  }, [bookingOpen, bookingSeed]);

  const canAdvance =
    (step === 0 && Boolean(treatment)) || (step === 1 && Boolean(date && time)) || step === 2;

  const validate = () => {
    const next: Partial<Record<keyof Patient, string>> = {};
    if (patient.name.trim().length < 2) next.name = "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(patient.email)) next.email = "That email doesn't look right.";
    if (patient.phone.replace(/\D/g, "").length < 7) next.phone = "Please include a reachable number.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const next = () => {
    if (step < 2) {
      setDirection(1);
      setStep((s) => s + 1);
      return;
    }
    if (validate()) setConfirmed(true);
  };

  const back = () => {
    setDirection(-1);
    setStep((s) => Math.max(0, s - 1));
  };

  return (
    <Dialog.Root open={bookingOpen} onOpenChange={(o) => !o && closeBooking()}>
      <AnimatePresence>
        {bookingOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: LUXE_EASE }}
                className="fixed inset-0 z-[100] bg-ink/25 backdrop-blur-md"
              />
            </Dialog.Overlay>

            <Dialog.Content asChild>
              <motion.div
                variants={drawerSlide}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="fixed inset-y-0 right-0 z-[101] flex w-full max-w-[620px] flex-col border-l border-ink/10 bg-canvas/95 backdrop-blur-2xl"
              >
                {/* Ambient wash */}
                <div className="pointer-events-none absolute -left-24 top-1/4 h-96 w-96 rounded-full bg-champagne/16 blur-[110px]" />

                {/* Header */}
                <div className="relative flex items-start justify-between gap-6 border-b border-ink/[0.09] px-7 py-6 sm:px-9">
                  <div className="flex flex-col gap-1.5">
                    <Dialog.Title className="font-display text-2xl text-ink">
                      {confirmed ? "You're confirmed" : "Reserve your consultation"}
                    </Dialog.Title>
                    <Dialog.Description className="text-[12px] text-ink-muted">
                      {confirmed
                        ? "A concierge will call to confirm within four hours."
                        : "Three steps. Ninety seconds. No payment today."}
                    </Dialog.Description>
                  </div>

                  <Dialog.Close asChild>
                    <button
                      data-cursor="link"
                      aria-label="Close booking"
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-ink/10 text-ink-soft transition-colors duration-500 hover:border-champagne/65 hover:text-champagne-deep"
                    >
                      <X className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  </Dialog.Close>
                </div>

                {/* Progress rail */}
                {!confirmed && (
                  <div className="relative flex gap-2 px-7 py-5 sm:px-9">
                    {STEPS.map((label, i) => (
                      <button
                        key={label}
                        onClick={() => i < step && (setDirection(-1), setStep(i))}
                        disabled={i > step}
                        data-cursor={i < step ? "link" : undefined}
                        className="group flex flex-1 flex-col gap-2 text-left"
                      >
                        <span className="relative h-[2px] w-full overflow-hidden rounded-full bg-white/10">
                          <motion.span
                            initial={false}
                            animate={{ scaleX: i <= step ? 1 : 0 }}
                            transition={{ duration: 0.7, ease: LUXE_EASE }}
                            style={{ originX: 0 }}
                            className="absolute inset-0 bg-gradient-to-r from-champagne-deep to-champagne"
                          />
                        </span>
                        <span
                          className={cn(
                            "text-[10px] uppercase tracking-[0.2em] transition-colors duration-500",
                            i <= step ? "text-champagne-deep" : "text-ink-muted/70",
                          )}
                        >
                          {String(i + 1).padStart(2, "0")} · {label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Body */}
                <div className="relative flex-1 overflow-y-auto px-7 pb-6 sm:px-9">
                  <AnimatePresence mode="wait" custom={direction} initial={false}>
                    {confirmed ? (
                      <motion.div
                        key="confirmed"
                        initial={{ opacity: 0, scale: 0.94 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7, ease: LUXE_EASE }}
                        className="relative flex min-h-[420px] flex-col items-center justify-center gap-7 text-center"
                      >
                        <Confetti />

                        <motion.span
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ duration: 0.8, ease: LUXE_EASE, delay: 0.1 }}
                          className="relative grid h-20 w-20 place-items-center rounded-full border border-champagne/55 bg-champagne/14"
                        >
                          <span className="absolute inset-0 animate-pulse-slot rounded-full bg-champagne/25 blur-xl" />
                          <Check className="h-8 w-8 text-champagne-deep" strokeWidth={1.2} />
                        </motion.span>

                        <div className="relative flex flex-col gap-3">
                          <h3 className="font-display text-3xl text-ink">
                            {treatment?.name}
                          </h3>
                          <p className="text-[14px] text-ink-soft">
                            {date?.toLocaleDateString("en-US", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                            })}{" "}
                            · {time} CET
                          </p>
                        </div>

                        <div className="glass relative flex w-full max-w-sm flex-col gap-3 rounded-2xl p-5 text-left">
                          {[
                            ["Patient", patient.name],
                            ["Confirmation", patient.email],
                            ["Reference", `VSN-${Date.now().toString().slice(-6)}`],
                          ].map(([k, v]) => (
                            <div key={k} className="flex items-baseline justify-between gap-4">
                              <span className="text-[11px] uppercase tracking-[0.18em] text-ink-muted">
                                {k}
                              </span>
                              <span className="truncate text-[13px] text-ink">{v}</span>
                            </div>
                          ))}
                        </div>

                        <MagneticButton variant="ghost" onClick={closeBooking}>
                          Return to the institute
                        </MagneticButton>
                      </motion.div>
                    ) : (
                      <motion.div
                        key={step}
                        custom={direction}
                        variants={stepVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                      >
                        {step === 0 && (
                          <StepProtocol selected={treatment} onSelect={setTreatment} />
                        )}
                        {step === 1 && (
                          <StepSchedule
                            date={date}
                            time={time}
                            onDate={(d) => {
                              setDate(d);
                              setTime(null);
                            }}
                            onTime={setTime}
                          />
                        )}
                        {step === 2 && (
                          <StepDetails patient={patient} onChange={setPatient} errors={errors} />
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Footer */}
                {!confirmed && (
                  <div className="relative flex items-center justify-between gap-4 border-t border-ink/[0.09] bg-canvas-warm/70 px-7 py-5 sm:px-9">
                    <div className="flex min-w-0 flex-col gap-0.5">
                      {treatment ? (
                        <>
                          <span className="truncate text-[13px] text-ink">{treatment.name}</span>
                          <span className="flex items-center gap-1.5 text-[11px] text-ink-muted">
                            <Timer className="h-3 w-3" strokeWidth={1.5} />
                            {treatment.duration}
                            {date && time && ` · ${date.toLocaleDateString("en-US", { day: "numeric", month: "short" })} ${time}`}
                          </span>
                        </>
                      ) : (
                        <span className="text-[12px] text-ink-muted">
                          Select a protocol to continue
                        </span>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {step > 0 && (
                        <button
                          onClick={back}
                          data-cursor="link"
                          className="grid h-11 w-11 place-items-center rounded-full border border-ink/10 text-ink-soft transition-colors duration-500 hover:border-champagne/65 hover:text-champagne-deep"
                          aria-label="Previous step"
                        >
                          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                      )}

                      <MagneticButton
                        onClick={next}
                        disabled={!canAdvance}
                        pull={canAdvance ? 12 : 0}
                        className={cn(!canAdvance && "cursor-not-allowed opacity-35")}
                        icon={<ArrowRight className="h-4 w-4" strokeWidth={1.6} />}
                      >
                        {step === 2 ? "Confirm booking" : "Continue"}
                      </MagneticButton>
                    </div>
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
