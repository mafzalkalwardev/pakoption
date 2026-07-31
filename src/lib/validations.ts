import { z } from "zod";
import { CITIES, COLOURS, INSPECTION_CITIES, MAKES } from "@/lib/constants";

const currentYear = new Date().getFullYear();

/* -------------------------------------------------------------------------- */
/* Listing wizard — one schema per step, composed at submit                    */
/* -------------------------------------------------------------------------- */

export const identitySchema = z.object({
  make: z.enum(MAKES as unknown as [string, ...string[]], {
    errorMap: () => ({ message: "Choose a make" }),
  }),
  model: z.string().min(1, "Choose a model"),
  variant: z.string().min(2, "Add the variant, e.g. “Altis Grande X”").max(60),
  year: z
    .number({ invalid_type_error: "Enter the model year" })
    .int()
    .min(1970, "Cars older than 1970 need manual review")
    .max(currentYear + 1, "That year hasn't happened yet"),
  registrationCity: z.enum(CITIES as unknown as [string, ...string[]], {
    errorMap: () => ({ message: "Choose the registration city" }),
  }),
});

export const conditionSchema = z.object({
  mileageKm: z
    .number({ invalid_type_error: "Enter the mileage" })
    .int()
    .min(0)
    .max(1_500_000, "That mileage looks wrong — check it"),
  transmission: z.enum(["MANUAL", "AUTOMATIC", "CVT", "DCT", "AMT"]),
  fuelType: z.enum(["PETROL", "DIESEL", "HYBRID", "ELECTRIC", "CNG", "LPG"]),
  bodyType: z.enum([
    "HATCHBACK",
    "SEDAN",
    "SUV",
    "CROSSOVER",
    "MPV",
    "PICKUP",
    "COUPE",
    "CONVERTIBLE",
    "WAGON",
    "VAN",
  ]),
  assembly: z.enum(["LOCAL", "IMPORTED"]),
  engineCc: z.number().int().min(0).max(8000),
  colour: z.enum(COLOURS as unknown as [string, ...string[]]),
  ownersCount: z.number().int().min(1).max(15),
  features: z.array(z.string()).default([]),
});

export const photosSchema = z.object({
  images: z
    .array(z.string())
    .min(8, "At least 8 photos — buyers skip listings with fewer")
    .max(30, "30 photos maximum"),
});

export const disclosureSchema = z
  .object({
    hasAccidentHistory: z.boolean(),
    accidentNotes: z.string().max(1000).optional(),
    hasFloodDamage: z.boolean(),
    serviceHistoryAvailable: z.boolean(),
    auctionSheetGrade: z.string().max(10).optional(),
    attestation: z.literal(true, {
      errorMap: () => ({
        message:
          "You must confirm the disclosure is accurate — undisclosed damage voids the sale",
      }),
    }),
  })
  .refine(
    (d) => !d.hasAccidentHistory || (d.accidentNotes?.trim().length ?? 0) >= 20,
    {
      message: "Describe the accident and the repair in at least 20 characters",
      path: ["accidentNotes"],
    },
  );

export const formatSchema = z
  .object({
    type: z.enum(["AUCTION", "CLASSIFIED"]),
    // auction
    startingPrice: z.number().int().min(50_000).optional(),
    reservePrice: z.number().int().min(0).optional(),
    durationDays: z.number().int().optional(),
    // classified
    askingPrice: z.number().int().min(50_000).optional(),
    isNegotiable: z.boolean().default(true),
  })
  .refine(
    (d) =>
      d.type !== "AUCTION" ||
      (d.startingPrice !== undefined && d.durationDays !== undefined),
    { message: "Set a starting bid and a duration", path: ["startingPrice"] },
  )
  .refine(
    (d) =>
      d.type !== "AUCTION" ||
      d.reservePrice === undefined ||
      d.reservePrice === 0 ||
      d.reservePrice >= (d.startingPrice ?? 0),
    {
      message: "The reserve cannot be below the starting bid",
      path: ["reservePrice"],
    },
  )
  .refine((d) => d.type !== "CLASSIFIED" || d.askingPrice !== undefined, {
    message: "Set an asking price",
    path: ["askingPrice"],
  });

export const descriptionSchema = z.object({
  title: z.string().min(10).max(120),
  description: z
    .string()
    .min(80, "Write at least a short paragraph — listings with detail sell faster")
    .max(6000)
    // Phone numbers in listing text are stripped so contact stays on-platform.
    .refine((s) => !/(\+92|0)?3\d{2}[\s-]?\d{7}/.test(s), {
      message:
        "Remove phone numbers — buyers must contact you through the platform",
    }),
});

export const listingSchema = identitySchema
  .merge(conditionSchema)
  .merge(photosSchema)
  .merge(descriptionSchema);

export type IdentityInput = z.infer<typeof identitySchema>;
export type ConditionInput = z.infer<typeof conditionSchema>;
export type DisclosureInput = z.infer<typeof disclosureSchema>;
export type FormatInput = z.infer<typeof formatSchema>;

/* -------------------------------------------------------------------------- */
/* Bidding                                                                    */
/* -------------------------------------------------------------------------- */

export const bidSchema = z.object({
  listingId: z.string().min(1),
  maxAmount: z
    .number({ invalid_type_error: "Enter your maximum bid" })
    .int("Bids must be whole rupees")
    .positive(),
});

export const offerSchema = z.object({
  listingId: z.string().min(1),
  amount: z.number().int().positive(),
  message: z.string().max(500).optional(),
});

/* -------------------------------------------------------------------------- */
/* Inspection                                                                 */
/* -------------------------------------------------------------------------- */

export const inspectionBookingSchema = z.object({
  packageId: z.enum(["BASIC", "STANDARD", "COMPREHENSIVE"]),
  city: z.enum(INSPECTION_CITIES as unknown as [string, ...string[]]),
  isDoorstep: z.boolean(),
  address: z.string().max(400).optional(),
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
  scheduledSlot: z.string().min(1, "Pick an arrival window"),
  name: z.string().min(2, "Enter your name").max(80),
  phone: z
    .string()
    .transform((s) => s.replace(/[\s-]/g, ""))
    .refine((s) => /^(\+92|0)3\d{9}$/.test(s), {
      message: "Enter a valid Pakistani mobile number",
    }),
  listingId: z.string().optional(),
  notes: z.string().max(500).optional(),
});

/* -------------------------------------------------------------------------- */
/* Auth                                                                       */
/* -------------------------------------------------------------------------- */

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "At least 8 characters"),
});

export const registerSchema = loginSchema
  .extend({
    name: z.string().min(2, "Enter your name").max(80),
    phone: z
      .string()
      .transform((s) => s.replace(/[\s-]/g, ""))
      .refine((s) => /^(\+92|0)3\d{9}$/.test(s), {
        message: "Enter a valid Pakistani mobile number",
      }),
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: "You must accept the terms to register" }),
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
