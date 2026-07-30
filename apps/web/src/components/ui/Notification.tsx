import type { ReactNode } from "react";
import {
  HiCheckCircle,
  HiExclamationCircle,
  HiInformationCircle,
  HiX,
} from "react-icons/hi";

import { cn } from "~/lib/cn";

type NotificationTone = "success" | "error" | "info";

interface NotificationProps {
  tone?: NotificationTone;
  children: ReactNode;
  className?: string;
  onDismiss?: () => void;
}

const TONES = {
  success: {
    icon: HiCheckCircle,
    classes: "border-emerald-400/25 bg-emerald-400/10 text-emerald-100",
    iconClasses: "text-emerald-300",
  },
  error: {
    icon: HiExclamationCircle,
    classes: "border-rose-400/25 bg-rose-400/10 text-rose-100",
    iconClasses: "text-rose-300",
  },
  info: {
    icon: HiInformationCircle,
    classes: "border-sky-400/25 bg-sky-400/10 text-sky-100",
    iconClasses: "text-sky-300",
  },
} satisfies Record<
  NotificationTone,
  {
    icon: typeof HiCheckCircle;
    classes: string;
    iconClasses: string;
  }
>;

export function Notification({
  tone = "info",
  children,
  className,
  onDismiss,
}: NotificationProps) {
  const style = TONES[tone];
  const Icon = style.icon;

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-sm leading-5",
        style.classes,
        className,
      )}
    >
      <Icon
        aria-hidden="true"
        className={cn("mt-0.5 h-4 w-4 shrink-0", style.iconClasses)}
      />
      <div className="min-w-0 flex-1">{children}</div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          title="Dismiss"
          className="-mr-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-current opacity-65 transition hover:bg-white/10 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
        >
          <HiX className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
