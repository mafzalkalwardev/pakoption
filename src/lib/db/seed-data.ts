/**
 * Deterministic seed dataset.
 *
 * This is what the app runs on when `DATABASE_URL` is unset — which is why the
 * very first Vercel deploy works with zero configuration. It is also the source
 * for `prisma/seed.ts`.
 *
 * Auction end times are generated as offsets from module load, so the demo
 * always has genuinely live lots with running countdowns.
 */

import {
  computeBuyersPremium,
  getReserveStatus,
} from "@/lib/auction/engine";
import { hashRandom } from "@/lib/utils";
import type {
  Bid,
  Inspection,
  InspectionCategory,
  InspectionGrade,
  Listing,
  ListingCard,
  ListingImage,
  PlatformStats,
  PublicUser,
  AuctionPublic,
  Assembly,
  BodyType,
  FuelType,
  Transmission,
} from "@/types";
import { INSPECTION_CATEGORIES } from "@/lib/constants";

const NOW = Date.now();
const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

const IMG = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

/** A rotating pool of vehicle photography used to build galleries. */
const PHOTO_POOL = [
  "photo-1503376780353-7e6692767b70",
  "photo-1552519507-da3b142c6e3d",
  "photo-1541899481282-d53bffe3c35d",
  "photo-1583121274602-3e2820c69888",
  "photo-1494976388531-d1058494cdd8",
  "photo-1533473359331-0135ef1b58bf",
  "photo-1502877338535-766e1452684a",
  "photo-1580273916550-e323be2ae537",
  "photo-1568605117036-5fe5e7bab0b7",
  "photo-1503736334956-4c8f8e92946d",
  "photo-1511919884226-fd3cad34687c",
  "photo-1550355291-bbee04a92027",
  "photo-1554744512-d6c603f27c54",
  "photo-1519641471654-76ce0107ad1b",
  "photo-1493238792000-8113da705763",
  "photo-1526726538690-5cbf956ae2fd",
  "photo-1592198084033-aade902d1aae",
  "photo-1605559424843-9e4c228bf1c2",
  "photo-1617469767053-d3b523a0b982",
  "photo-1621007947382-bb3c3994e3fb",
  "photo-1614200187524-dc4b892acf16",
  "photo-1600712242805-5f78671b24da",
  "photo-1610768764270-790fbec18178",
  "photo-1606664515524-ed2f786a0bd6",
  "photo-1544636331-e26879cd4d9b",
  "photo-1571607388263-1044f9ea01dd",
];

const GALLERY_ANGLES = [
  "Front 3/4",
  "Rear 3/4",
  "Side profile",
  "Interior — dashboard",
  "Interior — rear seats",
  "Odometer",
  "Engine bay",
  "Wheels & tyres",
  "Boot space",
  "Underbody",
];

/* -------------------------------------------------------------------------- */
/* People                                                                     */
/* -------------------------------------------------------------------------- */

const SELLER_NAMES = [
  ["Bilal Ahmed", "Lahore", "SELLER"],
  ["Sana Iqbal", "Islamabad", "SELLER"],
  ["Kamran Motors", "Karachi", "DEALER"],
  ["Ayesha Malik", "Rawalpindi", "SELLER"],
  ["Imran Shah", "Faisalabad", "SELLER"],
  ["Gulberg Auto Gallery", "Lahore", "DEALER"],
  ["Hassan Raza", "Multan", "SELLER"],
  ["Zainab Qureshi", "Karachi", "SELLER"],
  ["DHA Car Point", "Karachi", "DEALER"],
  ["Usman Tariq", "Peshawar", "SELLER"],
  ["Fatima Sheikh", "Lahore", "SELLER"],
  ["Bahria Auto Hub", "Islamabad", "DEALER"],
] as const;

export const SELLERS: PublicUser[] = SELLER_NAMES.map(
  ([name, city, role], i) => {
    const r = hashRandom(name);
    return {
      id: `usr_${String(i + 1).padStart(3, "0")}`,
      name,
      handle: `${name.split(" ")[0]!.toLowerCase()}_${(hashRandom(name + "h") * 10000).toFixed(0).padStart(4, "0")}`,
      city,
      role: role as PublicUser["role"],
      tier: role === "DEALER" ? "DEALER_VERIFIED" : r > 0.4 ? "CNIC" : "PHONE",
      rating: Number((4.1 + r * 0.9).toFixed(1)),
      salesCount: role === "DEALER" ? 40 + Math.floor(r * 180) : Math.floor(r * 9),
      memberSince: new Date(NOW - (200 + r * 1400) * DAY).toISOString(),
    };
  },
);

