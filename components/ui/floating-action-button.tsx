"use client";

import React from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { cva, type VariantProps } from "class-variance-authority";

const floatingActionButtonVariants = cva(
  "fixed z-40 rounded-full shadow-lg transition-all duration-200 ease-in-out hover:shadow-xl active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        sm: "h-12 w-12 bottom-20 right-4",
        md: "h-14 w-14 bottom-20 right-6",
        lg: "h-16 w-16 bottom-20 right-6",
      },
      position: {
        "bottom-right": "bottom-20 right-6",
        "bottom-left": "bottom-20 left-6",
        "bottom-center": "bottom-20 left-1/2 -translate-x-1/2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      position: "bottom-right",
    },
  },
);

export interface FloatingActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof floatingActionButtonVariants> {
  icon?: React.ReactNode;
  label: string; // Required for accessibility
}

const FloatingActionButton = React.forwardRef<
  HTMLButtonElement,
  FloatingActionButtonProps
>(
  (
    {
      className,
      variant,
      size,
      position,
      icon = <Plus className="h-6 w-6" />,
      label,
      ...props
    },
    ref,
  ) => {
    return (
      <Button
        ref={ref}
        className={cn(
          floatingActionButtonVariants({ variant, size, position, className }),
        )}
        aria-label={label}
        title={label}
        {...props}
      >
        {icon}
        <span className="sr-only">{label}</span>
      </Button>
    );
  },
);

FloatingActionButton.displayName = "FloatingActionButton";

export { FloatingActionButton, floatingActionButtonVariants };
