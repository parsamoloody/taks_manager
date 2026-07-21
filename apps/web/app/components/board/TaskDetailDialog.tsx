// app/components/board/TaskDetailDialog.tsx
import { useEffect, useRef } from "react";
import { useFetcher } from "react-router";
import { TaskPriority } from "@repo/shared";
import type { Task } from "~/lib/api/task";
import { Modal } from "~/components/ui/Modal";
import { Button } from "~/components/ui/Button";
import { FormInput, FormSelect, FormTextarea } from "~/components/ui/FormField";

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
    <Modal open={Boolean(task)} onClose={onClose} title="Task details">
      <fetcher.Form ref={formRef} method="post" className="space-y-4">
        <input type="hidden" name="intent" value="updateTask" />
        <input type="hidden" name="taskId" value={task.id} />
        <input type="hidden" name="listId" value={task.listId} />
        <input type="hidden" name="order" value={task.order} />

        <FormInput
            id="title"
            name="title"
            label="Title"
            defaultValue={task.title}
            required
            maxLength={100}
          />

        <FormTextarea
            id="description"
            name="description"
            label="Description"
            optional
            defaultValue={task.description ?? ""}
            rows={3}
          />

        <div className="grid grid-cols-2 gap-3">
          <FormSelect
              id="priority"
              name="priority"
              label="Priority"
              defaultValue={task.priority}
            >
              {Object.values(TaskPriority).map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0) + p.slice(1).toLowerCase()}
                </option>
              ))}
            </FormSelect>

          <FormInput
              id="dueDate"
              name="dueDate"
              label="Due date"
              optional
              type="date"
              defaultValue={toDateInputValue(task.dueDate)}
            />
        </div>

        <FormInput
            id="startDate"
            name="startDate"
            label="Start date"
            optional
            type="date"
            defaultValue={toDateInputValue(task.startDate)}
          />

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
