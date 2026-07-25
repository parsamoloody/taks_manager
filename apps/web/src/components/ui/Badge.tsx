import { cn } from "~/lib/cn";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-white/15 bg-white/[0.07] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-200 backdrop-blur-md",
        className,
      )}
    >
      {children}
    </span>
  );
}
