"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronRight,
  Gavel,
  Heart,
  Menu,
  Plus,
  Search,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/components/motion/motion-provider";
import { NAV_LINKS, POPULAR_SEARCHES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the drawer on navigation.
  React.useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // Lock scroll while the drawer is open.
  React.useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // ⌘K / Ctrl+K opens search.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-brand-500 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink"
      >
        Skip to content
      </a>

      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300",
          scrolled
            ? "border-b border-line bg-ink/85 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <nav
          className="container-page flex h-16 items-center gap-3 md:h-18"
          aria-label="Primary"
        >
          <Link
            href="/"
            className="shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          >
            <Logo />
          </Link>

          {/* desktop links */}
          <ul className="ml-4 hidden items-center gap-0.5 lg:flex">
            {NAV_LINKS.map((link) => {
              const active =
                pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "relative rounded-md px-3.5 py-2 text-sm font-medium transition-colors",
                      active
                        ? "text-ivory"
                        : "text-muted hover:text-ivory",
                    )}
                  >
                    {link.label}
                    {active && (
                      <motion.span
                        layoutId={reduced ? undefined : "nav-underline"}
                        className="absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full bg-brand-400"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden items-center gap-2 rounded-md border border-line bg-surface/70 py-2 pl-3 pr-2 text-sm text-muted-2 transition-colors hover:border-line-strong hover:text-muted md:flex"
              aria-label="Search cars"
            >
              <Search className="size-4" aria-hidden />
              <span className="w-32 text-left">Search cars…</span>
              <kbd className="rounded border border-line bg-ink-2 px-1.5 py-0.5 font-mono text-[10px] text-muted-2">
                ⌘K
              </kbd>
            </button>

            <Button
              variant="ghost"
              size="icon-sm"
              asChild
              className="hidden sm:inline-flex"
            >
              <Link href="/dashboard/watchlist" aria-label="Watchlist">
                <Heart />
              </Link>
            </Button>

            <Button
              variant="outline"
              size="sm"
              asChild
              className="hidden sm:inline-flex"
            >
              <Link href="/login">
                <User />
                Sign in
              </Link>
            </Button>

            <Button size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/sell/new">
                <Plus />
                Sell your car
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="icon-sm"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
            >
              <Menu />
            </Button>
          </div>
        </nav>
      </header>

      {/* ---------------- Mobile drawer ---------------- */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[60] bg-ink/85 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="fixed inset-y-0 right-0 z-[61] flex w-[min(22rem,88vw)] flex-col border-l border-line bg-surface lg:hidden"
              initial={reduced ? false : { x: "100%" }}
              animate={{ x: 0 }}
              exit={reduced ? undefined : { x: "100%" }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
            >
              <div className="flex h-16 items-center justify-between border-b border-line px-5">
                <Logo markClassName="size-8" />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                >
                  <X />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                <ul className="space-y-1">
                  {NAV_LINKS.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="flex items-center justify-between rounded-md px-3 py-3 text-[15px] font-medium text-ivory transition-colors hover:bg-surface-2"
                      >
                        {link.label}
                        <ChevronRight className="size-4 text-muted-2" />
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className="my-5 h-px bg-line" />

                <ul className="space-y-1">
                  <li>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 rounded-md px-3 py-3 text-[15px] text-muted transition-colors hover:bg-surface-2 hover:text-ivory"
                    >
                      <User className="size-4" />
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/dashboard/watchlist"
                      className="flex items-center gap-3 rounded-md px-3 py-3 text-[15px] text-muted transition-colors hover:bg-surface-2 hover:text-ivory"
                    >
                      <Heart className="size-4" />
                      Watchlist
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/dashboard/bids"
                      className="flex items-center gap-3 rounded-md px-3 py-3 text-[15px] text-muted transition-colors hover:bg-surface-2 hover:text-ivory"
                    >
                      <Gavel className="size-4" />
                      My bids
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/inspection/book"
                      className="flex items-center gap-3 rounded-md px-3 py-3 text-[15px] text-muted transition-colors hover:bg-surface-2 hover:text-ivory"
                    >
                      <ShieldCheck className="size-4" />
                      Book an inspection
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="space-y-2 border-t border-line p-5">
                <Button className="w-full" asChild>
                  <Link href="/sell/new">
                    <Plus />
                    Sell your car
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ---------------- Search palette ---------------- */}
      <AnimatePresence>
        {searchOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[70] bg-ink/85 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setSearchOpen(false)}
            />
            <motion.div
              className="fixed left-1/2 top-[12vh] z-[71] w-[min(40rem,92vw)] -translate-x-1/2"
              initial={reduced ? false : { opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? undefined : { opacity: 0, y: -8, scale: 0.99 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              role="dialog"
              aria-modal="true"
              aria-label="Search"
            >
              <form
                action="/auctions"
                className="edge-light overflow-hidden rounded-xl border border-line-strong bg-surface shadow-lift"
              >
                <div className="flex items-center gap-3 border-b border-line px-4">
                  <Search className="size-5 shrink-0 text-muted-2" aria-hidden />
                  <input
                    name="q"
                    autoFocus
                    placeholder="Search by make, model or city…"
                    className="h-14 flex-1 bg-transparent text-[15px] text-ivory outline-none placeholder:text-muted-2"
                  />
                  <kbd className="rounded border border-line bg-ink-2 px-1.5 py-0.5 font-mono text-[10px] text-muted-2">
                    ESC
                  </kbd>
                </div>
                <div className="p-4">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
                    Popular searches
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SEARCHES.map((term) => (
                      <Link
                        key={term}
                        href={`/auctions?q=${encodeURIComponent(term)}`}
                        className="rounded-full border border-line bg-ink-2 px-3 py-1.5 text-[13px] text-muted transition-colors hover:border-brand-700 hover:text-ivory"
                      >
                        {term}
                      </Link>
                    ))}
                  </div>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
