import { useEffect, useRef } from "react";
import { HiOutlineExclamation } from "react-icons/hi";
import { Modal } from "~/components/ui/Modal";
import { Button } from "~/components/ui/Button";
import { MutationForm, useMutation } from "~/modules/mutations/client";

interface DeleteWorkspaceDialogProps {
  open: boolean;
  workspaceName: string;
  workspaceId: string;
  onClose: () => void;
}

export function DeleteWorkspaceDialog({
  open,
  onClose,
  workspaceId,
  workspaceName,
}: DeleteWorkspaceDialogProps) {
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
    <Modal open={open} onClose={onClose} title="Delete this workspace?">
      <div>
        <div className="flex gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-400/10 text-rose-300 ring-1 ring-rose-300/15">
            <HiOutlineExclamation className="h-6 w-6" />
          </span>
          <p className="pt-1 text-sm leading-6 text-slate-400">
            This permanently deletes “{workspaceName}”, every board, and all
            tasks inside it.
          </p>
        </div>
        <MutationForm mutation={mutation} ref={formRef}>
          <input type="hidden" name="intent" value="delete" />
          <input type="hidden" name="target" value="workspace" />
          <input type="hidden" name="workspaceId" value={workspaceId} />
          <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              disabled={isSubmitting}
              type="submit"
              variant="danger"
              isLoading={isSubmitting}
            >
              Delete workspace
            </Button>
          </div>
        </MutationForm>
        {mutation.data && !mutation.data.ok && (
          <p role="alert" className="mt-3 text-sm text-rose-400">
            {mutation.data.message}
          </p>
        )}
      </div>
    </Modal>
  );
}
