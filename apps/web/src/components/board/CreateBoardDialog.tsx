// app/components/board/CreateBoardDialog.tsx
import { useEffect, useRef } from "react";
import { Modal } from "~/components/ui/Modal";
import { Button } from "~/components/ui/Button";
import { FormInput, FormSelect, FormTextarea } from "~/components/ui/FormField";
import { MutationForm, useMutation } from "~/modules/mutations/client";

interface CreateBoardDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateBoardDialog({ open, onClose }: CreateBoardDialogProps) {
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
    <Modal open={open} onClose={onClose} title="Create board">
      <MutationForm mutation={mutation} ref={formRef} className="space-y-4">
        <input type="hidden" name="intent" value="create" />

        <FormInput
          name="name"
          label="Board name"
          autoFocus
          required
          minLength={1}
          maxLength={50}
          placeholder="Sprint 1"
        />

        <FormTextarea
          name="description"
          label="Description"
          optional
          maxLength={255}
          rows={3}
          placeholder="What will this board help your team accomplish?"
        />

        <FormSelect
          name="visibility"
          label="Visibility"
          defaultValue="WORKSPACE"
        >
          <option value="WORKSPACE">Public — all workspace members</option>
          <option value="PRIVATE">Private — board members only</option>
        </FormSelect>

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
            Create board
          </Button>
        </div>
      </MutationForm>
    </Modal>
  );
}
