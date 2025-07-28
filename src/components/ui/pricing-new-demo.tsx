"use client";

import { Pricing } from "@/components/ui/pricing-new";

const wavtrackPlans = [
  {
    name: "STARTER",
    price: "9.99",
    yearlyPrice: "8",
    period: "per month",
    features: [
      "10 projects per month",
      "Basic audio analysis",
      "Pomodoro timer",
      "Session tracking",
      "AI goal suggestions",
      "Community support",
    ],
    description: "Perfect for beginners starting their music journey",
    buttonText: "Start Free Trial",
    href: "/auth/login",
    isPopular: false,
  },
  {
    name: "PRODUCER",
    price: "19.99",
    yearlyPrice: "16",
    period: "per month",
    features: [
      "Unlimited projects",
      "Advanced audio analysis",
      "Custom timer sessions",
      "AI coaching",
      "Productivity analytics",
      "Session goals tracking",
      "Priority support",
    ],
    description: "Ideal for serious producers and growing artists",
    buttonText: "Get Started",
    href: "/auth/login",
    isPopular: true,
  },
  {
    name: "STUDIO",
    price: "49.99",
    yearlyPrice: "40",
    period: "per month",
    features: [
      "Everything in Producer",
      "Multi-user access",
      "Advanced analytics",
      "Custom branding",
      "API access",
      "Dedicated support",
      "Workflow automation",
    ],
    description: "For professional studios and large organizations",
    buttonText: "Contact Sales",
    href: "/contact",
    isPopular: false,
  },
];

function PricingNewDemo() {
  return (
    <div className="h-[800px] overflow-y-auto rounded-lg">
      <Pricing 
        plans={wavtrackPlans}
        title="Plans that Scale with Your Music"
        description="Choose the plan that fits your production workflow\nAll plans include audio analysis, session tracking, and AI-powered insights."
      />
    </div>
  );
}

export { PricingNewDemo }; 