/** Masked bidder handles used in public bid logs. */
const BIDDER_HANDLES = [
  "bidder_4f9a",
  "bidder_1c73",
  "bidder_9e20",
  "bidder_77bd",
  "bidder_3a08",
  "bidder_be51",
  "bidder_0d4c",
  "bidder_a612",
  "bidder_58ff",
  "bidder_e397",
  "bidder_2b6d",
  "bidder_c845",
];

/* -------------------------------------------------------------------------- */
/* Source vehicle rows                                                        */
/* -------------------------------------------------------------------------- */

interface CarRow {
  make: string;
  model: string;
  variant: string;
  year: number;
  km: number;
  tx: Transmission;
  fuel: FuelType;
  body: BodyType;
  asm: Assembly;
  cc: number;
  colour: string;
  city: string;
  /** Rough market value in PKR — auction start/reserve derive from this. */
  value: number;
  /** AUCTION lots get an auction, CLASSIFIED lots get an asking price. */
  kind: "AUCTION" | "CLASSIFIED";
  /** Hours until the auction ends; negative = already ended. */
  endsInH?: number;
  /** Hours until an upcoming auction starts. */
  startsInH?: number;
  reserve?: number | null;
  accident?: boolean;
  featured?: boolean;
  sheet?: string;
  score?: number | null;
}

