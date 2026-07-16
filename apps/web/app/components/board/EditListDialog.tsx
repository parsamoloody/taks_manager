// app/components/board/EditListDialog.tsx
import { useEffect, useRef } from "react";
import { useFetcher } from "react-router";
import type { List } from "~/lib/api/list";
import { Modal } from "~/components/ui/Modal";
import { Button } from "~/components/ui/Button";
import type { UpdateListDto } from "@repo/shared";

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
    <Modal open={Boolean(list)} onClose={onClose} name="Edit list">
      <fetcher.Form ref={formRef} method="post" className="space-y-4">
        <input type="hidden" name="intent" value="updateList" />
        {/* <input type="hidden" name="listId" value={list.id} /> */}
        <input type="hidden" name="order" value={list.order} />

        <div>
          <label htmlFor="edit-list-title" className="mb-1.5 block text-sm font-medium text-slate-300">
            List title
          </label>
          <input
            id="edit-list-title"
            name="title"
            autoFocus
            required
            maxLength={50}
            defaultValue={list.title}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-white focus:border-sky-400/50 focus:outline-none focus:ring-2 focus:ring-sky-400/20"
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
            Save changes
          </Button>
        </div>
      </fetcher.Form>
    </Modal>
  );
}