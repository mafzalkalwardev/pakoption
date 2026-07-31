/**
 * PakOption domain types.
 *
 * These mirror `prisma/schema.prisma` and are the contract the seed adapter
 * and the Prisma adapter both satisfy. If you change a model, change all four:
 * schema.prisma · this file · src/lib/db/seed-data.ts · docs/DATA_MODEL.md
 *
 * MONEY RULE: every currency value is an INTEGER number of PKR. No floats.
 */

export type Role = "BUYER" | "SELLER" | "DEALER" | "INSPECTOR" | "ADMIN";

export type VerificationTier =
  | "NONE"
  | "EMAIL"
  | "PHONE"
  | "CNIC"
  | "DEALER_VERIFIED";

export type ListingType = "AUCTION" | "CLASSIFIED";

export type ListingStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "LIVE"
  | "PAUSED"
  | "SOLD"
  | "EXPIRED"
  | "REJECTED";

export type AuctionStatus =
  | "SCHEDULED"
  | "LIVE"
  | "SOLD"
  | "RESERVE_NOT_MET"
  | "ENDED_NO_BIDS"
  | "CANCELLED";

export type BidStatus = "LEADING" | "OUTBID" | "WON" | "LOST" | "VOIDED";

export type Transmission = "MANUAL" | "AUTOMATIC" | "CVT" | "DCT" | "AMT";

export type FuelType =
  | "PETROL"
  | "DIESEL"
  | "HYBRID"
  | "ELECTRIC"
  | "CNG"
  | "LPG";

export type BodyType =
  | "HATCHBACK"
  | "SEDAN"
  | "SUV"
  | "CROSSOVER"
  | "MPV"
  | "PICKUP"
  | "COUPE"
  | "CONVERTIBLE"
  | "WAGON"
  | "VAN";

export type Assembly = "LOCAL" | "IMPORTED";

export type InspectionPackageId = "BASIC" | "STANDARD" | "COMPREHENSIVE";

export type InspectionStatus =
  | "REQUESTED"
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type InspectionGrade = "A" | "B" | "C" | "D";

export type ItemSeverity = "OK" | "ADVISORY" | "MINOR" | "MAJOR" | "CRITICAL";

export type OfferStatus =
  | "PENDING"
  | "ACCEPTED"
  | "DECLINED"
  | "COUNTERED"
  | "EXPIRED";

/** Derived, never stored. */
export type ReserveStatus = "NO_RESERVE" | "MET" | "NOT_MET";

/** Derived, never stored. */
export type AuctionPhase = "UPCOMING" | "LIVE" | "ENDING_SOON" | "ENDED";

/* -------------------------------------------------------------------------- */
/* Entities                                                                   */
/* -------------------------------------------------------------------------- */

export interface PublicUser {
  id: string;
  name: string;
  /** Masked public identity used in bid logs, e.g. `bidder_4f9a`. */
  handle: string;
  avatarUrl?: string;
  city?: string;
  role: Role;
  tier: VerificationTier;
  rating: number;
  salesCount: number;
  memberSince: string;
}

export interface ListingImage {
  id: string;
  url: string;
  alt: string;
  order: number;
  isPrimary: boolean;
  /** Guided capture angle, e.g. "Front 3/4", "Odometer", "Engine bay". */
  angle?: string;
}

export interface InspectionItem {
  id: string;
  label: string;
  severity: ItemSeverity;
  note?: string;
  photoUrls?: string[];
}

export interface InspectionCategory {
  id: string;
  name: string;
  slug: string;
  /** 0–10 */
  score: number;
  /** Contribution to the weighted overall score. Sums to 1 across categories. */
  weight: number;
  itemsTotal: number;
  itemsPassed: number;
  items: InspectionItem[];
}

export interface Inspection {
  id: string;
  reference: string;
  publicToken: string;
  listingId?: string;
  packageId: InspectionPackageId;
  status: InspectionStatus;
  city: string;
  isDoorstep: boolean;
  inspectorName?: string;
  scheduledAt?: string;
  completedAt?: string;
  /** 0–10, weighted across categories. */
  overallScore: number;
  grade: InspectionGrade;
  checkpointsTotal: number;
  checkpointsPassed: number;
  summary: string;
  price: number;
  categories: InspectionCategory[];
}

