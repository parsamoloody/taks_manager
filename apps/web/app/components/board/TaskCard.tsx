// app/components/board/TaskCard.tsx
import { useFetcher } from "react-router";
import { TaskStatus } from "@repo/shared";
import type { Task } from "~/lib/api/task";
import { PriorityBadge } from "~/components/ui/PriorityBadge";

interface TaskCardProps {
  task: Task;
  onOpen: (task: Task) => void;
}

function formatDate(value?: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function TaskCard({ task, onOpen }: TaskCardProps) {
  const fetcher = useFetcher();
  const isDone = task.status === TaskStatus.DONE;
  const isToggling = fetcher.state !== "idle" && fetcher.formData?.get("taskId") === task.id;

  return (
    <div
      className={`group rounded-2xl border border-white/10 bg-white/5 p-3.5 transition hover:border-sky-400/30 hover:bg-white/10 ${
        isToggling ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start gap-2.5">
        <fetcher.Form method="post">
          <input type="hidden" name="intent" value="toggleStatus" />
          <input type="hidden" name="taskId" value={task.id} />
          <input type="hidden" name="listId" value={task.listId} />
          <button
            type="submit"
            aria-label={isDone ? "Mark as pending" : "Mark as done"}
            className={`mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border transition ${
              isDone
                ? "border-emerald-400 bg-emerald-400/80 text-slate-950"
                : "border-slate-500 hover:border-slate-300"
            }`}
          >
            {isDone && <span className="text-[10px] leading-none">✓</span>}
          </button>
        </fetcher.Form>

        <button onClick={() => onOpen(task)} className="min-w-0 flex-1 text-left">
          <p className={`truncate text-sm font-medium ${isDone ? "text-slate-500 line-through" : "text-white"}`}>
            {task.title}
          </p>
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 pl-7">
        <PriorityBadge priority={task.priority} />
        {task.dueDate && (
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-slate-400">
            Due {formatDate(task.dueDate)}
          </span>
        )}
      </div>
    </div>
  );
}