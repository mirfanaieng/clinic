import type { Metadata, Viewport } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { BoutiqueProvider } from "@/lib/store";
import { Cursor } from "@/components/ui/Cursor";

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Vessante · Aesthetic Institute",
  description:
    "Physician-led aesthetic and longevity medicine. Diagnostic imaging, regenerative protocols and an obsession with restraint.",
  keywords: ["aesthetic clinic", "dermatology", "longevity", "laser", "PRP", "HydraFacial"],
  openGraph: {
    title: "Vessante · Aesthetic Institute",
    description: "Redefining clinical elegance & cellular longevity.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#FBF8F4",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="bg-canvas">
        <BoutiqueProvider>
          <SmoothScrollProvider>
            <Cursor />
            {children}
          </SmoothScrollProvider>
        </BoutiqueProvider>
      </body>
    </html>
  );
}