const CARS: CarRow[] = [
  // ---- LIVE AUCTIONS ------------------------------------------------------
  { make: "Honda", model: "Civic", variant: "RS Turbo 1.5", year: 2019, km: 48000, tx: "CVT", fuel: "PETROL", body: "SEDAN", asm: "LOCAL", cc: 1498, colour: "Pearl White", city: "Lahore", value: 6800000, kind: "AUCTION", endsInH: 2.24, reserve: 6500000, featured: true, score: 8.4 },
  { make: "Toyota", model: "Corolla", variant: "Altis Grande X 1.8", year: 2021, km: 32000, tx: "CVT", fuel: "PETROL", body: "SEDAN", asm: "LOCAL", cc: 1798, colour: "Silver", city: "Karachi", value: 7900000, kind: "AUCTION", endsInH: 0.42, reserve: 7400000, featured: true, score: 9.1 },
  { make: "Suzuki", model: "Alto", variant: "VXL AGS 660", year: 2022, km: 21500, tx: "AMT", fuel: "PETROL", body: "HATCHBACK", asm: "LOCAL", cc: 658, colour: "White", city: "Islamabad", value: 2950000, kind: "AUCTION", endsInH: 5.8, reserve: null, score: 8.8 },
  { make: "Kia", model: "Sportage", variant: "Alpha 2.0", year: 2021, km: 41000, tx: "AUTOMATIC", fuel: "PETROL", body: "SUV", asm: "LOCAL", cc: 1999, colour: "Grey", city: "Lahore", value: 8200000, kind: "AUCTION", endsInH: 27, reserve: 7800000, score: 7.9 },
  { make: "Toyota", model: "Fortuner", variant: "Sigma 4 2.8D", year: 2020, km: 68000, tx: "AUTOMATIC", fuel: "DIESEL", body: "SUV", asm: "LOCAL", cc: 2755, colour: "Black", city: "Karachi", value: 16500000, kind: "AUCTION", endsInH: 49, reserve: 15800000, featured: true, score: 8.2 },
  { make: "Honda", model: "City", variant: "Aspire 1.5 CVT", year: 2022, km: 18900, tx: "CVT", fuel: "PETROL", body: "SEDAN", asm: "LOCAL", cc: 1498, colour: "Blue", city: "Rawalpindi", value: 5400000, kind: "AUCTION", endsInH: 8.5, reserve: 5100000, score: 9.3 },
  { make: "MG", model: "HS", variant: "Essence 1.5T", year: 2021, km: 37000, tx: "DCT", fuel: "PETROL", body: "CROSSOVER", asm: "IMPORTED", cc: 1490, colour: "Red", city: "Lahore", value: 7300000, kind: "AUCTION", endsInH: 14, reserve: null, score: 7.4 },
  { make: "Toyota", model: "Prado", variant: "TX 2.7 Limited", year: 2015, km: 112000, tx: "AUTOMATIC", fuel: "PETROL", body: "SUV", asm: "IMPORTED", cc: 2694, colour: "Pearl White", city: "Islamabad", value: 17800000, kind: "AUCTION", endsInH: 71, reserve: 17000000, sheet: "4.5B", score: 7.7 },
  { make: "Suzuki", model: "Swift", variant: "GLX CVT 1.2", year: 2022, km: 26400, tx: "CVT", fuel: "PETROL", body: "HATCHBACK", asm: "LOCAL", cc: 1197, colour: "Red", city: "Faisalabad", value: 4300000, kind: "AUCTION", endsInH: 3.1, reserve: 4050000, score: 8.6 },
  { make: "Hyundai", model: "Tucson", variant: "Ultimate 2.0 AWD", year: 2022, km: 29000, tx: "AUTOMATIC", fuel: "PETROL", body: "SUV", asm: "LOCAL", cc: 1999, colour: "Silver", city: "Karachi", value: 9100000, kind: "AUCTION", endsInH: 33, reserve: 8700000, score: 8.9 },
  { make: "Honda", model: "Vezel", variant: "Z Hybrid Sensing", year: 2018, km: 74000, tx: "DCT", fuel: "HYBRID", body: "CROSSOVER", asm: "IMPORTED", cc: 1496, colour: "Pearl White", city: "Lahore", value: 6100000, kind: "AUCTION", endsInH: 0.15, reserve: 5700000, sheet: "4B", score: 7.2 },
  { make: "Toyota", model: "Land Cruiser", variant: "ZX 4.6 V8", year: 2016, km: 96000, tx: "AUTOMATIC", fuel: "PETROL", body: "SUV", asm: "IMPORTED", cc: 4608, colour: "Black", city: "Islamabad", value: 42000000, kind: "AUCTION", endsInH: 96, reserve: 40000000, featured: true, sheet: "5A", score: 8.7 },
  { make: "Changan", model: "Alsvin", variant: "Lumiere 1.5 DCT", year: 2023, km: 14200, tx: "DCT", fuel: "PETROL", body: "SEDAN", asm: "LOCAL", cc: 1477, colour: "Grey", city: "Multan", value: 4150000, kind: "AUCTION", endsInH: 11.5, reserve: null, score: 9.0 },
  { make: "Haval", model: "Jolion", variant: "Ultra 1.5T", year: 2022, km: 31000, tx: "DCT", fuel: "PETROL", body: "CROSSOVER", asm: "LOCAL", cc: 1497, colour: "White", city: "Lahore", value: 7100000, kind: "AUCTION", endsInH: 18.6, reserve: 6800000, score: 8.1 },
  { make: "Suzuki", model: "Wagon R", variant: "VXL 1.0", year: 2020, km: 52000, tx: "MANUAL", fuel: "PETROL", body: "HATCHBACK", asm: "LOCAL", cc: 998, colour: "Silver", city: "Peshawar", value: 2680000, kind: "AUCTION", endsInH: 6.2, reserve: 2500000, accident: true, score: 6.4 },
  { make: "BMW", model: "3 Series", variant: "330i M Sport", year: 2020, km: 44000, tx: "AUTOMATIC", fuel: "PETROL", body: "SEDAN", asm: "IMPORTED", cc: 1998, colour: "Blue", city: "Karachi", value: 19500000, kind: "AUCTION", endsInH: 55, reserve: 18500000, featured: true, score: 8.5 },
  { make: "Kia", model: "Picanto", variant: "AT 1.0", year: 2021, km: 33500, tx: "AUTOMATIC", fuel: "PETROL", body: "HATCHBACK", asm: "LOCAL", cc: 998, colour: "White", city: "Rawalpindi", value: 3350000, kind: "AUCTION", endsInH: 4.4, reserve: null, score: 8.0 },
  { make: "Toyota", model: "Yaris", variant: "ATIV X CVT 1.5", year: 2022, km: 24000, tx: "CVT", fuel: "PETROL", body: "SEDAN", asm: "LOCAL", cc: 1496, colour: "Beige", city: "Lahore", value: 5250000, kind: "AUCTION", endsInH: 1.05, reserve: 4950000, score: 8.8 },

  // ---- UPCOMING -----------------------------------------------------------
  { make: "Audi", model: "Q5", variant: "45 TFSI quattro", year: 2021, km: 38000, tx: "AUTOMATIC", fuel: "PETROL", body: "SUV", asm: "IMPORTED", cc: 1984, colour: "Grey", city: "Islamabad", value: 24500000, kind: "AUCTION", startsInH: 14, endsInH: 182, reserve: 23000000, score: 8.6 },
  { make: "BYD", model: "Atto 3", variant: "Extended Range", year: 2024, km: 9200, tx: "AUTOMATIC", fuel: "ELECTRIC", body: "CROSSOVER", asm: "IMPORTED", cc: 0, colour: "Blue", city: "Karachi", value: 11800000, kind: "AUCTION", startsInH: 26, endsInH: 194, reserve: null, score: 9.4 },
  { make: "Honda", model: "BR-V", variant: "S 1.5", year: 2019, km: 66000, tx: "AUTOMATIC", fuel: "PETROL", body: "MPV", asm: "LOCAL", cc: 1497, colour: "Silver", city: "Faisalabad", value: 4600000, kind: "AUCTION", startsInH: 40, endsInH: 208, reserve: 4300000, score: 7.6 },
  { make: "Suzuki", model: "Jimny", variant: "JLDX 1.5 AT", year: 2023, km: 11000, tx: "AUTOMATIC", fuel: "PETROL", body: "SUV", asm: "IMPORTED", cc: 1462, colour: "Green", city: "Lahore", value: 9800000, kind: "AUCTION", startsInH: 62, endsInH: 230, reserve: 9200000, score: 9.2 },

  // ---- ENDED --------------------------------------------------------------
  { make: "Toyota", model: "Corolla", variant: "GLi 1.3 MT", year: 2018, km: 89000, tx: "MANUAL", fuel: "PETROL", body: "SEDAN", asm: "LOCAL", cc: 1329, colour: "White", city: "Multan", value: 4200000, kind: "AUCTION", endsInH: -6, reserve: 3900000, score: 7.1 },
  { make: "Honda", model: "Accord", variant: "CF4 2.0 VTEC", year: 2000, km: 210000, tx: "AUTOMATIC", fuel: "PETROL", body: "SEDAN", asm: "IMPORTED", cc: 1997, colour: "Black", city: "Karachi", value: 1450000, kind: "AUCTION", endsInH: -26, reserve: 1600000, accident: true, score: 5.2 },
  { make: "Mercedes-Benz", model: "C-Class", variant: "C200 AMG Line", year: 2019, km: 51000, tx: "AUTOMATIC", fuel: "PETROL", body: "SEDAN", asm: "IMPORTED", cc: 1497, colour: "Silver", city: "Lahore", value: 18200000, kind: "AUCTION", endsInH: -50, reserve: null, score: 8.3 },
  { make: "Suzuki", model: "Cultus", variant: "VXL AGS", year: 2021, km: 43000, tx: "AMT", fuel: "PETROL", body: "HATCHBACK", asm: "LOCAL", cc: 998, colour: "Blue", city: "Islamabad", value: 3400000, kind: "AUCTION", endsInH: -74, reserve: 3200000, score: 8.0 },

  // ---- CLASSIFIEDS --------------------------------------------------------
  { make: "Toyota", model: "Vitz", variant: "F 1.0 Safety Edition", year: 2019, km: 58000, tx: "CVT", fuel: "PETROL", body: "HATCHBACK", asm: "IMPORTED", cc: 996, colour: "Pearl White", city: "Lahore", value: 3850000, kind: "CLASSIFIED", sheet: "4.5B", score: 8.2 },
  { make: "Hyundai", model: "Elantra", variant: "GLS 1.6", year: 2021, km: 36000, tx: "AUTOMATIC", fuel: "PETROL", body: "SEDAN", asm: "LOCAL", cc: 1591, colour: "Grey", city: "Karachi", value: 5900000, kind: "CLASSIFIED", score: 8.5 },
  { make: "Suzuki", model: "Every", variant: "Join Turbo", year: 2018, km: 82000, tx: "AUTOMATIC", fuel: "PETROL", body: "VAN", asm: "IMPORTED", cc: 658, colour: "White", city: "Rawalpindi", value: 2750000, kind: "CLASSIFIED", score: 7.3 },
  { make: "Toyota", model: "Hilux", variant: "Revo V 2.8", year: 2020, km: 94000, tx: "AUTOMATIC", fuel: "DIESEL", body: "PICKUP", asm: "LOCAL", cc: 2755, colour: "Grey", city: "Peshawar", value: 12400000, kind: "CLASSIFIED", score: 7.8 },
  { make: "Kia", model: "Stonic", variant: "EX+ 1.4", year: 2022, km: 27000, tx: "AUTOMATIC", fuel: "PETROL", body: "CROSSOVER", asm: "LOCAL", cc: 1368, colour: "Red", city: "Faisalabad", value: 5150000, kind: "CLASSIFIED", score: 8.7 },
  { make: "Honda", model: "HR-V", variant: "VTi-S 1.5", year: 2023, km: 12500, tx: "CVT", fuel: "PETROL", body: "CROSSOVER", asm: "LOCAL", cc: 1498, colour: "Black", city: "Lahore", value: 8600000, kind: "CLASSIFIED", featured: true, score: 9.5 },
  { make: "Daihatsu", model: "Mira", variant: "X SA III", year: 2019, km: 47000, tx: "CVT", fuel: "PETROL", body: "HATCHBACK", asm: "IMPORTED", cc: 658, colour: "Silver", city: "Islamabad", value: 2450000, kind: "CLASSIFIED", sheet: "4B", score: 7.9 },
  { make: "Nissan", model: "Dayz", variant: "Highway Star X", year: 2020, km: 39000, tx: "CVT", fuel: "PETROL", body: "HATCHBACK", asm: "IMPORTED", cc: 659, colour: "Brown", city: "Karachi", value: 3150000, kind: "CLASSIFIED", sheet: "4.5A", score: 8.4 },
  { make: "MG", model: "ZS EV", variant: "Long Range", year: 2022, km: 22000, tx: "AUTOMATIC", fuel: "ELECTRIC", body: "CROSSOVER", asm: "IMPORTED", cc: 0, colour: "White", city: "Lahore", value: 9200000, kind: "CLASSIFIED", score: 8.9 },
  { make: "Toyota", model: "Rush", variant: "G 1.5 AT", year: 2021, km: 41000, tx: "AUTOMATIC", fuel: "PETROL", body: "SUV", asm: "LOCAL", cc: 1496, colour: "Silver", city: "Multan", value: 5450000, kind: "CLASSIFIED", score: 8.1 },
  { make: "Suzuki", model: "Bolan", variant: "VX Euro II", year: 2019, km: 78000, tx: "MANUAL", fuel: "PETROL", body: "VAN", asm: "LOCAL", cc: 796, colour: "White", city: "Gujranwala", value: 1350000, kind: "CLASSIFIED", accident: true, score: null },
  { make: "Land Rover", model: "Defender", variant: "110 P400 SE", year: 2022, km: 24000, tx: "AUTOMATIC", fuel: "PETROL", body: "SUV", asm: "IMPORTED", cc: 2996, colour: "Green", city: "Islamabad", value: 68000000, kind: "CLASSIFIED", featured: true, score: 9.1 },
];

