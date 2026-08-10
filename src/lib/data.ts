export type TreatmentCategory =
  | "rejuvenation"
  | "sculpting"
  | "hair"
  | "longevity";

export type Treatment = {
  id: string;
  name: string;
  category: TreatmentCategory;
  tagline: string;
  description: string;
  duration: string;
  downtime: string;
  from: number;
  /** Optional MP4 dropped into /public/media — falls back to the procedural surface. */
  video?: string;
  /** Drives the procedural tissue surface when no video is supplied. */
  hue: number;
  metrics: { label: string; value: string }[];
};

export const CATEGORIES: { id: TreatmentCategory | "all"; label: string }[] = [
  { id: "all", label: "All Protocols" },
  { id: "rejuvenation", label: "Skin Rejuvenation" },
  { id: "sculpting", label: "Body Sculpting" },
  { id: "hair", label: "Hair Restoration" },
  { id: "longevity", label: "Anti-Aging" },
];

export const TREATMENTS: Treatment[] = [
  {
    id: "fractional-laser",
    name: "Fractional Laser Resurfacing",
    category: "rejuvenation",
    video: "/media/treatment-rejuvenation.mp4",
    tagline: "Ablative precision, couture recovery",
    description:
      "A 1550nm non-ablative array fractures light into thousands of microthermal columns, triggering collagen remodelling without disturbing the epidermal envelope.",
    duration: "45 min",
    downtime: "2–3 days",
    from: 89000,
    hue: 18,
    metrics: [
      { label: "Collagen uplift", value: "+38%" },
      { label: "Sessions", value: "3–4" },
    ],
  },
  {
    id: "prp-signature",
    name: "PRP Bio-Regeneration",
    category: "rejuvenation",
    video: "/media/treatment-rejuvenation.mp4",
    tagline: "Your own biology, refined",
    description:
      "Autologous platelet concentrate at 6x baseline, micro-channelled into the papillary dermis to accelerate the body's native repair cascade.",
    duration: "60 min",
    downtime: "24 hours",
    from: 120000,
    hue: 348,
    metrics: [
      { label: "Platelet conc.", value: "6.2x" },
      { label: "Sessions", value: "3" },
    ],
  },
  {
    id: "hydrafacial-couture",
    name: "HydraFacial Couture",
    category: "rejuvenation",
    video: "/media/treatment-rejuvenation.mp4",
    tagline: "Lymphatic clarity in one hour",
    description:
      "Vortex-fusion extraction paired with a bespoke peptide infusion, calibrated to your barrier reading on the day of treatment.",
    duration: "50 min",
    downtime: "None",
    from: 42000,
    hue: 190,
    metrics: [
      { label: "Hydration", value: "+61%" },
      { label: "Sessions", value: "6" },
    ],
  },
  {
    id: "cryo-sculpt",
    name: "Cryolipolysis Sculpting",
    category: "sculpting",
    video: "/media/treatment-sculpting.mp4",
    tagline: "Contour by controlled cold",
    description:
      "Targeted adipocyte crystallisation at −11°C across four applicator zones, with lymphatic massage to accelerate clearance.",
    duration: "75 min",
    downtime: "None",
    from: 155000,
    hue: 205,
    metrics: [
      { label: "Fat reduction", value: "−24%" },
      { label: "Zones", value: "4" },
    ],
  },
  {
    id: "emsculpt-core",
    name: "Electromagnetic Core Sculpt",
    category: "sculpting",
    video: "/media/treatment-sculpting.mp4",
    tagline: "20,000 contractions per session",
    description:
      "High-intensity focused electromagnetic stimulation drives supramaximal contraction, building myofibril density beyond voluntary effort.",
    duration: "30 min",
    downtime: "None",
    from: 98000,
    hue: 268,
    metrics: [
      { label: "Muscle mass", value: "+16%" },
      { label: "Sessions", value: "6" },
    ],
  },
  {
    id: "follicle-matrix",
    name: "Follicular Matrix Therapy",
    category: "hair",
    video: "/media/treatment-hair.mp4",
    tagline: "Density, restored at the root",
    description:
      "Exosome-rich scalp infusion combined with low-level laser phototherapy to reawaken dormant follicles in the telogen phase.",
    duration: "55 min",
    downtime: "12 hours",
    from: 132000,
    hue: 32,
    metrics: [
      { label: "Density", value: "+29%" },
      { label: "Sessions", value: "4" },
    ],
  },
  {
    id: "fue-artistry",
    name: "FUE Transplant Artistry",
    category: "hair",
    video: "/media/treatment-hair.mp4",
    tagline: "Graft placement as fine art",
    description:
      "Single-follicle harvesting with sapphire micro-blade implantation, designed around your natural hairline architecture.",
    duration: "6 hours",
    downtime: "7 days",
    from: 780000,
    hue: 24,
    metrics: [
      { label: "Graft survival", value: "97%" },
      { label: "Grafts", value: "2400+" },
    ],
  },
  {
    id: "cellular-longevity",
    name: "Cellular Longevity Infusion",
    category: "longevity",
    video: "/media/treatment-longevity.mp4",
    tagline: "NAD+ at the mitochondrial level",
    description:
      "A physician-formulated NAD+ and peptide protocol addressing senescent cell burden, benchmarked against your epigenetic age panel.",
    duration: "90 min",
    downtime: "None",
    from: 210000,
    hue: 158,
    metrics: [
      { label: "Bio-age shift", value: "−3.4 yr" },
      { label: "Protocol", value: "12 wk" },
    ],
  },
  {
    id: "polynucleotide-lift",
    name: "Polynucleotide Contour Lift",
    category: "longevity",
    video: "/media/treatment-longevity.mp4",
    tagline: "Structural support without volume",
    description:
      "Salmon-derived polynucleotide chains rebuild the extracellular scaffold, lifting through tissue quality rather than added filler.",
    duration: "40 min",
    downtime: "48 hours",
    from: 168000,
    hue: 340,
    metrics: [
      { label: "Elasticity", value: "+42%" },
      { label: "Sessions", value: "3" },
    ],
  },
];

