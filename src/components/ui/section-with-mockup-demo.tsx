"use client";

import SectionWithMockup from "@/components/ui/section-with-mockup";

const yearInReviewData = {
  title: (
    <>
      Your Music Production
      <br />
      Journey, Visualized.
    </>
  ),
  description: (
    <>
      Track your progress with our Year in Review feature.
      <br />
      Get detailed insights into your beats, completed projects,
      <br />
      studio time, and top genres. Share your achievements
      <br />
      and export your stats to keep track of your growth.
    </>
  ),
  primaryImageSrc: "/images/features/year-in-review-primary.png",
  secondaryImageSrc: "/images/features/year-in-review-secondary.png",
};

export function YearInReviewSection() {
  return <SectionWithMockup {...yearInReviewData} />;
} 