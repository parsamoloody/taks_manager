// app/components/board/TaskDetailDialog.tsx
import { useEffect, useRef } from "react";
import { useFetcher } from "react-router";
import type { LabelDto } from "@repo/shared";
import type { Task } from "~/lib/api/task";
import type { Board } from "~/lib/api/board";
import { Modal } from "~/components/ui/Modal";
import { Button } from "~/components/ui/Button";
import { FormInput, FormTextarea } from "~/components/ui/FormField";
import { TaskLabelPicker } from "./TaskLabelPicker";
import { HiOutlinePencil } from "react-icons/hi";
import { TaskPriorityPicker } from "./TaskPriorityPicker";
import { TaskAssigneePicker } from "./TaskAssigneePicker";

interface TaskDetailDialogProps {
  task: Task | null;
  onClose: () => void;
  labels: LabelDto[];
  members: Board["members"];
}

function toDateInputValue(value?: string | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export function TaskDetailDialog({ task, onClose, labels, members }: TaskDetailDialogProps) {
  const fetcher = useFetcher<{ ok: boolean; message?: string }>();
  const formRef = useRef<HTMLFormElement>(null);
  const submissionStartedRef = useRef(false);
  const isSubmitting = fetcher.state !== "idle";

  useEffect(() => {
    if (fetcher.state !== "idle") {
      submissionStartedRef.current = true;
      return;
    }

    if (submissionStartedRef.current && fetcher.data?.ok) {
      submissionStartedRef.current = false;
      onClose();
    }
  }, [fetcher.state, fetcher.data, onClose]);

  if (!task) return null;

  return (
    <Modal open={Boolean(task)} onClose={onClose} title="Task details" size="lg">
      <fetcher.Form ref={formRef} method="post" className="space-y-4">
        <input type="hidden" name="intent" value="updateTask" />
        <input type="hidden" name="taskId" value={task.id} />
        <input type="hidden" name="listId" value={task.listId} />
        <input type="hidden" name="order" value={task.order} />

        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <HiOutlinePencil className="h-3.5 w-3.5" />
          Click a value to edit it
        </div>

        <FormInput
            id="title"
            name="title"
            aria-label="Task title"
            defaultValue={task.title}
            required
            maxLength={100}
            className="border-transparent bg-transparent px-2 py-1.5 text-2xl font-semibold leading-tight hover:bg-white/[0.04] focus:border-sky-400/50 focus:bg-slate-950/60 focus:ring-2"
          />

        <FormTextarea
            id="description"
            name="description"
            label="Description"
            defaultValue={task.description ?? ""}
            rows={4}
            placeholder="Add a description…"
            className="border-transparent bg-transparent px-2 py-2 leading-6 hover:bg-white/[0.04] focus:border-sky-400/50 focus:bg-slate-950/60 focus:ring-2"
          />


        <div className="border-t border-white/10 pt-4">
          <TaskAssigneePicker
            key={task.id}
            members={members}
            defaultSelected={task.assignee?.map((item) => item.userId)}
          />
        </div>
        <div className="border-t border-white/10 pt-4">
          <TaskLabelPicker
            key={task.id}
            labels={labels}
            defaultSelected={task.labels?.map((item) => item.labelId)}
          />
        </div>
        <div className="grid pb-6 grid-cols-1 gap-3 border-t border-b border-white/10 pt-4 sm:grid-cols-3">
          <TaskPriorityPicker key={task.id} defaultValue={task.priority} />

          <FormInput
              id="dueDate"
              name="dueDate"
              label="Due date"
              optional
              type="date"
              defaultValue={toDateInputValue(task.dueDate)}
              className="border-transparent bg-transparent px-2 hover:bg-white/[0.04] focus:border-sky-400/50 focus:bg-slate-950/60"
            />

          <FormInput
            id="startDate"
            name="startDate"
            label="Start date"
            optional
            type="date"
            defaultValue={toDateInputValue(task.startDate)}
            className="border-transparent bg-transparent px-2 hover:bg-white/[0.04] focus:border-sky-400/50 focus:bg-slate-950/60"
          />
        </div>

        {fetcher.data && !fetcher.data.ok && (
          <p className="text-sm text-rose-400">{fetcher.data.message}</p>
        )}

        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => {
              if (!confirm(`Delete "${task.title}"?`)) return;
              fetcher.submit(
                {
                  intent: "deleteTask",
                  taskId: task.id,
                  listId: task.listId,
                },
                { method: "post" },
              );
            }}
            className="cursor-pointer text-sm font-medium text-rose-400 transition hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-50"
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
