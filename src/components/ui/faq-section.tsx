"use client";

import * as React from "react";
import { useState } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md p-1 text-muted-foreground",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border data-[state=active]:text-foreground",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

type ViewType = "general" | "features" | "billing";

interface FAQItem {
  question: string;
  answer: string;
  id: string;
}

interface FAQSection {
  category: string;
  items: FAQItem[];
}

interface FAQAccordionProps {
  category: string;
  items: FAQItem[];
}

const FAQ_SECTIONS: Record<ViewType, FAQSection> = {
  general: {
    category: "General",
    items: [
      {
        id: "what-is-wavtrack",
        question: "What is WavTrack?",
        answer:
          "WavTrack is a comprehensive music production platform that combines audio analysis, session tracking, and AI-powered insights to help producers optimize their workflow and improve their music.",
      },
      {
        id: "how-it-works",
        question: "How does WavTrack work?",
        answer:
          "WavTrack analyzes your audio files to extract key musical properties like BPM, key, energy, and danceability. It then tracks your production sessions and provides AI-powered suggestions to help you improve your workflow and music quality.",
      },
      {
        id: "supported-formats",
        question: "What audio formats does WavTrack support?",
        answer:
          "WavTrack supports all major audio formats including MP3, WAV, FLAC, AIFF, and more. We recommend using high-quality files (320kbps MP3 or lossless formats) for the best analysis results.",
      },
      {
        id: "daw-integration",
        question: "Does WavTrack integrate with my DAW?",
        answer:
          "Currently, WavTrack works as a web-based platform. You can upload your audio files for analysis and use our session tracking features. We're working on DAW plugin integrations for the future.",
      },
      {
        id: "mobile-support",
        question: "Is WavTrack available on mobile?",
        answer:
          "Yes! WavTrack is fully responsive and works great on mobile devices. You can analyze audio, track sessions, and view insights from your phone or tablet.",
      },
      {
        id: "data-privacy",
        question: "How do you handle my audio data and privacy?",
        answer:
          "Your audio files are processed securely and are not stored permanently. We only keep the analysis results to provide you with insights. Your data is never shared with third parties.",
      },
    ],
  },
  features: {
    category: "Features",
    items: [
      {
        id: "audio-analysis",
        question: "What audio properties does WavTrack analyze?",
        answer:
          "WavTrack analyzes BPM (tempo), musical key, energy levels, danceability, loudness, duration, and other musical characteristics to give you comprehensive insights about your tracks.",
      },
      {
        id: "session-tracking",
        question: "How does session tracking work?",
        answer:
          "WavTrack tracks your production sessions using a Pomodoro-style timer. It records your productivity patterns, session goals, and progress to help you optimize your workflow.",
      },
      {
        id: "ai-coaching",
        question: "What kind of AI suggestions does WavTrack provide?",
        answer:
          "Our AI analyzes your production patterns and provides personalized suggestions for improving your workflow, setting realistic goals, and optimizing your music production process.",
      },
      {
        id: "collaboration",
        question: "Can I collaborate with other producers?",
        answer:
          "Yes! WavTrack includes collaboration tools that let you share projects, compare analysis results, and work together with other producers in real-time.",
      },
      {
        id: "export-options",
        question: "What export options are available?",
        answer:
          "You can export your analysis reports as PDF, share insights via email, or integrate with other tools through our API. Premium plans include advanced export options.",
      },
    ],
  },
  billing: {
    category: "Billing & Plans",
    items: [
      {
        id: "free-trial",
        question: "Is there a free trial available?",
        answer:
          "Yes! We offer a free trial for all plans so you can experience WavTrack's full features before committing. No credit card required to start your trial.",
      },
      {
        id: "plan-differences",
        question: "What's the difference between the plans?",
        answer:
          "Starter includes basic analysis and 10 projects per month. Producer (our most popular) includes unlimited projects, advanced analysis, and AI coaching. Studio adds team features and API access.",
      },
      {
        id: "cancel-subscription",
        question: "Can I cancel my subscription anytime?",
        answer:
          "Absolutely! You can cancel your subscription at any time from your account settings. You'll continue to have access until the end of your current billing period.",
      },
      {
        id: "refund-policy",
        question: "What's your refund policy?",
        answer:
          "We offer a 30-day money-back guarantee. If you're not satisfied with WavTrack, contact our support team within 30 days of your purchase for a full refund.",
      },
      {
        id: "team-plans",
        question: "Do you offer team or enterprise plans?",
        answer:
          "Yes! Our Studio plan includes multi-user access and is perfect for teams and studios. For larger organizations, we offer custom enterprise plans with dedicated support.",
      },
    ],
  },
};

const FAQAccordion: React.FC<FAQAccordionProps> = ({ category, items }) => (
  <div className="">
    <Badge variant={"outline"} className="py-2 px-6 rounded-md">
      {category}
    </Badge>
    <Accordion type="single" collapsible className="w-full">
      {items.map((faq) => (
        <AccordionItem key={faq.id} value={faq.id}>
          <AccordionTrigger className="text-left hover:no-underline">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent>{faq.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  </div>
);

export const FAQSection = () => {
  const [activeView, setActiveView] = useState<ViewType>("general");

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <header className="text-center mb-12">
        <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-2">FAQs</p>
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Frequently asked questions
        </h1>
        <p className="text-xl text-muted-foreground">
          Need help with something? Here are our most frequently asked
          questions.
        </p>
      </header>

      <div className="flex justify-center sticky top-2">
        <Tabs
          defaultValue="general"
          onValueChange={(value) => setActiveView(value as ViewType)}
          className="mb-8 max-w-xl border rounded-xl bg-background"
        >
          <TabsList className="w-full justify-start h-12 p-1">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <FAQAccordion
        category={FAQ_SECTIONS[activeView].category}
        items={FAQ_SECTIONS[activeView].items}
      />
    </div>
  );
}; 