/* -------------------------------------------------------------------------- */
/* Builders                                                                   */
/* -------------------------------------------------------------------------- */

function buildImages(seedKey: string, count = 8): ListingImage[] {
  const start = Math.floor(hashRandom(seedKey) * PHOTO_POOL.length);
  return Array.from({ length: count }, (_, i) => {
    const photo = PHOTO_POOL[(start + i * 3) % PHOTO_POOL.length]!;
    return {
      id: `img_${seedKey}_${i}`,
      url: IMG(photo, i === 0 ? 1600 : 1200),
      alt: `${seedKey.replace(/-/g, " ")} — ${GALLERY_ANGLES[i % GALLERY_ANGLES.length]}`,
      order: i,
      isPrimary: i === 0,
      angle: GALLERY_ANGLES[i % GALLERY_ANGLES.length],
    };
  });
}

function gradeFor(score: number): InspectionGrade {
  if (score >= 8.5) return "A";
  if (score >= 7.0) return "B";
  if (score >= 5.0) return "C";
  return "D";
}

const FAULT_LIBRARY: Record<string, string[]> = {
  engine: [
    "Minor oil seepage at the valve cover gasket",
    "Serpentine belt showing surface cracking",
    "Engine mount bushing slightly perished",
    "Coolant slightly below the MIN mark",
  ],
  transmission: [
    "Slight hesitation on 2–3 upshift when cold",
    "Transmission fluid darker than ideal — service recommended",
  ],
  body: [
    "Repaint detected on the front left fender",
    "Panel gap variance at the bonnet, within tolerance",
    "Minor surface corrosion on the boot lip",
  ],
  suspension: [
    "Front left shock absorber showing light weeping",
    "Anti-roll bar link bushing worn",
  ],
  brakes: [
    "Front pads at 40% remaining",
    "Rear discs lightly scored",
  ],
  electrical: [
    "Stored fault code P0420 — catalyst efficiency below threshold",
    "Rear left parking sensor intermittent",
    "Battery at 71% state of health",
  ],
  interior: [
    "Driver's seat bolster showing wear",
    "Cabin air filter due for replacement",
  ],
  exterior: [
    "Windscreen chip, 4 mm, repairable",
    "Front tyres at 4 mm tread depth",
    "Headlight lens lightly hazed",
  ],
  documents: [
    "Service book has a 12-month gap between stamps",
    "Token tax paid to the current year",
  ],
};

