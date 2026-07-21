// app/components/board/CreateBoardDialog.tsx
import { useEffect, useRef } from "react";
import { useFetcher } from "react-router";
import { Modal } from "~/components/ui/Modal";
import { Button } from "~/components/ui/Button";
import { FormInput, FormSelect } from "~/components/ui/FormField";

interface CreateBoardDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateBoardDialog({ open, onClose }: CreateBoardDialogProps) {
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
    <Modal open={open} onClose={onClose} title="Create board">
      <fetcher.Form ref={formRef} method="post" className="space-y-4">
        <input type="hidden" name="intent" value="create" />

        <FormInput
            name="name"
            label="Board name"
            required
            minLength={1}
            maxLength={50}
            placeholder="Sprint 1"
          />

        <FormSelect
            name="visibility"
            label="Visibility"
            defaultValue="WORKSPACE"
          >
            <option value="WORKSPACE">Public — all workspace members</option>
            <option value="PRIVATE">Private — board members only</option>
          </FormSelect>

        {fetcher.data && !fetcher.data.ok && (
          <p className="text-sm text-rose-400">{fetcher.data.message}</p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Create board
          </Button>
        </div>
      </fetcher.Form>
    </Modal>
  );
}