export type Product = {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  volume: string;
  notes: string[];
  /** Tints the transmissive glass in the 3D viewer. */
  glass: string;
  liquid: string;
  capMetal: string;
  form: "serum" | "sunblock" | "bundle";
};

export const PRODUCTS: Product[] = [
  {
    id: "aurum-serum",
    name: "Aurum Renewal Serum",
    subtitle: "Encapsulated retinaldehyde 0.1%",
    price: 28500,
    volume: "30 ml",
    notes: ["Retinaldehyde", "Bakuchiol", "Ceramide NP"],
    glass: "#C9A227",
    liquid: "#A8801A",
    capMetal: "#8A6D14",
    form: "serum",
  },
  {
    id: "quartz-shield",
    name: "Quartz Mineral Shield",
    subtitle: "SPF 50+ PA++++ tinted fluid",
    price: 16800,
    volume: "50 ml",
    notes: ["Zinc oxide 22%", "Niacinamide", "Ectoin"],
    glass: "#D9A9A3",
    liquid: "#C4867F",
    capMetal: "#A8837D",
    form: "sunblock",
  },
  {
    id: "obsidian-peptide",
    name: "Obsidian Peptide Concentrate",
    subtitle: "Copper tripeptide-1 overnight",
    price: 34200,
    volume: "20 ml",
    notes: ["GHK-Cu", "Matrixyl 3000", "Squalane"],
    glass: "#5E86A6",
    liquid: "#325B76",
    capMetal: "#8695A3",
    form: "serum",
  },
  {
    id: "protocol-bundle",
    name: "The Longevity Protocol",
    subtitle: "Three-step clinical regimen",
    price: 68000,
    volume: "Full set",
    notes: ["Serum", "Shield", "Concentrate"],
    glass: "#B98BA0",
    liquid: "#8A5C72",
    capMetal: "#8A6D14",
    form: "bundle",
  },
];