function buildInspection(
  seedKey: string,
  score: number,
  listingId: string,
  city: string,
): Inspection {
  const r = hashRandom(seedKey + "insp");
  const categories: InspectionCategory[] = INSPECTION_CATEGORIES.map(
    (cat, ci) => {
      const jitter = (hashRandom(seedKey + cat.slug) - 0.5) * 2.2;
      const catScore = Math.max(3, Math.min(10, Number((score + jitter).toFixed(1))));
      const faults = FAULT_LIBRARY[cat.slug] ?? [];
      const failCount = Math.min(
        faults.length,
        Math.max(0, Math.round((10 - catScore) * 0.7)),
      );

      const items = faults.slice(0, failCount).map((note, ii) => {
        const sev =
          catScore < 5.5
            ? ii === 0
              ? "MAJOR"
              : "MINOR"
            : catScore < 7.5
              ? "MINOR"
              : "ADVISORY";
        return {
          id: `itm_${seedKey}_${cat.slug}_${ii}`,
          label: note.split(" — ")[0]!.slice(0, 60),
          severity: sev as InspectionCategory["items"][number]["severity"],
          note,
          photoUrls: [IMG(PHOTO_POOL[(ci + ii) % PHOTO_POOL.length]!, 800)],
        };
      });

      return {
        id: `cat_${seedKey}_${cat.slug}`,
        name: cat.name,
        slug: cat.slug,
        score: catScore,
        weight: cat.weight,
        itemsTotal: cat.items,
        itemsPassed: cat.items - failCount,
        items,
      };
    },
  );

  const total = categories.reduce((s, c) => s + c.itemsTotal, 0);
  const passed = categories.reduce((s, c) => s + c.itemsPassed, 0);
  const weighted = categories.reduce((s, c) => s + c.score * c.weight, 0);
  const overall = Number(weighted.toFixed(1));
  const grade = gradeFor(overall);

  const summaries: Record<InspectionGrade, string> = {
    A: "Excellent condition for its age and mileage. No structural concerns, no major mechanical faults. A small number of advisory items only. This is a car you can buy with confidence.",
    B: "Good overall condition with a handful of items that will need attention in the next service interval. Nothing structural. Use the flagged items to negotiate.",
    C: "Usable but needs work. Several faults were found that carry real cost. Budget for repairs on top of the purchase price and negotiate accordingly.",
    D: "Significant faults found. We recommend walking away unless the price reflects a substantial repair bill and you have a mechanic lined up.",
  };

  return {
    id: `insp_${seedKey}`,
    reference: `PO-INS-2026-${(10000 + Math.floor(r * 89999)).toString()}`,
    publicToken: `rpt_${seedKey}`,
    listingId,
    packageId: overall >= 8 ? "COMPREHENSIVE" : "STANDARD",
    status: "COMPLETED",
    city,
    isDoorstep: r > 0.5,
    inspectorName: ["Adnan Yousaf", "Rehan Baig", "Tahir Mehmood", "Nadeem Akhtar"][
      Math.floor(r * 4)
    ],
    scheduledAt: new Date(NOW - (6 + r * 20) * DAY).toISOString(),
    completedAt: new Date(NOW - (5 + r * 18) * DAY).toISOString(),
    overallScore: overall,
    grade,
    checkpointsTotal: total,
    checkpointsPassed: passed,
    summary: summaries[grade],
    price: overall >= 8 ? 9500 : 6500,
    categories,
  };
}

