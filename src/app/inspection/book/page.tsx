import type { Metadata } from "next";
import { withCanonical } from "@/lib/seo";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { BookingFlow } from "@/components/inspection/booking-flow";

export const metadata: Metadata = withCanonical("/inspection/book", {
  title: "Book a car inspection",
  description:
    "Four-step booking flow: package, city, doorstep or service centre, schedule, and confirm.",
});

export default function BookInspectionPage() {
  return (
    <>
      <PageHeader
        eyebrow="Booking"
        title="Book an inspection"
        description="Four steps, about two minutes. You'll get the technician's name and an arrival window as soon as we confirm."
      />
      <div className="container-page py-10 md:py-14">
        <Suspense fallback={null}>
          <BookingFlow />
        </Suspense>
      </div>
    </>
  );
}
