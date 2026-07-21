// app/components/board/EditListDialog.tsx
import { useEffect, useRef } from "react";
import { useFetcher } from "react-router";
import type { List } from "~/lib/api/list";
import { Modal } from "~/components/ui/Modal";
import { Button } from "~/components/ui/Button";
import type { UpdateListDto } from "@repo/shared";
import { FormInput } from "~/components/ui/FormField";

interface EditListDialogProps {
  list: UpdateListDto | null;
  onClose: () => void;
}

export function EditListDialog({ list, onClose }: EditListDialogProps) {
  const fetcher = useFetcher<{ ok: boolean; message?: string }>();
  const formRef = useRef<HTMLFormElement>(null);
  const isSubmitting = fetcher.state !== "idle";

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.ok) {
      onClose();
    }
  }, [fetcher.state, fetcher.data, onClose]);

  if (!list) return null;

  return (
    <Modal open={Boolean(list)} onClose={onClose} title="Edit list">
      <fetcher.Form ref={formRef} method="post" className="space-y-4">
        <input type="hidden" name="intent" value="updateList" />
        {/* <input type="hidden" name="listId" value={list.id} /> */}
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

        {fetcher.data && !fetcher.data.ok && (
          <p className="text-sm text-rose-400">{fetcher.data.message}</p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Save changes
          </Button>
        </div>
      </fetcher.Form>
    </Modal>
  );
}
