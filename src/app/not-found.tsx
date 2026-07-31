import Link from "next/link";
import { ArrowLeft, Gavel, Search } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[70dvh] flex-col items-center justify-center py-20 text-center">
      <LogoMark className="size-14 opacity-50" />

      <p className="mt-8 font-mono text-[clamp(3rem,12vw,7rem)] font-bold leading-none tracking-tighter text-line-strong">
        404
      </p>

      <h1 className="mt-4 text-2xl font-bold tracking-[-0.03em] text-ivory">
        This lot doesn&rsquo;t exist
      </h1>
      <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-muted">
        It may have sold and been archived, or the link may be wrong. Either way,
        there are around 1,200 other lots running right now.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/auctions">
            <Gavel />
            Browse live auctions
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/buy">
            <Search />
            Search classifieds
          </Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/">
            <ArrowLeft />
            Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
