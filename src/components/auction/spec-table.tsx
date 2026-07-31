import {
  AlertTriangle,
  Calendar,
  Check,
  Droplets,
  Fuel,
  Gauge,
  MapPin,
  Palette,
  Settings2,
  Users,
  Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  formatEngine,
  formatMileage,
  label,
  maskChassis,
} from "@/lib/format";
import type { Listing } from "@/types";

export function SpecTable({ listing }: { listing: Listing }) {
  const specs = [
    { Icon: Calendar, k: "Model year", v: String(listing.year) },
    { Icon: Gauge, k: "Mileage", v: formatMileage(listing.mileageKm) },
    { Icon: Settings2, k: "Transmission", v: label(listing.transmission) },
    { Icon: Fuel, k: "Fuel type", v: label(listing.fuelType) },
    { Icon: Wrench, k: "Engine", v: formatEngine(listing.engineCc) },
    { Icon: Palette, k: "Colour", v: listing.colour },
    { Icon: MapPin, k: "Registered in", v: listing.registrationCity },
    { Icon: Users, k: "Owners", v: String(listing.ownersCount) },
    { Icon: Droplets, k: "Body type", v: label(listing.bodyType) },
    { Icon: Wrench, k: "Assembly", v: label(listing.assembly) },
  ];

  if (listing.auctionSheetGrade) {
    specs.push({
      Icon: Check,
      k: "Auction sheet",
      v: `Grade ${listing.auctionSheetGrade}`,
    });
  }
  if (listing.chassisNumber) {
    specs.push({
      Icon: Check,
      k: "Chassis",
      v: maskChassis(listing.chassisNumber),
    });
  }

  return (
    <div className="space-y-6">
      <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {specs.map(({ Icon, k, v }) => (
          <div key={k} className="flex items-center gap-3 bg-surface px-4 py-3.5">
            <Icon className="size-4 shrink-0 text-muted-2" aria-hidden />
            <div className="min-w-0">
              <dt className="text-[11px] uppercase tracking-[0.1em] text-muted-2">
                {k}
              </dt>
              <dd className="mt-0.5 truncate text-[14px] font-medium text-ivory">
                {v}
              </dd>
            </div>
          </div>
        ))}
      </dl>

      {/* disclosure */}
      <div
        className={
          listing.hasAccidentHistory || listing.hasFloodDamage
            ? "rounded-lg border border-gold/35 bg-gold/8 p-5"
            : "rounded-lg border border-brand-700 bg-brand-900/35 p-5"
        }
      >
        <h3 className="flex items-center gap-2 text-[14px] font-semibold text-ivory">
          {listing.hasAccidentHistory || listing.hasFloodDamage ? (
            <>
              <AlertTriangle className="size-4 text-gold" aria-hidden />
              Seller disclosure
            </>
          ) : (
            <>
              <Check className="size-4 text-brand-400" aria-hidden />
              Seller disclosure — clean
            </>
          )}
        </h3>

        <ul className="mt-3 space-y-2 text-[13.5px] leading-relaxed text-muted">
          <li className="flex gap-2">
            <span className="text-muted-2">Accident history:</span>
            <span className={listing.hasAccidentHistory ? "text-gold-soft" : "text-brand-300"}>
              {listing.hasAccidentHistory ? "Declared" : "None declared"}
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-muted-2">Flood damage:</span>
            <span className={listing.hasFloodDamage ? "text-danger-soft" : "text-brand-300"}>
              {listing.hasFloodDamage ? "Declared" : "None declared"}
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-muted-2">Service history:</span>
            <span className="text-ivory">
              {listing.serviceHistoryAvailable ? "Available" : "Not available"}
            </span>
          </li>
        </ul>

        {listing.accidentNotes && (
          <p className="mt-3 border-t border-gold/25 pt-3 text-[13px] leading-relaxed text-ivory">
            {listing.accidentNotes}
          </p>
        )}
      </div>

      {/* features */}
      {listing.features.length > 0 && (
        <div>
          <h3 className="text-[14px] font-semibold text-ivory">Features</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {listing.features.map((f) => (
              <Badge key={f} variant="default">
                <Check aria-hidden />
                {f}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
