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

type ViewType = "general" | "features";

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
          "WavTrack is a web app designed specifically for music producers to track their daily, weekly, and long-term progress on their beats and music production. It helps you stay motivated with achievements, streaks, and goal-setting features.",
      },
      {
        id: "how-it-works",
        question: "How does WavTrack help me with music production?",
        answer:
          "WavTrack tracks your music production sessions, helps you set and achieve goals, and provides visual feedback and analytics. It's designed to give you structure and motivation in your music workflow, whether you're a bedroom producer or a professional.",
      },
      {
        id: "who-is-it-for",
        question: "Who is WavTrack for?",
        answer:
          "WavTrack is perfect for bedroom producers, hobbyists, and professionals who want structure and motivation in their music workflow. It's designed to be accessible for all skill levels and helps anyone wanting to track their progress and stay motivated in music production.",
      },
      {
        id: "tracking-beats",
        question: "How do I track my beats and music production?",
        answer:
          "You can log your production sessions, track the time spent on beats, set goals for daily/weekly production targets, and monitor your progress over time. WavTrack provides visual analytics to help you see your patterns and improvements.",
      },
      {
        id: "mobile-support",
        question: "Is WavTrack available on mobile?",
        answer:
          "Yes! WavTrack is fully responsive and works great on mobile devices. You can track your sessions, view your progress, and manage your goals from your phone or tablet.",
      },
      {
        id: "data-privacy",
        question: "How do you handle my data and privacy?",
        answer:
          "Your production data is processed securely and we only keep the information needed to provide you with progress tracking and analytics. Your personal information is never shared with third parties.",
      },
    ],
  },
  features: {
    category: "Features",
    items: [
      {
        id: "progress-tracking",
        question: "What can I track with WavTrack?",
        answer:
          "Track your daily, weekly, and long-term music production progress, including session time, beat completion, goals achieved, and productivity patterns. Get visual feedback and analytics to see your improvement over time.",
      },
      {
        id: "achievements",
        question: "How do achievements and streaks work?",
        answer:
          "Earn achievements for consistency, completing goals, and reaching milestones in your music production. Build streaks for daily production and unlock badges to stay motivated and celebrate your progress.",
      },
      {
        id: "goal-setting",
        question: "Can I set goals for my music production?",
        answer:
          "Yes! Set daily, weekly, and long-term goals for your music production. Track your progress towards these goals and get motivated as you achieve them. Perfect for building consistent production habits.",
      },
      {
        id: "analytics",
        question: "What kind of analytics and feedback do I get?",
        answer:
          "Get visual feedback on your production patterns, time spent on beats, goal completion rates, and overall progress. See trends in your productivity and identify areas for improvement.",
      },
      {
        id: "motivation",
        question: "How does WavTrack help me stay motivated?",
        answer:
          "Through achievements, streaks, goal tracking, and visual progress indicators, WavTrack keeps you motivated to maintain consistent music production habits. Celebrate your wins and build momentum in your creative workflow.",
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