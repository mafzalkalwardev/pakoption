import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Messages" };

const THREADS = [
  {
    name: "Gulberg Auto Gallery",
    lot: "2021 Kia Sportage Alpha 2.0",
    preview:
      "Yes, the service book is stamped up to 40,000 km. Happy for you to bring your own mechanic before the auction closes.",
    time: "2h ago",
    unread: true,
  },
  {
    name: "Sana Iqbal",
    lot: "2022 Honda City Aspire 1.5 CVT",
    preview:
      "Thanks for the inspection report — the advisory on the front pads is fine, I'll factor it in.",
    time: "Yesterday",
    unread: false,
  },
  {
    name: "PakOption Support",
    lot: "Inspection PO-INS-2026-48120",
    preview:
      "Your technician Adnan Yousaf will arrive between 11:00 and 13:00 tomorrow.",
    time: "2 days ago",
    unread: false,
  },
];

export default function MessagesPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-ivory">
        Messages
      </h1>
      <p className="mt-1.5 text-[14px] text-muted">
        All conversations stay on-platform until a sale completes. Phone numbers
        in messages are automatically removed.
      </p>

      <div className="mt-6 divide-y divide-line overflow-hidden rounded-lg border border-line">
        {THREADS.map((t) => (
          <button
            key={t.name}
            type="button"
            className="flex w-full gap-4 bg-surface p-5 text-left transition-colors hover:bg-surface-2"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-full border border-line bg-ink-2 text-[15px] font-semibold text-brand-400">
              {t.name.charAt(0)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold text-ivory">
                    {t.name}
                  </span>
                  {t.unread && <Badge variant="solid" size="sm">New</Badge>}
                </span>
                <span className="shrink-0 text-[12px] text-muted-2">
                  {t.time}
                </span>
              </span>
              <span className="mt-0.5 block text-[12.5px] text-brand-400">
                {t.lot}
              </span>
              <span className="mt-1.5 block line-clamp-2 text-[13px] leading-relaxed text-muted">
                {t.preview}
              </span>
            </span>
          </button>
        ))}
      </div>

      <p className="mt-5 flex items-start gap-2.5 rounded-lg border border-line bg-ink-2 p-4 text-[12.5px] leading-relaxed text-muted">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-500" aria-hidden />
        <span>
          Keeping conversation on-platform means there is a record if a dispute
          arises. Sellers who push you to WhatsApp before a sale are a red flag —
          report them.
        </span>
      </p>
    </div>
  );
}
