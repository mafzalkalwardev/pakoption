import { Hero } from "@/components/home/hero";
import {
  CategoryGrid,
  FeaturedAuctions,
  FinalCTA,
  HowItWorks,
  InspectionShowcase,
  LiveTicker,
  Testimonials,
} from "@/components/home/sections";
import {
  getLiveAuctions,
  getStats,
  getTestimonials,
} from "@/lib/db/repository";

export const revalidate = 60;

export default async function HomePage() {
  const [stats, live, testimonials] = await Promise.all([
    getStats(),
    getLiveAuctions(12),
    getTestimonials(),
  ]);

  return (
    <>
      <Hero stats={stats} />
      <LiveTicker listings={live.slice(0, 10)} />
      <FeaturedAuctions listings={live.slice(0, 6)} />
      <CategoryGrid />
      <HowItWorks />
      <InspectionShowcase />
      <Testimonials items={testimonials} />
      <FinalCTA />
    </>
  );
}
