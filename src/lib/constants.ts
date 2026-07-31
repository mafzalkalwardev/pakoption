import type {
  BodyType,
  FuelType,
  InspectionPackageId,
  Transmission,
} from "@/types";

export const SITE = {
  name: "PakOption",
  tagline: "Every car verified. Every price in the open.",
  description:
    "Pakistan's inspection-backed car auction marketplace. Bid on 200-point inspected cars, sell by auction or classified, and book a doorstep inspection in six cities.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "en_PK",
  timezone: "Asia/Karachi",
} as const;

export const CITIES = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Sialkot",
  "Gujranwala",
] as const;

/** Cities where PakOption inspection is operational at launch. */
export const INSPECTION_CITIES = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
] as const;

export const MAKES = [
  "Toyota",
  "Honda",
  "Suzuki",
  "Kia",
  "Hyundai",
  "MG",
  "Changan",
  "Haval",
  "Nissan",
  "Daihatsu",
  "Mercedes-Benz",
  "BMW",
  "Audi",
  "Land Rover",
  "Peugeot",
  "Proton",
  "DFSK",
  "Chery",
  "BYD",
  "Tesla",
] as const;

export const MODELS_BY_MAKE: Record<string, string[]> = {
  Toyota: [
    "Corolla",
    "Yaris",
    "Fortuner",
    "Hilux",
    "Land Cruiser",
    "Prado",
    "Vitz",
    "Aqua",
    "Prius",
    "Rush",
    "Camry",
  ],
  Honda: ["Civic", "City", "BR-V", "HR-V", "Accord", "Vezel", "Fit", "N-Box"],
  Suzuki: [
    "Alto",
    "Cultus",
    "Swift",
    "Wagon R",
    "Every",
    "Bolan",
    "Ravi",
    "Jimny",
    "Ciaz",
  ],
  Kia: ["Sportage", "Picanto", "Stonic", "Sorento", "Carnival", "EV6"],
  Hyundai: ["Tucson", "Elantra", "Sonata", "Porter", "Santa Fe", "Ioniq 5"],
  MG: ["HS", "ZS", "ZS EV", "GT", "Extender"],
  Changan: ["Alsvin", "Oshan X7", "Karvaan", "M9"],
  Haval: ["H6", "Jolion", "H6 HEV"],
  Nissan: ["Dayz", "Note", "Juke", "Sakura", "X-Trail"],
  Daihatsu: ["Mira", "Move", "Hijet", "Cast", "Tanto"],
  "Mercedes-Benz": ["C-Class", "E-Class", "S-Class", "GLC", "GLE"],
  BMW: ["3 Series", "5 Series", "X1", "X3", "X5", "i4"],
  Audi: ["A4", "A6", "Q2", "Q5", "e-tron"],
  "Land Rover": ["Range Rover", "Defender", "Discovery", "Evoque"],
  Peugeot: ["2008", "3008"],
  Proton: ["Saga", "X70"],
  DFSK: ["Glory 580", "Glory 500"],
  Chery: ["Tiggo 4 Pro", "Tiggo 8 Pro"],
  BYD: ["Atto 3", "Seal", "Sealion 6"],
  Tesla: ["Model 3", "Model Y"],
};

export const BODY_TYPES: { value: BodyType; label: string }[] = [
  { value: "HATCHBACK", label: "Hatchback" },
  { value: "SEDAN", label: "Sedan" },
  { value: "SUV", label: "SUV" },
  { value: "CROSSOVER", label: "Crossover" },
  { value: "MPV", label: "MPV" },
  { value: "PICKUP", label: "Pickup" },
  { value: "COUPE", label: "Coupé" },
  { value: "CONVERTIBLE", label: "Convertible" },
  { value: "WAGON", label: "Wagon" },
  { value: "VAN", label: "Van" },
];

export const FUEL_TYPES: { value: FuelType; label: string }[] = [
  { value: "PETROL", label: "Petrol" },
  { value: "DIESEL", label: "Diesel" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "ELECTRIC", label: "Electric" },
  { value: "CNG", label: "CNG" },
  { value: "LPG", label: "LPG" },
];

