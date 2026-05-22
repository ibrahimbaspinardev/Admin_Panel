import clsx from "clsx";

type BadgeTone = "blue" | "green" | "amber" | "rose" | "slate" | "violet";

const tones: Record<BadgeTone, string> = {
  blue: "border-cyan-300/30 bg-cyan-400/10 text-cyan-100",
  green: "border-emerald-300/30 bg-emerald-400/10 text-emerald-100",
  amber: "border-amber-300/30 bg-amber-400/10 text-amber-100",
  rose: "border-rose-300/30 bg-rose-400/10 text-rose-100",
  slate: "border-slate-300/20 bg-slate-300/10 text-slate-200",
  violet: "border-violet-300/30 bg-violet-400/10 text-violet-100",
};

export function Badge({
  children,
  tone = "slate",
  className,
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium leading-none",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
