import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { BookingFlow } from "@/components/inspection/booking-flow";

export const metadata: Metadata = {
  title: "Book a car inspection",
  description:
    "Book a 212-point car inspection at your doorstep or at a PakOption service centre. Report in 45–60 minutes.",
};

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