export const FAQS = [
  {
    q: "How is my treatment protocol determined?",
    a: "Every protocol begins with a 90-minute diagnostic: VISIA multispectral imaging, dermal ultrasound, and a biomarker panel. Your physician builds the sequence from that data — we never sell a fixed package before we have read your skin.",
    tag: "Consultation",
  },
  {
    q: "Is there genuinely no downtime for the non-ablative work?",
    a: "HydraFacial Couture and the electromagnetic sculpting protocols carry zero downtime; you can return to work immediately. Fractional laser produces a bronzed micro-texture for two to three days, which most patients cover with our post-procedure mineral veil.",
    tag: "Recovery",
  },
  {
    q: "Who performs the procedures?",
    a: "All injectables, lasers, and surgical work are performed by board-certified dermatologists and plastic surgeons. Aestheticians handle facials and pre/post care exclusively — never devices.",
    tag: "Clinical",
  },
  {
    q: "What does the longevity programme actually measure?",
    a: "We benchmark epigenetic age via methylation array, inflammatory markers, and mitochondrial function at week zero, twelve, and twenty-four. You receive the raw panel, not a marketing score.",
    tag: "Longevity",
  },
  {
    q: "How far in advance should I book?",
    a: "Consultations typically open within nine days. Procedure slots with our senior physicians run three to five weeks out; the concierge line holds a small daily allocation for existing patients.",
    tag: "Booking",
  },
  {
    q: "Do you offer financing for multi-session protocols?",
    a: "Yes — protocols above $2,500 can be structured across six or twelve months at zero interest, arranged during your consultation rather than at the point of sale.",
    tag: "Investment",
  },
  {
    q: "Are results permanent?",
    a: "Structural work such as FUE transplantation is permanent. Collagen-driven results hold eighteen to twenty-four months with annual maintenance; we schedule reviews rather than assume you will return.",
    tag: "Results",
  },
];

export type Testimonial = {
  id: string;
  name: string;
  handle: string;
  treatment: string;
  quote: string;
  duration: string;
  hue: number;
  video?: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    name: "Amara Okafor",
    handle: "@amara.o",
    treatment: "Polynucleotide Contour Lift",
    quote: "Six weeks in and my jawline reads the way it did at thirty. Nobody can tell I had anything done — that was the entire brief.",
    duration: "0:24",
    video: "/media/reel-1.mp4",
    hue: 340,
  },
  {
    id: "t2",
    name: "Julian Reyes",
    handle: "@jreyes",
    treatment: "Follicular Matrix Therapy",
    quote: "I came in expecting a sales pitch. I left with a biomarker panel and a physician who told me one of the options wasn't worth my money.",
    duration: "0:31",
    video: "/media/reel-2.mp4",
    hue: 32,
  },
  {
    id: "t3",
    name: "Sofia Lindqvist",
    handle: "@sofia.l",
    treatment: "Cellular Longevity Infusion",
    quote: "My epigenetic age dropped 3.4 years across the twelve-week protocol. They handed me the raw methylation data to verify it myself.",
    duration: "0:19",
    video: "/media/reel-3.mp4",
    hue: 158,
  },
  {
    id: "t4",
    name: "Devansh Mehta",
    handle: "@dev.mehta",
    treatment: "Fractional Laser Resurfacing",
    quote: "Fifteen years of acne scarring, softened to the point I stopped noticing it in photographs. Three sessions.",
    duration: "0:27",
    video: "/media/reel-4.mp4",
    hue: 18,
  },
  {
    id: "t5",
    name: "Camille Doucet",
    handle: "@camilledoucet",
    treatment: "HydraFacial Couture",
    quote: "The only facial I've had where they read my barrier function first and changed the formulation on the spot.",
    duration: "0:22",
    video: "/media/reel-5.mp4",
    hue: 190,
  },
];

export const TIME_SLOTS = [
  "09:00",
  "10:30",
  "11:45",
  "13:15",
  "14:30",
  "15:45",
  "17:00",
  "18:30",
];
