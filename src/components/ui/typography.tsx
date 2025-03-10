import { cn } from "@/lib/utils";
import { VariantProps, cva } from "class-variance-authority";
import React from "react";

const typographyVariants = cva("", {
  variants: {
    variant: {
      h1: "text-fluid-2xl font-display font-bold tracking-tight mb-4",
      h2: "text-fluid-xl font-display font-semibold tracking-tight mb-3",
      h3: "text-fluid-lg font-display font-medium tracking-tight mb-2",
      h4: "text-fluid-base font-display font-medium tracking-tight mb-2",
      p: "text-fluid-base leading-relaxed mb-4",
      lead: "text-fluid-lg text-muted-foreground",
      large: "text-lg font-semibold",
      small: "text-sm font-medium leading-none",
      muted: "text-sm text-muted-foreground",
      gradient: "bg-gradient-to-r from-primary via-accent to-primary/80 bg-clip-text text-transparent",
    },
    weight: {
      light: "font-light",
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    },
    wrap: {
      balance: "text-balance",
      pretty: "text-pretty",
      normal: "",
    },
  },
  defaultVariants: {
    variant: "p",
    weight: "normal",
    align: "left",
    wrap: "normal",
  },
});

type ValidElements = "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";

interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  as?: ValidElements;
}

export function Typography({
  className,
  variant,
  weight,
  align,
  wrap,
  as,
  children,
  ...props
}: TypographyProps) {
  const Tag = (as || 
    (variant?.toString().startsWith("h") ? variant.toString() : "p")) as ValidElements;

  return React.createElement(
    Tag,
    {
      className: cn(typographyVariants({ variant, weight, align, wrap }), className),
      ...props,
    },
    children
  );
}

// Usage examples:
// <Typography variant="h1">Heading 1</Typography>
// <Typography variant="lead" as="p" align="center">Lead text centered</Typography>
// <Typography variant="gradient" as="span" weight="bold">Gradient text</Typography>
// <Typography variant="p" wrap="pretty">Long paragraph with proper wrapping</Typography> 