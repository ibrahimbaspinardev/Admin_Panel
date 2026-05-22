"use client";

import { forwardRef } from "react";
import clsx from "clsx";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={clsx(
        "h-10 w-full rounded-lg border border-white/10 bg-white/[0.07] px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-white/[0.1] focus:ring-2 focus:ring-cyan-300/20",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