/**
 * Public auction shape. Note what is NOT here: `reservePrice` and
 * `leaderMaxBid` never cross the network boundary. Only `reserveStatus` does.
 */
export interface AuctionPublic {
  id: string;
  status: AuctionStatus;
  startingPrice: number;
  currentPrice: number;
  bidCount: number;
  bidderCount: number;
  startsAt: string;
  endsAt: string;
  originalEndsAt: string;
  extensionCount: number;
  reserveStatus: ReserveStatus;
  leaderHandle?: string;
  soldPrice?: number;
}

/** Server-internal auction shape. Never serialise this to a client component. */
export interface AuctionInternal extends AuctionPublic {
  reservePrice?: number;
  leaderId?: string;
  leaderMaxBid?: number;
}

export interface Bid {
  id: string;
  auctionId: string;
  bidderHandle: string;
  amount: number;
  isAutoBid: boolean;
  status: BidStatus;
  placedAt: string;
}

export interface Listing {
  id: string;
  slug: string;
  type: ListingType;
  status: ListingStatus;
  title: string;
  description: string;

  // identity
  make: string;
  model: string;
  variant: string;
  year: number;
  registrationCity: string;
  registrationYear?: number;
  chassisNumber?: string;

  // condition
  mileageKm: number;
  transmission: Transmission;
  fuelType: FuelType;
  bodyType: BodyType;
  assembly: Assembly;
  engineCc: number;
  colour: string;
  ownersCount: number;

  // disclosure
  hasAccidentHistory: boolean;
  accidentNotes?: string;
  hasFloodDamage: boolean;
  serviceHistoryAvailable: boolean;
  auctionSheetGrade?: string;

  // classified pricing
  askingPrice?: number;
  isNegotiable: boolean;

  // features
  features: string[];

  // relations
  images: ListingImage[];
  seller: PublicUser;
  auction?: AuctionPublic;
  inspection?: Inspection;

  // meta
  viewCount: number;
  watchCount: number;
  isFeatured: boolean;
  publishedAt: string;
}

/** Trimmed shape used in grids — keeps RSC payloads small. */
export interface ListingCard {
  id: string;
  slug: string;
  type: ListingType;
  title: string;
  make: string;
  model: string;
  year: number;
  mileageKm: number;
  registrationCity: string;
  transmission: Transmission;
  fuelType: FuelType;
  bodyType: BodyType;
  image: string;
  imageAlt: string;
  askingPrice?: number;
  auction?: AuctionPublic;
  isCertified: boolean;
  inspectionScore?: number;
  inspectionGrade?: InspectionGrade;
  isFeatured: boolean;
  watchCount: number;
}

export interface Offer {
  id: string;
  listingId: string;
  buyerHandle: string;
  amount: number;
  status: OfferStatus;
  message?: string;
  createdAt: string;
  expiresAt: string;
}

/* -------------------------------------------------------------------------- */
/* Query / filter contracts                                                   */
/* -------------------------------------------------------------------------- */

export type SortKey =
  | "ending"
  | "newest"
  | "price_asc"
  | "price_desc"
  | "mileage"
  | "score";

export interface ListingQuery {
  q?: string;
  type?: ListingType;
  status?: "live" | "upcoming" | "ended";
  make?: string[];
  model?: string[];
  city?: string[];
  bodyType?: BodyType[];
  fuelType?: FuelType[];
  transmission?: Transmission[];
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  mileageMax?: number;
  certified?: boolean;
  noReserve?: boolean;
  sort?: SortKey;
  page?: number;
  perPage?: number;
}

export interface Paginated<T> {
  data: T[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

export interface PlatformStats {
  liveAuctions: number;
  carsSold: number;
  inspectionsCompleted: number;
  registeredBidders: number;
  gmvThisMonth: number;
  averageSellThrough: number;
}
