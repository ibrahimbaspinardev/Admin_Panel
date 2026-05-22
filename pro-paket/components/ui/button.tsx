"use client";

import { forwardRef } from "react";
import clsx from "clsx";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success";
type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-white text-slate-950 shadow-[0_18px_60px_rgba(255,255,255,0.18)] hover:bg-cyan-100",
  secondary:
    "border border-white/10 bg-white/[0.07] text-white hover:border-cyan-300/50 hover:bg-white/[0.11]",
  ghost: "text-slate-300 hover:bg-white/[0.08] hover:text-white",
  danger:
    "border border-rose-400/30 bg-rose-500/15 text-rose-100 hover:bg-rose-500/25",
  success:
    "border border-emerald-400/30 bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/25",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-sm",
  icon: "h-10 w-10 p-0",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "secondary", size = "md", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={clsx(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-medium outline-none transition duration-200 focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:pointer-events-none disabled:opacity-45",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = "Button";
