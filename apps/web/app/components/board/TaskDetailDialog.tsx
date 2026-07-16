// app/components/board/TaskDetailDialog.tsx
import { useEffect, useRef } from "react";
import { useFetcher } from "react-router";
import { TaskPriority } from "@repo/shared";
import type { Task } from "~/lib/api/task";
import { Modal } from "~/components/ui/Modal";
import { Button } from "~/components/ui/Button";

interface TaskDetailDialogProps {
  task: Task | null;
  onClose: () => void;
}

function toDateInputValue(value?: string | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export function TaskDetailDialog({ task, onClose }: TaskDetailDialogProps) {
  const fetcher = useFetcher<{ ok: boolean; message?: string }>();
  const formRef = useRef<HTMLFormElement>(null);
  const isSubmitting = fetcher.state !== "idle";

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.ok) {
      onClose();
    }
  }, [fetcher.state, fetcher.data, onClose]);

  if (!task) return null;

  return (
    <Modal open={Boolean(task)} onClose={onClose} name="Task details">
      <fetcher.Form ref={formRef} method="post" className="space-y-4">
        <input type="hidden" name="intent" value="updateTask" />
        <input type="hidden" name="taskId" value={task.id} />
        <input type="hidden" name="listId" value={task.listId} />
        <input type="hidden" name="order" value={task.order} />

        <div>
          <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-slate-300">
            Title
          </label>
          <input
            id="title"
            name="title"
            defaultValue={task.title}
            required
            maxLength={100}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-white focus:border-sky-400/50 focus:outline-none focus:ring-2 focus:ring-sky-400/20"
          />
        </div>

        <div>
          <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-slate-300">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            defaultValue={task.description ?? ""}
            rows={3}
            className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-white focus:border-sky-400/50 focus:outline-none focus:ring-2 focus:ring-sky-400/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="priority" className="mb-1.5 block text-sm font-medium text-slate-300">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              defaultValue={task.priority}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-white focus:border-sky-400/50 focus:outline-none focus:ring-2 focus:ring-sky-400/20"
            >
              {Object.values(TaskPriority).map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0) + p.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="dueDate" className="mb-1.5 block text-sm font-medium text-slate-300">
              Due date
            </label>
            <input
              id="dueDate"
              name="dueDate"
              type="date"
              defaultValue={toDateInputValue(task.dueDate)}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-white focus:border-sky-400/50 focus:outline-none focus:ring-2 focus:ring-sky-400/20"
            />
          </div>
        </div>

        <div>
          <label htmlFor="startDate" className="mb-1.5 block text-sm font-medium text-slate-300">
            Start date
          </label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={toDateInputValue(task.startDate)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-white focus:border-sky-400/50 focus:outline-none focus:ring-2 focus:ring-sky-400/20"
          />
        </div>

        {fetcher.data && !fetcher.data.ok && (
          <p className="text-sm text-rose-400">{fetcher.data.message}</p>
        )}

        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="submit"
            name="intent"
            value="deleteTask"
            onClick={(e) => {
              if (!confirm(`Delete "${task.title}"?`)) e.preventDefault();
            }}
            className="text-sm font-medium text-rose-400 transition hover:text-rose-300"
          >
            Delete task
          </button>

          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Save changes
            </Button>
          </div>
        </div>
      </fetcher.Form>
    </Modal>
  );
}