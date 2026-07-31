import Link from "next/link";
import {
  Gavel,
  Heart,
  LayoutDashboard,
  MessageSquare,
  Search,
  Settings,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";

const NAV = [
  { href: "/dashboard", label: "Overview", Icon: LayoutDashboard },
  { href: "/dashboard/bids", label: "My bids", Icon: Gavel },
  { href: "/dashboard/listings", label: "My listings", Icon: Tag },
  { href: "/dashboard/watchlist", label: "Watchlist", Icon: Heart },
  { href: "/dashboard/inspections", label: "Inspections", Icon: ShieldCheck },
  { href: "/dashboard/searches", label: "Saved searches", Icon: Search },
  { href: "/dashboard/messages", label: "Messages", Icon: MessageSquare },
  { href: "/dashboard/settings", label: "Settings", Icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title="Welcome back, Afzal"
        description="Everything you're bidding on, selling, watching and waiting for — in one place."
      />

      <div className="container-page py-8 md:py-10">
        <div className="flex gap-8">
          {/* side nav */}
          <nav
            className="sticky top-24 hidden h-fit w-56 shrink-0 lg:block"
            aria-label="Dashboard"
          >
            <ul className="space-y-1">
              {NAV.map(({ href, label, Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="flex items-center gap-3 rounded-md px-3 py-2.5 text-[13.5px] text-muted transition-colors hover:bg-surface-2 hover:text-ivory"
                  >
                    <Icon className="size-4 shrink-0" aria-hidden />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* mobile nav */}
          <div className="no-scrollbar -mx-5 mb-6 flex gap-2 overflow-x-auto px-5 lg:hidden">
            {NAV.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 text-[13px] text-muted transition-colors hover:border-brand-700 hover:text-ivory"
              >
                <Icon className="size-3.5" aria-hidden />
                {label}
              </Link>
            ))}
          </div>

          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </>
  );
}
