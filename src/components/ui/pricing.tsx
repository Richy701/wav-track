"use client";

import { buttonVariants } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import { useState, useRef } from "react";
import confetti from "canvas-confetti";
import NumberFlow from "@number-flow/react";
import { usePayment } from "@/hooks/usePayment";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { SubscriptionPlan } from "@/lib/services/payment";

interface PricingProps {
  plans: SubscriptionPlan[];
  title?: string;
  description?: string;
}

export function Pricing({
  plans,
  title = "Simple, Transparent Pricing",
  description = "Choose the plan that works for you\nAll plans include access to our platform, lead generation tools, and dedicated support.",
}: PricingProps) {
  const [isMonthly, setIsMonthly] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const switchRef = useRef<HTMLButtonElement>(null);
  const { user } = useAuth();
  const { startFreeTrial, isLoading, hasActiveSubscription, trialDaysRemaining } = usePayment();

  // Debug auth state
  console.log('Pricing component - Auth state:', {
    user: user ? { id: user.id, email: user.email } : null,
    isAuthenticated: !!user,
    isLoading,
    hasActiveSubscription
  });

  const handleToggle = (newIsMonthly: boolean) => {
    setIsMonthly(newIsMonthly);
    
    // Show confetti when switching to annual (yearly)
    if (!newIsMonthly && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      confetti({
        particleCount: 50,
        spread: 60,
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight,
        },
        colors: [
          "#8b5cf6", // purple-500
          "#a855f7", // purple-600
          "#9333ea", // purple-700
          "#7c3aed", // purple-600
          "#6d28d9", // purple-700
        ],
        ticks: 200,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
        shapes: ["circle"],
      });
    }
  };

  const handlePlanClick = async (plan: SubscriptionPlan) => {
    console.log('handlePlanClick called with plan:', plan.name);
    
    if (hasActiveSubscription) {
      console.log('User has active subscription');
      toast.info('You already have an active subscription', {
        description: 'Manage your subscription in your account settings.',
        duration: 4000
      });
      return;
    }

    console.log('Proceeding with payment - user logged in:', !!user);
    try {
      console.log('Calling startFreeTrial with planId:', plan.id, 'isYearly:', !isMonthly);
      await startFreeTrial(plan.id, !isMonthly);
    } catch (error) {
      console.error('Error in handlePlanClick:', error);
      toast.error('Failed to start free trial', {
        description: 'Please try again later.',
        duration: 4000
      });
    }
  };

  return (
    <div className="flex w-full flex-col items-center justify-center p-4 py-20">
      <div className="mx-auto max-w-xl space-y-2 mb-8">
        <h2 className="text-center text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">
          {title}
        </h2>
        <p className="text-muted-foreground text-center text-sm md:text-base">
          {description}
        </p>
        {hasActiveSubscription && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-300 text-center">
              {trialDaysRemaining > 0 
                ? `You have ${trialDaysRemaining} days left in your free trial`
                : 'You have an active subscription'
              }
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-center mb-16 mt-8">
        <div className="relative inline-flex items-center bg-muted/50 rounded-full p-1 border border-border/50">
          <button
            ref={switchRef as React.RefObject<HTMLButtonElement>}
            onClick={() => handleToggle(true)}
            className={cn(
              "relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ease-out",
              "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2",
              isMonthly
                ? "text-foreground bg-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => handleToggle(false)}
            className={cn(
              "relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ease-out",
              "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2",
              !isMonthly
                ? "text-foreground bg-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Annual
            <span className="ml-1 text-xs text-purple-600 dark:text-purple-400 font-medium">
              (Save 20%)
            </span>
          </button>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 md:grid-cols-3">
        {plans.map((plan, index) => (
          <motion.div
            key={index}
            initial={{ y: 50, opacity: 1 }}
            whileInView={
              isDesktop
                ? {
                    y: plan.isPopular ? -20 : 0,
                    opacity: 1,
                    x: index === 2 ? -30 : index === 0 ? 30 : 0,
                    scale: index === 0 || index === 2 ? 0.94 : 1.0,
                  }
                : {}
            }
            viewport={{ once: true }}
            transition={{
              duration: 1.6,
              type: "spring",
              stiffness: 100,
              damping: 30,
              delay: 0.4,
              opacity: { duration: 0.5 },
            }}
            className={cn(
              `rounded-2xl border-[1px] p-6 bg-background/80 backdrop-blur-sm text-center lg:flex lg:flex-col lg:justify-center relative shadow-lg`,
              plan.isPopular ? "border-purple-500 border-2 shadow-xl scale-105" : "border-border",
              "flex flex-col",
              !plan.isPopular && "mt-5",
              index === 0 || index === 2
                ? "z-0 transform translate-x-0 translate-y-0 -translate-z-[50px] rotate-y-[10deg]"
                : "z-10",
              index === 0 && "origin-right",
              index === 2 && "origin-left"
            )}
          >
            {plan.isPopular && (
              <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-1 px-3 rounded-bl-xl rounded-tr-xl flex items-center shadow-lg">
                <Star className="text-white h-4 w-4 fill-current" />
                <span className="text-white ml-1 font-sans font-semibold text-sm">
                  Most Popular
                </span>
              </div>
            )}
            <div className="flex-1 flex flex-col">
              <p className={cn(
                "text-base font-semibold",
                plan.isPopular ? "text-purple-700 dark:text-purple-300" : "text-muted-foreground"
              )}>
                {plan.name}
              </p>
              <div className="mt-6 flex items-center justify-center gap-x-2">
                <span className={cn(
                  "text-5xl font-bold tracking-tight",
                  plan.isPopular ? "text-purple-700 dark:text-purple-300" : "text-foreground"
                )}>
                  <NumberFlow
                    value={
                      isMonthly ? plan.price : plan.yearlyPrice
                    }
                    format={{
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }}
                    transformTiming={{
                      duration: 500,
                      easing: "ease-out",
                    }}
                    willChange
                    className="font-variant-numeric: tabular-nums"
                  />
                </span>
                {plan.period !== "Next 3 months" && (
                  <span className={cn(
                    "text-sm font-semibold leading-6 tracking-wide",
                    plan.isPopular ? "text-purple-600/70 dark:text-purple-400/70" : "text-muted-foreground"
                  )}>
                    / {plan.period}
                  </span>
                )}
              </div>

              <p className={cn(
                "text-xs leading-5",
                plan.isPopular ? "text-purple-600/70 dark:text-purple-400/70" : "text-muted-foreground"
              )}>
                {isMonthly ? "billed monthly" : "billed annually"}
              </p>

              <ul className="mt-5 gap-2 flex flex-col">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                    <span className="text-left text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <hr className="w-full my-4 border-border" />

              <button
                onClick={() => handlePlanClick(plan)}
                disabled={isLoading || hasActiveSubscription}
                className={cn(
                  "group relative w-full gap-2 overflow-hidden text-lg font-semibold tracking-tighter rounded-md px-4 py-3 transition-all duration-300 ease-out",
                  plan.isPopular
                    ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    : "bg-background border border-purple-500/30 text-foreground hover:bg-gradient-to-r hover:from-purple-600/10 hover:to-purple-700/10 hover:border-purple-500/50 hover:text-purple-700 dark:hover:text-purple-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isLoading ? 'Loading...' : hasActiveSubscription ? 'Active Subscription' : (user ? plan.buttonText : 'Start Free Trial')}
              </button>
              <p className="mt-6 text-xs leading-5 text-muted-foreground">
                {plan.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 