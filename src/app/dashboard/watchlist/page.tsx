import type { Metadata } from "next";
import Link from "next/link";
import { Heart } from "lucide-react";
import { ListingCard } from "@/components/auction/listing-card";
import { Button } from "@/components/ui/button";
import { getLiveAuctions } from "@/lib/db/repository";

export const metadata: Metadata = { title: "Watchlist" };
export const dynamic = "force-dynamic";

export default async function WatchlistPage() {
  const lots = await getLiveAuctions(6);

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-ivory">
        Watchlist
      </h1>
      <p className="mt-1.5 text-[14px] text-muted">
        We&rsquo;ll email you an hour before any of these close, and again the
        moment you&rsquo;re outbid.
      </p>

      {lots.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-line bg-ink-2 p-14 text-center">
          <Heart className="mx-auto size-8 text-muted-2" aria-hidden />
          <h2 className="mt-4 text-lg font-semibold text-ivory">
            Nothing here yet
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-muted">
            Tap the heart on any lot to keep an eye on it.
          </p>
          <Button className="mt-5" asChild>
            <Link href="/auctions">Browse auctions</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {lots.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}
