import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatPrice = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);

/** Maps `value` from one range to another, clamped to the output range. */
export const mapRange = (value: number, inMin: number, inMax: number, outMin: number, outMax: number) => {
  const t = (value - inMin) / (inMax - inMin || 1);
  const clamped = Math.min(Math.max(t, 0), 1);
  return outMin + clamped * (outMax - outMin);
};
