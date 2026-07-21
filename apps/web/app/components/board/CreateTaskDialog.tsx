// app/components/board/CreateTaskDialog.tsx
import { useEffect, useRef } from "react";
import { useFetcher } from "react-router";
import { TaskPriority } from "@repo/shared";
import { Modal } from "~/components/ui/Modal";
import { Button } from "~/components/ui/Button";
import { FormInput, FormSelect, FormTextarea } from "~/components/ui/FormField";

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
    <Modal open={Boolean(listId)} onClose={onClose} title="New task">
      <fetcher.Form ref={formRef} method="post" className="space-y-4">
        <input type="hidden" name="intent" value="createTask" />
        <input type="hidden" name="listId" value={listId ?? ""} />
        <input type="hidden" name="order" value={nextOrder} />

        <FormInput
            id="new-title"
            name="title"
            label="Title"
            autoFocus
            required
            maxLength={100}
            placeholder="Design API endpoints"
          />

        <FormTextarea
            id="new-description"
            name="description"
            label="Description"
            optional
            rows={3}
            placeholder="Outline the required endpoints and validation rules"
          />

        <div className="grid grid-cols-2 gap-3">
          <FormSelect
              id="new-priority"
              name="priority"
              label="Priority"
              defaultValue={TaskPriority.MEDIUM}
            >
              {Object.values(TaskPriority).map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0) + p.slice(1).toLowerCase()}
                </option>
              ))}
            </FormSelect>

          <FormInput
              id="new-dueDate"
              name="dueDate"
              label="Due date"
              optional
              type="date"
            />
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