function buildAuction(
  row: CarRow,
  seedKey: string,
): { auction: AuctionPublic; bids: Bid[]; reservePrice?: number } {
  const r = hashRandom(seedKey + "auc");
  const startingPrice = Math.round((row.value * 0.62) / 50000) * 50000;
  const endsAt = new Date(NOW + (row.endsInH ?? 24) * HOUR);
  const startsAt = new Date(
    row.startsInH !== undefined
      ? NOW + row.startsInH * HOUR
      : NOW - (2 + r * 5) * DAY,
  );

  const isUpcoming = row.startsInH !== undefined;
  const isEnded = (row.endsInH ?? 24) < 0;

  // Bid progression
  const bidCount = isUpcoming ? 0 : 6 + Math.floor(r * 26);
  const bidderCount = isUpcoming ? 0 : Math.max(2, Math.round(bidCount * 0.42));

  // Where the price ended up relative to true value
  const closeRatio = isUpcoming ? 0 : 0.86 + r * 0.2;
  const currentPrice = isUpcoming
    ? startingPrice
    : Math.round((row.value * closeRatio) / 25000) * 25000;

  const reservePrice = row.reserve ?? undefined;
  const reserveStatus = getReserveStatus(currentPrice, reservePrice, bidCount);

  let status: AuctionPublic["status"] = "LIVE";
  if (isUpcoming) status = "SCHEDULED";
  else if (isEnded) {
    if (bidCount === 0) status = "ENDED_NO_BIDS";
    else if (reserveStatus === "NOT_MET") status = "RESERVE_NOT_MET";
    else status = "SOLD";
  }

  // Build a plausible descending bid log
  const bids: Bid[] = [];
  let price = currentPrice;
  for (let i = 0; i < Math.min(bidCount, 18); i++) {
    const handle = BIDDER_HANDLES[(Math.floor(r * 12) + i * 5) % BIDDER_HANDLES.length]!;
    const step =
      price >= 10_000_000 ? 100_000 : price >= 5_000_000 ? 50_000 : price >= 2_000_000 ? 25_000 : 10_000;
    bids.push({
      id: `bid_${seedKey}_${i}`,
      auctionId: `auc_${seedKey}`,
      bidderHandle: handle,
      amount: price,
      isAutoBid: i % 3 === 1,
      status: i === 0 ? (isEnded ? "WON" : "LEADING") : "OUTBID",
      placedAt: new Date(
        endsAt.getTime() - (i + 1) * (0.6 + hashRandom(seedKey + i) * 7) * HOUR,
      ).toISOString(),
    });
    price -= step * (1 + Math.floor(hashRandom(seedKey + "s" + i) * 2));
    if (price < startingPrice) price = startingPrice;
  }

  return {
    auction: {
      id: `auc_${seedKey}`,
      status,
      startingPrice,
      currentPrice,
      bidCount,
      bidderCount,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      originalEndsAt: endsAt.toISOString(),
      extensionCount: (row.endsInH ?? 24) < 1 && !isEnded ? 1 : 0,
      reserveStatus,
      leaderHandle: bids[0]?.bidderHandle,
      soldPrice: status === "SOLD" ? currentPrice : undefined,
    },
    bids,
    reservePrice,
  };
}

