// app/components/board/CreateBoardDialog.tsx
import { useEffect, useRef } from "react";
import { useFetcher } from "react-router";
import { Modal } from "~/components/ui/Modal";
import { Button } from "~/components/ui/Button";

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
    <Modal open={open} onClose={onClose} name="Create board">
      <fetcher.Form ref={formRef} method="post" className="space-y-4">
        <input type="hidden" name="intent" value="create" />

        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-300">
            Board name
          </label>
          <input
            id="name"
            name="name"
            required
            minLength={1}
            maxLength={50}
            placeholder="Sprint 1"
            className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-400/50 focus:outline-none focus:ring-2 focus:ring-sky-400/20"
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
            Create board
          </Button>
        </div>
      </fetcher.Form>
    </Modal>
  );
}