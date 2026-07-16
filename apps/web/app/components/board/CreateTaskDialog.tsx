// app/components/board/CreateTaskDialog.tsx
import { useEffect, useRef } from "react";
import { useFetcher } from "react-router";
import { TaskPriority } from "@repo/shared";
import { Modal } from "~/components/ui/Modal";
import { Button } from "~/components/ui/Button";

interface CreateTaskDialogProps {
  listId: string | null;
  nextOrder: number;
  onClose: () => void;
}

export function CreateTaskDialog({ listId, nextOrder, onClose }: CreateTaskDialogProps) {
  const fetcher = useFetcher<{ ok: boolean; message?: string }>();
  const formRef = useRef<HTMLFormElement>(null);
  const isSubmitting = fetcher.state !== "idle";

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.ok) {
      formRef.current?.reset();
      onClose();
    }
  }, [fetcher.state, fetcher.data, onClose]);

  return (
    <Modal open={Boolean(listId)} onClose={onClose} name="New task">
      <fetcher.Form ref={formRef} method="post" className="space-y-4">
        <input type="hidden" name="intent" value="createTask" />
        <input type="hidden" name="listId" value={listId ?? ""} />
        <input type="hidden" name="order" value={nextOrder} />

        <div>
          <label htmlFor="new-title" className="mb-1.5 block text-sm font-medium text-slate-300">
            Title
          </label>
          <input
            id="new-title"
            name="title"
            autoFocus
            required
            maxLength={100}
            placeholder="Design API endpoints"
            className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-400/50 focus:outline-none focus:ring-2 focus:ring-sky-400/20"
          />
        </div>

        <div>
          <label htmlFor="new-description" className="mb-1.5 block text-sm font-medium text-slate-300">
            Description <span className="text-slate-500">(optional)</span>
          </label>
          <textarea
            id="new-description"
            name="description"
            rows={3}
            placeholder="Outline the required endpoints and validation rules"
            className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-400/50 focus:outline-none focus:ring-2 focus:ring-sky-400/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="new-priority" className="mb-1.5 block text-sm font-medium text-slate-300">
              Priority
            </label>
            <select
              id="new-priority"
              name="priority"
              defaultValue={TaskPriority.MEDIUM}
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
            <label htmlFor="new-dueDate" className="mb-1.5 block text-sm font-medium text-slate-300">
              Due date <span className="text-slate-500">(optional)</span>
            </label>
            <input
              id="new-dueDate"
              name="dueDate"
              type="date"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-white focus:border-sky-400/50 focus:outline-none focus:ring-2 focus:ring-sky-400/20"
            />
          </div>
        </div>

        {fetcher.data && !fetcher.data.ok && (
          <p className="text-sm text-rose-400">{fetcher.data.message}</p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Create task
          </Button>
        </div>
      </fetcher.Form>
    </Modal>
  );
}