const FEATURE_POOL = [
  "ABS",
  "Airbags",
  "Alloy Rims",
  "Air Conditioning",
  "Climate Control",
  "Cruise Control",
  "Immobilizer Key",
  "Keyless Entry",
  "Navigation System",
  "Power Locks",
  "Power Mirrors",
  "Power Steering",
  "Power Windows",
  "Rear Camera",
  "Push Start",
  "Apple CarPlay",
  "Android Auto",
  "Sun Roof",
  "Leather Seats",
  "Lane Assist",
];

function buildDescription(row: CarRow): string {
  const owner = row.accident
    ? "The car has a documented accident repair — details and photographs are in the inspection report, and the price reflects it."
    : "No accident history. The car has been maintained on schedule and the service book is available.";

  return [
    `${row.year} ${row.make} ${row.model} ${row.variant}, registered in ${row.city}, showing ${row.km.toLocaleString("en-PK")} km.`,
    "",
    owner,
    "",
    `Mechanically the car is ${row.score && row.score >= 8 ? "in strong order" : row.score && row.score >= 7 ? "sound with a few advisory items" : "usable but will need attention"} — the full ${row.score ? "PakOption inspection report is attached below so you can see exactly what was found, with photographs" : "condition is described honestly above; an inspection has not been carried out on this car"}.`,
    "",
    `Everything works as it should unless flagged. ${row.asm === "IMPORTED" ? `This is an imported unit${row.sheet ? `, auction sheet grade ${row.sheet}` : ""}.` : "This is a locally assembled unit."}`,
    "",
    "Viewing is welcome by appointment. Message through the platform to arrange.",
  ].join("\n");
}

/* -------------------------------------------------------------------------- */
/* Assembly                                                                   */
/* -------------------------------------------------------------------------- */

export const LISTINGS: Listing[] = CARS.map((row, idx) => {
  const seedKey = `${row.make}-${row.model}-${row.year}-${idx}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-");
  const r = hashRandom(seedKey);
  const id = `lst_${String(idx + 1).padStart(3, "0")}`;
  const slug = `${row.year}-${row.make}-${row.model}-${row.variant}-${row.city}-${idx}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const seller = SELLERS[idx % SELLERS.length]!;
  const images = buildImages(seedKey, 8 + Math.floor(r * 3));

  const inspection =
    row.score != null
      ? buildInspection(seedKey, row.score, id, row.city)
      : undefined;

  const featureCount = 8 + Math.floor(r * 9);
  const featureStart = Math.floor(r * 8);
  const features = Array.from(
    { length: featureCount },
    (_, i) => FEATURE_POOL[(featureStart + i) % FEATURE_POOL.length]!,
  ).filter((v, i, a) => a.indexOf(v) === i);

  const auctionBundle =
    row.kind === "AUCTION" ? buildAuction(row, seedKey) : undefined;

  const isEnded = (row.endsInH ?? 24) < 0;

  return {
    id,
    slug,
    type: row.kind,
    status: isEnded ? "SOLD" : "LIVE",
    title: `${row.year} ${row.make} ${row.model} ${row.variant}`,
    description: buildDescription(row),

    make: row.make,
    model: row.model,
    variant: row.variant,
    year: row.year,
    registrationCity: row.city,
    registrationYear: row.year,
    chassisNumber: `${row.make.slice(0, 3).toUpperCase()}${row.year}${(hashRandom(seedKey + "vin") * 1e9).toFixed(0).padStart(9, "0")}`,

    mileageKm: row.km,
    transmission: row.tx,
    fuelType: row.fuel,
    bodyType: row.body,
    assembly: row.asm,
    engineCc: row.cc,
    colour: row.colour,
    ownersCount: 1 + Math.floor(r * 3),

    hasAccidentHistory: !!row.accident,
    accidentNotes: row.accident
      ? "Front left quarter panel and bumper replaced after a low-speed impact in 2022. Repair carried out at an authorised workshop; no structural members affected. Photographs in the inspection report."
      : undefined,
    hasFloodDamage: false,
    serviceHistoryAvailable: r > 0.3,
    auctionSheetGrade: row.sheet,

    askingPrice: row.kind === "CLASSIFIED" ? row.value : undefined,
    isNegotiable: r > 0.35,

    features,
    images,
    seller,
    auction: auctionBundle?.auction,
    inspection,

    viewCount: 200 + Math.floor(r * 4200),
    watchCount: 8 + Math.floor(r * 190),
    isFeatured: !!row.featured,
    publishedAt: new Date(NOW - (1 + r * 22) * DAY).toISOString(),
  } satisfies Listing;
});

