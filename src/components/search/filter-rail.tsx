"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Filter, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Checkbox, Separator, Switch } from "@/components/ui/primitives";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  BODY_TYPES,
  CITIES,
  FUEL_TYPES,
  MAKES,
  TRANSMISSIONS,
} from "@/lib/constants";
import { formatPKRShort } from "@/lib/format";
import { cn } from "@/lib/utils";

const SORTS = [
  { value: "ending", label: "Ending soonest" },
  { value: "newest", label: "Newest model" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "mileage", label: "Lowest mileage" },
  { value: "score", label: "Best inspection score" },
] as const;

function useFilterState() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const get = React.useCallback((k: string) => params.get(k) ?? "", [params]);
  const getAll = React.useCallback(
    (k: string) => params.getAll(k),
    [params],
  );

  const update = React.useCallback(
    (mutate: (p: URLSearchParams) => void) => {
      const next = new URLSearchParams(params.toString());
      mutate(next);
      next.delete("page");
      router.push(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [params, pathname, router],
  );

  const toggle = React.useCallback(
    (key: string, value: string) => {
      update((p) => {
        const current = p.getAll(key);
        p.delete(key);
        const next = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value];
        next.forEach((v) => p.append(key, v));
      });
    },
    [update],
  );

  const set = React.useCallback(
    (key: string, value: string) => {
      update((p) => {
        if (value) p.set(key, value);
        else p.delete(key);
      });
    },
    [update],
  );

  const clear = React.useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [pathname, router]);

  const activeCount = React.useMemo(() => {
    let n = 0;
    params.forEach((_, key) => {
      if (key !== "sort" && key !== "page") n++;
    });
    return n;
  }, [params]);

  return { get, getAll, set, toggle, clear, activeCount, params };
}

/* -------------------------------------------------------------------------- */

function FilterGroup({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className="border-b border-line pb-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ivory">
          {title}
        </span>
        <span className="text-muted-2">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="mt-3.5 space-y-2.5">{children}</div>}
    </div>
  );
}

