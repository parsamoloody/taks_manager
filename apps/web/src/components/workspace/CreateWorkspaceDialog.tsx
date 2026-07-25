import { useEffect, useRef } from "react";
import { Modal } from "~/components/ui/Modal";
import { Button } from "~/components/ui/Button";
import { FormInput } from "~/components/ui/FormField";
import { MutationForm, useMutation } from "~/modules/mutations/client";

interface CreateWorkspaceDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateWorkspaceDialog({
  open,
  onClose,
}: CreateWorkspaceDialogProps) {
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
    <Modal open={open} onClose={onClose} title="Create workspace">
      <MutationForm mutation={mutation} ref={formRef} className="space-y-4">
        <input type="hidden" name="intent" value="create" />

        <FormInput
          name="name"
          label="Workspace name"
          autoFocus
          required
          minLength={1}
          maxLength={50}
          placeholder="Product Team"
        />

        <FormInput
          name="logo"
          label="Logo URL"
          optional
          type="url"
          placeholder="https://example.com/logo.png"
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
            Create workspace
          </Button>
        </div>
      </MutationForm>
    </Modal>
  );
}
