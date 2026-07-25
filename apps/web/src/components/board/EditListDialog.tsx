// app/components/board/EditListDialog.tsx
import { useEffect, useRef } from "react";
import type { List } from "~/server/api/list";
import { Modal } from "~/components/ui/Modal";
import { Button } from "~/components/ui/Button";
import { FormInput } from "~/components/ui/FormField";
import { MutationForm, useMutation } from "~/modules/mutations/client";

interface EditListDialogProps {
  list: List | null;
  onClose: () => void;
}

export function EditListDialog({ list, onClose }: EditListDialogProps) {
  const mutation = useMutation<{ ok: boolean; message?: string }>();
  const formRef = useRef<HTMLFormElement>(null);
  const isSubmitting = mutation.state !== "idle";

  useEffect(() => {
    if (mutation.state === "idle" && mutation.data?.ok) {
      onClose();
    }
  }, [mutation.state, mutation.data, onClose]);

  if (!list) return null;

  return (
    <Modal open={Boolean(list)} onClose={onClose} title="Edit list">
      <MutationForm mutation={mutation} ref={formRef} className="space-y-4">
        <input type="hidden" name="intent" value="updateList" />
        <input type="hidden" name="listId" value={list.id} />
        <input type="hidden" name="order" value={list.order} />

        <FormInput
          id="edit-list-title"
          name="title"
          label="List title"
          autoFocus
          required
          maxLength={50}
          defaultValue={list.title}
        />

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
            Save changes
          </Button>
        </div>
      </MutationForm>
    </Modal>
  );
}
