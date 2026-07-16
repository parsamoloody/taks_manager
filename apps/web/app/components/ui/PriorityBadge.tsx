import { TaskPriority } from "@repo/shared";

const STYLES: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: "bg-slate-500/15 text-slate-300",
  [TaskPriority.MEDIUM]: "bg-sky-500/15 text-sky-300",
  [TaskPriority.HIGH]: "bg-amber-500/15 text-amber-300",
  [TaskPriority.URGENT]: "bg-rose-500/15 text-rose-300",
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${STYLES[priority]}`}>
      {priority.toLowerCase()}
    </span>
  );
}