function CheckRow({
  checked,
  onChange,
  label: text,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  const id = React.useId();
  return (
    <div className="flex items-center gap-2.5">
      <Checkbox id={id} checked={checked} onCheckedChange={onChange} />
      <label
        htmlFor={id}
        className="flex-1 cursor-pointer text-[13.5px] text-muted transition-colors hover:text-ivory"
      >
        {text}
      </label>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function FilterBody() {
  const { get, getAll, set, toggle, clear, activeCount } = useFilterState();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-semibold text-ivory">
          <SlidersHorizontal className="size-4 text-brand-400" aria-hidden />
          Filters
          {activeCount > 0 && (
            <Badge variant="solid" size="sm">
              {activeCount}
            </Badge>
          )}
        </span>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clear}>
            <RotateCcw />
            Reset
          </Button>
        )}
      </div>

      <Separator />

      <FilterGroup title="Trust">
        <div className="flex items-center justify-between">
          <label htmlFor="f-certified" className="text-[13.5px] text-muted">
            Certified only
          </label>
          <Switch
            id="f-certified"
            checked={get("certified") === "1"}
            onCheckedChange={(v) => set("certified", v ? "1" : "")}
          />
        </div>
        <div className="flex items-center justify-between">
          <label htmlFor="f-noreserve" className="text-[13.5px] text-muted">
            No reserve lots
          </label>
          <Switch
            id="f-noreserve"
            checked={get("noReserve") === "1"}
            onCheckedChange={(v) => set("noReserve", v ? "1" : "")}
          />
        </div>
      </FilterGroup>

      <FilterGroup title="Price (PKR)">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="f-pmin" className="text-[11px] text-muted-2">
              Min
            </Label>
            <Input
              id="f-pmin"
              inputMode="numeric"
              placeholder="0"
              defaultValue={get("priceMin")}
              onBlur={(e) => set("priceMin", e.target.value)}
              className="h-9 text-[13px]"
            />
          </div>
          <div>
            <Label htmlFor="f-pmax" className="text-[11px] text-muted-2">
              Max
            </Label>
            <Input
              id="f-pmax"
              inputMode="numeric"
              placeholder="Any"
              defaultValue={get("priceMax")}
              onBlur={(e) => set("priceMax", e.target.value)}
              className="h-9 text-[13px]"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {[2_000_000, 5_000_000, 10_000_000, 20_000_000].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => set("priceMax", String(v))}
              className="rounded-full border border-line bg-ink-2 px-2.5 py-1 text-[11.5px] text-muted transition-colors hover:border-brand-700 hover:text-ivory"
            >
              under {formatPKRShort(v, false)}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Make">
        <div className="no-scrollbar max-h-56 space-y-2.5 overflow-y-auto pr-1">
          {MAKES.map((m) => (
            <CheckRow
              key={m}
              label={m}
              checked={getAll("make").includes(m)}
              onChange={() => toggle("make", m)}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Body type">
        {BODY_TYPES.map((b) => (
          <CheckRow
            key={b.value}
            label={b.label}
            checked={getAll("bodyType").includes(b.value)}
            onChange={() => toggle("bodyType", b.value)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Transmission" defaultOpen={false}>
        {TRANSMISSIONS.map((t) => (
          <CheckRow
            key={t.value}
            label={t.label}
            checked={getAll("transmission").includes(t.value)}
            onChange={() => toggle("transmission", t.value)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Fuel" defaultOpen={false}>
        {FUEL_TYPES.map((f) => (
          <CheckRow
            key={f.value}
            label={f.label}
            checked={getAll("fuelType").includes(f.value)}
            onChange={() => toggle("fuelType", f.value)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="City" defaultOpen={false}>
        <div className="no-scrollbar max-h-48 space-y-2.5 overflow-y-auto pr-1">
          {CITIES.map((c) => (
            <CheckRow
              key={c}
              label={c}
              checked={getAll("city").includes(c)}
              onChange={() => toggle("city", c)}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Year & mileage" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="f-ymin" className="text-[11px] text-muted-2">
              Year from
            </Label>
            <Input
              id="f-ymin"
              inputMode="numeric"
              placeholder="1990"
              defaultValue={get("yearMin")}
              onBlur={(e) => set("yearMin", e.target.value)}
              className="h-9 text-[13px]"
            />
          </div>
          <div>
            <Label htmlFor="f-ymax" className="text-[11px] text-muted-2">
              Year to
            </Label>
            <Input
              id="f-ymax"
              inputMode="numeric"
              placeholder="2026"
              defaultValue={get("yearMax")}
              onBlur={(e) => set("yearMax", e.target.value)}
              className="h-9 text-[13px]"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="f-km" className="text-[11px] text-muted-2">
            Max mileage (km)
          </Label>
          <Input
            id="f-km"
            inputMode="numeric"
            placeholder="Any"
            defaultValue={get("mileageMax")}
            onBlur={(e) => set("mileageMax", e.target.value)}
            className="h-9 text-[13px]"
          />
        </div>
      </FilterGroup>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export function FilterRail() {
  return (
    <aside
      className="sticky top-24 hidden max-h-[calc(100vh-8rem)] w-64 shrink-0 overflow-y-auto pr-2 xl:block"
      aria-label="Filters"
    >
      <FilterBody />
    </aside>
  );
}

export function MobileFilters() {
  const { activeCount } = useFilterState();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="xl:hidden">
          <Filter />
          Filters
          {activeCount > 0 && (
            <Badge variant="solid" size="sm">
              {activeCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-md">
        <DialogHeader>
          <DialogTitle>Filters</DialogTitle>
        </DialogHeader>
        <FilterBody />
      </DialogContent>
    </Dialog>
  );
}

export function SortBar({ total }: { total: number }) {
  const { get, set, getAll, toggle, clear, activeCount } = useFilterState();
  const sort = get("sort") || "ending";

  const chips: { key: string; value: string; text: string }[] = [];
  for (const key of ["make", "bodyType", "transmission", "fuelType", "city"]) {
    for (const v of getAll(key)) chips.push({ key, value: v, text: v });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13.5px] text-muted">
          <span className="font-mono font-semibold text-ivory tnum">{total}</span>{" "}
          {total === 1 ? "lot" : "lots"}
        </p>

        <div className="flex items-center gap-2">
          <MobileFilters />
          <label htmlFor="sort" className="sr-only">
            Sort by
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => set("sort", e.target.value)}
            className="h-9 rounded-md border border-line bg-ink-2 px-3 text-[13px] text-ivory transition-colors hover:border-line-strong focus-visible:border-brand-600 focus-visible:outline-none"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((c) => (
            <button
              key={`${c.key}-${c.value}`}
              type="button"
              onClick={() => toggle(c.key, c.value)}
              className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-surface-2 px-2.5 py-1 text-[12px] text-ivory transition-colors hover:border-danger/50 hover:text-danger-soft"
            >
              {c.text}
              <X className="size-3" aria-hidden />
              <span className="sr-only">Remove filter</span>
            </button>
          ))}
          {activeCount > 0 && (
            <button
              type="button"
              onClick={clear}
              className="text-[12px] text-muted-2 underline underline-offset-2 hover:text-ivory"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function EmptyState({ onReset }: { onReset?: () => void }) {
  return (
    <div className={cn("rounded-xl border border-dashed border-line bg-ink-2 p-16 text-center")}>
      <Filter className="mx-auto size-8 text-muted-2" aria-hidden />
      <h3 className="mt-4 text-lg font-semibold text-ivory">
        Nothing matches those filters
      </h3>
      <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-muted">
        Try widening the price range or removing a make. You can also save this
        search and we&rsquo;ll alert you when something matching arrives.
      </p>
      {onReset && (
        <Button variant="outline" className="mt-5" onClick={onReset}>
          <RotateCcw />
          Reset filters
        </Button>
      )}
    </div>
  );
}
