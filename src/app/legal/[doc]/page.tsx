import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";

const DOCS: Record<
  string,
  { title: string; updated: string; sections: { h: string; p: string[] }[] }
> = {
  terms: {
    title: "Terms of service",
    updated: "31 July 2026",
    sections: [
      {
        h: "1. Who we are",
        p: [
          "PakOption operates an online marketplace connecting buyers and sellers of motor vehicles in Pakistan, and provides third-party vehicle inspection services. We are a marketplace and a service provider. We are not a party to the sale contract between a buyer and a seller.",
        ],
      },
      {
        h: "2. Eligibility",
        p: [
          "You must be at least 18 years old and legally able to enter into a contract. You must verify your mobile number before placing a bid, and verify your CNIC before bidding on lots above PKR 5,000,000.",
          "One account per person. Accounts created to place bids on your own listings, or on behalf of a seller, will be terminated and any affected auctions voided.",
        ],
      },
      {
        h: "3. Bids are binding",
        p: [
          "A bid is a binding offer to purchase at that price. Bids cannot be retracted. If you win a lot and fail to complete, your deposit is forfeited, a strike is recorded against your account, and three strikes result in permanent suspension.",
          "PakOption may reverse a bid only where fraud, a platform malfunction or a manifest error is established. Every reversal is recorded in an audit log.",
        ],
      },
      {
        h: "4. Seller obligations",
        p: [
          "You must have clear legal title to the vehicle and the right to sell it. You must disclose accident history, flood damage and any known material defect. The disclosure attestation you sign at listing is a contractual representation.",
          "Undisclosed damage discovered during inspection or after sale voids the sale, forfeits your listing fee, and may result in permanent suspension and referral to the relevant authorities.",
        ],
      },
      {
        h: "5. Fees",
        p: [
          "Listing fees, success fees, buyer's premium and inspection charges are published at /pricing and form part of these terms. Fees may change with 30 days' notice; changes do not apply to listings already live.",
        ],
      },
      {
        h: "6. Inspection scope and limitation",
        p: [
          "An inspection report records the vehicle's condition at the time and place of inspection. It is a visual and diagnostic assessment. It is not a warranty, a guarantee, a mechanical certification, or a statement of future reliability, and it does not cover defects that are not detectable without dismantling.",
          "Our liability in relation to any inspection is limited to the fee paid for that inspection, except where liability cannot be limited by law.",
        ],
      },
      {
        h: "7. Payments and settlement",
        p: [
          "PakOption does not currently hold sale funds in escrow. Deposits are processed by a licensed payment provider. The balance of the purchase price is settled directly between buyer and seller at handover.",
        ],
      },
      {
        h: "8. Prohibited conduct",
        p: [
          "Shill bidding, bid shielding, off-platform solicitation before a sale completes, posting contact details in listing text, misrepresenting a vehicle, and using another person's identity are all prohibited and result in suspension.",
        ],
      },
      {
        h: "9. Governing law",
        p: [
          "These terms are governed by the laws of the Islamic Republic of Pakistan. Disputes are subject to the exclusive jurisdiction of the courts of Karachi.",
        ],
      },
    ],
  },
  privacy: {
    title: "Privacy policy",
    updated: "31 July 2026",
    sections: [
      {
        h: "What we collect",
        p: [
          "Account data (name, email, mobile number, city), verification data (CNIC — stored as a one-way hash plus the last four digits only), listing and bidding activity, inspection records, messages sent through the platform, and standard technical data such as IP address and device fingerprint used for fraud detection.",
        ],
      },
      {
        h: "What we never store",
        p: [
          "We do not store your full CNIC number, your card details, or your password in plain text. Card data is handled entirely by our licensed payment provider and never touches our servers.",
        ],
      },
      {
        h: "How we use it",
        p: [
          "To operate the marketplace, verify identity, detect fraud including shill bidding, deliver inspection reports, send transactional notifications you have opted into, and meet legal and tax obligations.",
          "We do not sell your personal data. We do not show advertising based on your bidding behaviour.",
        ],
      },
      {
        h: "Who sees what",
        p: [
          "Other users see only your public handle (for example, bidder_4f9a), your city, your rating and your sales count. Your name and contact details are revealed to a counterparty only after a sale completes and a deposit is paid.",
        ],
      },
      {
        h: "Retention",
        p: [
          "Inspection photographs are retained for three years to support the liability window. Messages are retained for two years after a conversation closes. Bid records are retained indefinitely, anonymised if you delete your account. Financial records are retained as required by statute.",
        ],
      },
      {
        h: "Your rights",
        p: [
          "You may request a copy of your data, correct it, or request deletion. Deleting your account scrubs your personal data and anonymises your bid history; records we are legally required to keep are retained.",
        ],
      },
    ],
  },
  "auction-rules": {
    title: "Auction rules",
    updated: "31 July 2026",
    sections: [
      {
        h: "Proxy bidding",
        p: [
          "You submit a maximum bid. The system bids on your behalf in the minimum increments necessary to keep you in the lead, up to but never above your maximum. You may pay less than your maximum; you will never pay more.",
          "If two bidders submit the same maximum, the earlier bid wins and retains the lead.",
        ],
      },
      {
        h: "Bid increments",
        p: [
          "Below PKR 500,000: PKR 5,000. PKR 500,000 to 1,999,999: PKR 10,000. PKR 2,000,000 to 4,999,999: PKR 25,000. PKR 5,000,000 to 9,999,999: PKR 50,000. PKR 10,000,000 and above: PKR 100,000.",
        ],
      },
      {
        h: "Reserve price",
        p: [
          "A seller may set a hidden reserve. Bidders are shown only whether the reserve has been met, never the amount. A lot marked 'No reserve' sells to the highest bidder regardless of price.",
        ],
      },
      {
        h: "Soft close",
        p: [
          "Any bid placed within the final three minutes extends the auction end time to three minutes from the moment of that bid. There is no limit on the number of extensions. Sniping confers no advantage.",
        ],
      },
      {
        h: "Reserve not met",
        p: [
          "Where bidding ends below the reserve, the highest bidder has 24 hours to submit a best offer. The seller then has 24 hours to accept, decline or counter. If no agreement is reached, the seller may relist once at no charge within 14 days.",
        ],
      },
      {
        h: "Buyer's premium",
        p: [
          "2% of the hammer price, subject to a minimum of PKR 15,000 and a maximum of PKR 200,000, payable by the buyer in addition to the hammer price. The exact amount is displayed before every bid confirmation.",
        ],
      },
      {
        h: "Completion",
        p: [
          "The winning bidder must pay the deposit within 24 hours of the auction closing. Contact details unlock on payment. Both parties then complete the transfer checklist. Failure to complete forfeits the deposit and records a strike.",
        ],
      },
      {
        h: "Shill bidding",
        p: [
          "Bidding on your own lot, or arranging for another person to do so, is prohibited. We analyse the bidder–seller relationship graph, device fingerprints and IP addresses. Detected shill bidding voids the auction retroactively and results in permanent suspension of every account involved.",
        ],
      },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(DOCS).map((doc) => ({ doc }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ doc: string }>;
}): Promise<Metadata> {
  const { doc } = await params;
  const entry = DOCS[doc];
  return { title: entry?.title ?? "Legal" };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ doc: string }>;
}) {
  const { doc } = await params;
  const entry = DOCS[doc];
  if (!entry) notFound();

  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title={entry.title}
        description={`Last updated ${entry.updated}`}
      />

      <article className="container-page max-w-3xl py-14">
        {entry.sections.map((s) => (
          <section key={s.h} className="mb-10">
            <h2 className="text-[17px] font-semibold tracking-tight text-ivory">
              {s.h}
            </h2>
            {s.p.map((para, i) => (
              <p
                key={i}
                className="mt-3 text-[15px] leading-relaxed text-muted"
              >
                {para}
              </p>
            ))}
          </section>
        ))}

        <p className="mt-14 rounded-lg border border-line bg-ink-2 p-5 text-[12.5px] leading-relaxed text-muted-2">
          This document is provided for information. It is a template drafted for
          a product build and has not been reviewed by a qualified lawyer in
          Pakistan. Have it reviewed by counsel before relying on it commercially.
        </p>
      </article>
    </>
  );
}