export const TRANSMISSIONS: { value: Transmission; label: string }[] = [
  { value: "MANUAL", label: "Manual" },
  { value: "AUTOMATIC", label: "Automatic" },
  { value: "CVT", label: "CVT" },
  { value: "DCT", label: "DCT" },
  { value: "AMT", label: "AMT" },
];

export const COLOURS = [
  "White",
  "Pearl White",
  "Silver",
  "Grey",
  "Black",
  "Blue",
  "Red",
  "Beige",
  "Brown",
  "Green",
  "Gold",
] as const;

export const FEATURES = [
  "ABS",
  "Airbags",
  "Alloy Rims",
  "AM/FM Radio",
  "Air Conditioning",
  "Climate Control",
  "Cruise Control",
  "CD Player",
  "Immobilizer Key",
  "Keyless Entry",
  "Navigation System",
  "Power Locks",
  "Power Mirrors",
  "Power Steering",
  "Power Windows",
  "Rear Camera",
  "360° Camera",
  "Rear Seat Entertainment",
  "Sun Roof",
  "Panoramic Roof",
  "Leather Seats",
  "Heated Seats",
  "Ventilated Seats",
  "Push Start",
  "Lane Assist",
  "Adaptive Cruise",
  "Blind Spot Monitor",
  "Apple CarPlay",
  "Android Auto",
  "Wireless Charging",
] as const;

/* -------------------------------------------------------------------------- */
/* Inspection                                                                 */
/* -------------------------------------------------------------------------- */

export const INSPECTION_PACKAGES: {
  id: InspectionPackageId;
  name: string;
  price: number;
  duration: string;
  checkpoints: number;
  blurb: string;
  features: string[];
  popular?: boolean;
}[] = [
  {
    id: "BASIC",
    name: "Basic",
    price: 3500,
    duration: "30 min",
    checkpoints: 120,
    blurb: "A fast visual and mechanical sanity check before you commit.",
    features: [
      "120 visual checkpoints",
      "Exterior, interior & tyres",
      "Fluid level check",
      "Document verification",
      "Digital report in 2 hours",
    ],
  },
  {
    id: "STANDARD",
    name: "Standard",
    price: 6500,
    duration: "60 min",
    checkpoints: 212,
    blurb:
      "The full 200+ point report. This is the one that earns the Certified badge.",
    features: [
      "212 checkpoints across 9 categories",
      "OBD-II diagnostic scan",
      "Engine & transmission assessment",
      "Body structure & weld inspection",
      "Photo evidence on every fault",
      "Digital report in 45–60 minutes",
      "PakOption Certified badge",
    ],
    popular: true,
  },
  {
    id: "COMPREHENSIVE",
    name: "Comprehensive",
    price: 9500,
    duration: "90 min",
    checkpoints: 240,
    blurb:
      "Everything in Standard, plus paint-depth mapping and a full road test.",
    features: [
      "240 checkpoints",
      "Paint thickness map on all panels",
      "20 km road test with notes",
      "Suspension & brake performance",
      "Underbody rust assessment",
      "Import auction sheet cross-check",
      "Priority same-day slot",
    ],
  },
];

