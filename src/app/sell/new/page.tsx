import type { Metadata } from "next";
import { withCanonical } from "@/lib/seo";
import { PageHeader } from "@/components/layout/page-header";
import { SellWizard } from "@/components/sell/wizard";

export const metadata: Metadata = withCanonical("/sell/new", {
  title: "Create a listing",
  description:
    "Seven-step listing wizard: vehicle, condition, photos, disclosure, format, inspection, and review.",
});

export default function NewListingPage() {
  return (
    <>
      <PageHeader
        eyebrow="New listing"
        title="Let's list your car"
        description="Seven steps, about six minutes. Everything saves as you go, so you can stop and come back."
      />
      <div className="container-page py-10 md:py-14">
        <SellWizard />
      </div>
    </>
  );
}
