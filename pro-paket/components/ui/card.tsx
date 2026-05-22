"use client";

import clsx from "clsx";
import { motion, type HTMLMotionProps } from "framer-motion";

interface CardProps extends HTMLMotionProps<"section"> {
  interactive?: boolean;
}

export function Card({ className, interactive, ...props }: CardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={clsx(
        "rounded-lg border border-white/10 bg-white/[0.065] shadow-[0_22px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl",
        interactive &&
          "transition duration-200 hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-white/[0.09]",
        className,
      )}
      {...props}
    />
  );
}
