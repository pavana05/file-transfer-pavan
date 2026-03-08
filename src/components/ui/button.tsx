import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { haptics } from "@/lib/haptic-feedback"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold ring-offset-background transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 select-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-[0_2px_8px_-2px_hsl(var(--primary)/0.5)] hover:shadow-[0_8px_24px_-4px_hsl(var(--primary)/0.5)] hover:brightness-110 hover:scale-[1.03] active:scale-[0.97] active:brightness-95",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_2px_8px_-2px_hsl(var(--destructive)/0.5)] hover:shadow-[0_8px_24px_-4px_hsl(var(--destructive)/0.5)] hover:brightness-110 hover:scale-[1.03] active:scale-[0.97]",
        outline:
          "border border-border/60 bg-background/80 backdrop-blur-sm hover:bg-primary/8 hover:text-primary hover:border-primary/40 hover:shadow-[0_4px_16px_-4px_hsl(var(--primary)/0.2)] hover:scale-[1.03] active:scale-[0.97]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/70 hover:shadow-md hover:scale-[1.03] active:scale-[0.97]",
        ghost: "hover:bg-primary/8 hover:text-primary hover:scale-[1.03] active:scale-[0.97]",
        link: "text-primary underline-offset-4 hover:underline",
        premium: "bg-gradient-to-r from-primary to-[hsl(var(--primary-glow))] text-primary-foreground shadow-[0_4px_16px_-4px_hsl(var(--primary)/0.6)] hover:shadow-[0_12px_32px_-6px_hsl(var(--primary)/0.6)] hover:scale-[1.04] active:scale-[0.97] hover:brightness-110",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  disableHaptic?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, onClick, disableHaptic = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Trigger haptic feedback on click
      if (!disableHaptic && !props.disabled) {
        haptics.light();
      }
      
      // Call original onClick handler
      onClick?.(e);
    };
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onClick={handleClick}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
