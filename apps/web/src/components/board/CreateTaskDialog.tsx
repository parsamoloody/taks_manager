// app/components/board/CreateTaskDialog.tsx
import { useEffect, useRef } from "react";
import { TaskPriority, type LabelDto } from "@repo/shared";
import { Modal } from "~/components/ui/Modal";
import { Button } from "~/components/ui/Button";
import { FormInput, FormTextarea } from "~/components/ui/FormField";
import { TaskLabelPicker } from "./TaskLabelPicker";
import { TaskPriorityPicker } from "./TaskPriorityPicker";
import type { Board } from "~/server/api/board";
import { TaskAssigneePicker } from "./TaskAssigneePicker";
import { MutationForm, useMutation } from "~/modules/mutations/client";

interface CreateTaskDialogProps {
  listId: string | null;
  nextOrder: number;
  onClose: () => void;
  labels: LabelDto[];
  members: Board["members"];
}

export function CreateTaskDialog({
  listId,
  nextOrder,
  onClose,
  labels,
  members,
}: CreateTaskDialogProps) {
  const mutation = useMutation<{ ok: boolean; message?: string }>();
  const formRef = useRef<HTMLFormElement>(null);
  const isSubmitting = mutation.state !== "idle";

  useEffect(() => {
    if (mutation.state === "idle" && mutation.data?.ok) {
      formRef.current?.reset();
      onClose();
    }
  }, [mutation.state, mutation.data, onClose]);

  return (
    <Modal open={Boolean(listId)} onClose={onClose} title="New task">
      <MutationForm mutation={mutation} ref={formRef} className="space-y-4">
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

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TaskPriorityPicker
            key={listId ?? "closed"}
            defaultValue={TaskPriority.MEDIUM}
          />

          <FormInput
            id="new-dueDate"
            name="dueDate"
            label="Due date"
            optional
            type="date"
          />
        </div>

        <TaskAssigneePicker key={listId ?? "closed"} members={members} />

        <TaskLabelPicker key={listId ?? "closed"} labels={labels} />

        {mutation.data && !mutation.data.ok && (
          <p role="alert" className="text-sm text-rose-400">
            {mutation.data.message}
          </p>
        )}

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Create task
          </Button>
        </div>
      </MutationForm>
    </Modal>
  );
}