/** Bid logs keyed by auction id. */
export const BIDS_BY_AUCTION: Record<string, Bid[]> = Object.fromEntries(
  CARS.map((row, idx) => {
    if (row.kind !== "AUCTION") return null;
    const seedKey = `${row.make}-${row.model}-${row.year}-${idx}`
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-");
    return [`auc_${seedKey}`, buildAuction(row, seedKey).bids] as const;
  }).filter(Boolean) as [string, Bid[]][],
);

/** Hidden reserve prices — server-side only, never serialised to a client. */
export const RESERVES: Record<string, number | undefined> = Object.fromEntries(
  CARS.map((row, idx) => {
    const seedKey = `${row.make}-${row.model}-${row.year}-${idx}`
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-");
    return [`auc_${seedKey}`, row.reserve ?? undefined];
  }),
);

/* -------------------------------------------------------------------------- */
/* Projections                                                                */
/* -------------------------------------------------------------------------- */

export function toCard(l: Listing): ListingCard {
  const certified =
    !!l.inspection &&
    l.inspection.grade !== "C" &&
    l.inspection.grade !== "D" &&
    Date.now() - new Date(l.inspection.completedAt ?? 0).getTime() <
      30 * DAY;

  return {
    id: l.id,
    slug: l.slug,
    type: l.type,
    title: l.title,
    make: l.make,
    model: l.model,
    year: l.year,
    mileageKm: l.mileageKm,
    registrationCity: l.registrationCity,
    transmission: l.transmission,
    fuelType: l.fuelType,
    bodyType: l.bodyType,
    image: l.images[0]?.url ?? "",
    imageAlt: l.images[0]?.alt ?? l.title,
    askingPrice: l.askingPrice,
    auction: l.auction,
    isCertified: certified,
    inspectionScore: l.inspection?.overallScore,
    inspectionGrade: l.inspection?.grade,
    isFeatured: l.isFeatured,
    watchCount: l.watchCount,
  };
}

export const CARDS: ListingCard[] = LISTINGS.map(toCard);

/* -------------------------------------------------------------------------- */
/* Platform stats                                                             */
/* -------------------------------------------------------------------------- */

export const STATS: PlatformStats = {
  liveAuctions: 1247,
  carsSold: 8934,
  inspectionsCompleted: 21580,
  registeredBidders: 64200,
  gmvThisMonth: 2_840_000_000,
  averageSellThrough: 0.58,
};

/* -------------------------------------------------------------------------- */
/* Testimonials                                                               */
/* -------------------------------------------------------------------------- */

export const TESTIMONIALS = [
  {
    quote:
      "I had my Civic on another site for three weeks and got nothing but lowball calls. On PakOption it went to auction and closed above my reserve in six days. The inspection report did the arguing for me.",
    name: "Bilal Ahmed",
    role: "Sold a 2019 Honda Civic",
    city: "Lahore",
    score: "PKR 66,50,000",
  },
  {
    quote:
      "I was terrified of buying an accident car. The 212-point report showed me photographs of every single flagged item, including a repainted fender the seller had not mentioned. I negotiated and bought with my eyes open.",
    name: "Sana Iqbal",
    role: "Bought a 2021 Corolla Altis",
    city: "Islamabad",
    score: "Grade A · 9.1",
  },
  {
    quote:
      "We move eight to ten aged units a month through the auction now. Proxy bidding means we are not sitting refreshing a page, and the buyers who turn up have already been verified.",
    name: "Kamran Motors",
    role: "Dealer · 40-car lot",
    city: "Karachi",
    score: "112 lots sold",
  },
  {
    quote:
      "Booked a doorstep inspection for a car I was buying privately, off-platform. Technician came to my office, report was in my inbox in under an hour. Found a stored fault code that saved me a gearbox.",
    name: "Ayesha Malik",
    role: "Inspection customer",
    city: "Rawalpindi",
    score: "Saved ~PKR 4,00,000",
  },
] as const;

export { computeBuyersPremium };
