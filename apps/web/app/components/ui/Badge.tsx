import { cn } from "~/lib/api/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "absolute m-2 rounded-full border border-white/20 bg-black/30 px-2 py-0.5 text-sm font-medium text-white backdrop-blur-md",
        className
      )}
    >
      {children}
    </span>
  );
}