export const INSPECTION_CATEGORIES = [
  {
    slug: "engine",
    name: "Engine",
    weight: 0.2,
    items: 34,
    icon: "engine",
    detail:
      "Cold start, idle stability, compression indicators, oil condition, leaks, belts, mounts, cooling system, turbo (where fitted).",
  },
  {
    slug: "transmission",
    name: "Transmission & Drivetrain",
    weight: 0.15,
    items: 26,
    icon: "transmission",
    detail:
      "Shift quality, slip test, fluid condition, clutch bite, differential, CV joints, 4WD engagement.",
  },
  {
    slug: "body",
    name: "Body & Structure",
    weight: 0.16,
    items: 30,
    icon: "body",
    detail:
      "Chassis rails, weld integrity, panel gaps, repaint evidence, filler detection, flood indicators.",
  },
  {
    slug: "suspension",
    name: "Suspension & Steering",
    weight: 0.1,
    items: 22,
    icon: "suspension",
    detail:
      "Shock absorbers, bushings, ball joints, tie rods, rack play, alignment symptoms, ride height.",
  },
  {
    slug: "brakes",
    name: "Brakes",
    weight: 0.09,
    items: 18,
    icon: "brakes",
    detail:
      "Pad and disc thickness, fluid condition, ABS function, handbrake travel, pedal feel.",
  },
  {
    slug: "electrical",
    name: "Electrical & Electronics",
    weight: 0.1,
    items: 32,
    icon: "electrical",
    detail:
      "OBD-II fault codes, battery health, alternator output, lighting, infotainment, sensors, airbag system.",
  },
  {
    slug: "interior",
    name: "Interior",
    weight: 0.06,
    items: 24,
    icon: "interior",
    detail:
      "Seat condition, upholstery, dashboard, controls, AC output temperature, odour and damp indicators.",
  },
  {
    slug: "exterior",
    name: "Exterior & Glass",
    weight: 0.06,
    items: 20,
    icon: "exterior",
    detail:
      "Paint condition, dents, glass chips, seals, lights, tyre tread depth and date codes, wheel condition.",
  },
  {
    slug: "documents",
    name: "Documents & History",
    weight: 0.08,
    items: 16,
    icon: "documents",
    detail:
      "Registration book, chassis and engine number match, token tax status, service records, odometer cross-check against ECU.",
  },
] as const;

/* -------------------------------------------------------------------------- */
/* Fees                                                                       */
/* -------------------------------------------------------------------------- */

export const FEES = {
  buyersPremiumRate: 0.02,
  buyersPremiumMin: 15_000,
  buyersPremiumMax: 200_000,
  auctionListingFee: 2_500,
  successFeeRate: 0.01,
  successFeeCap: 100_000,
  featuredPrices: [
    { days: 7, price: 1_500 },
    { days: 14, price: 2_800 },
    { days: 30, price: 6_000 },
  ],
} as const;

export const AUCTION_DURATIONS = [
  { days: 3, label: "3 days", note: "Fastest — best for hot models" },
  { days: 5, label: "5 days", note: "Balanced" },
  { days: 7, label: "7 days", note: "Recommended — most bids", recommended: true },
  { days: 10, label: "10 days", note: "Maximum exposure" },
] as const;

/* -------------------------------------------------------------------------- */
/* Navigation                                                                 */
/* -------------------------------------------------------------------------- */

export const NAV_LINKS = [
  { href: "/auctions", label: "Auctions" },
  { href: "/buy", label: "Buy" },
  { href: "/sell", label: "Sell" },
  { href: "/inspection", label: "Inspection" },
  { href: "/how-it-works", label: "How it works" },
] as const;

export const FOOTER_SECTIONS = [
  {
    title: "Marketplace",
    links: [
      { href: "/auctions", label: "Live auctions" },
      { href: "/auctions?status=upcoming", label: "Upcoming lots" },
      { href: "/auctions?status=ended", label: "Auction results" },
      { href: "/buy", label: "Classifieds" },
      { href: "/compare", label: "Compare cars" },
    ],
  },
  {
    title: "Sell",
    links: [
      { href: "/sell", label: "Sell your car" },
      { href: "/sell/new", label: "Create a listing" },
      { href: "/pricing", label: "Fees & pricing" },
      { href: "/how-it-works#sellers", label: "Seller guide" },
    ],
  },
  {
    title: "Inspection",
    links: [
      { href: "/inspection", label: "Inspection service" },
      { href: "/inspection/book", label: "Book an inspection" },
      { href: "/inspection#coverage", label: "Cities covered" },
      { href: "/inspection#sample", label: "Sample report" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/how-it-works", label: "How it works" },
      { href: "/blog", label: "Blog" },
      { href: "/legal/terms", label: "Terms" },
      { href: "/legal/privacy", label: "Privacy" },
      { href: "/legal/auction-rules", label: "Auction rules" },
    ],
  },
] as const;

export const POPULAR_SEARCHES = [
  "Toyota Corolla",
  "Honda Civic",
  "Suzuki Alto",
  "Kia Sportage",
  "Toyota Fortuner",
  "MG HS",
  "Honda City",
  "Hyundai Tucson",
] as const;
