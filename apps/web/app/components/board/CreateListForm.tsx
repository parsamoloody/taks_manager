// app/components/board/CreateListForm.tsx
import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import { Button } from "~/components/ui/Button";

export function CreateListForm({ nextOrder }: { nextOrder: number }) {
  const fetcher = useFetcher<{ ok: boolean }>();
  const formRef = useRef<HTMLFormElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const isSubmitting = fetcher.state !== "idle";

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.ok) {
      formRef.current?.reset();
      setIsOpen(false);
    }
  }, [fetcher.state, fetcher.data]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex h-fit w-72 shrink-0 items-center justify-center rounded-2xl border border-dashed border-white/15 px-4 py-3.5 text-sm font-medium text-slate-400 transition hover:border-white/30 hover:text-white"
      >
        + Add list
      </button>
    );
  }

  return (
    <fetcher.Form
      ref={formRef}
      method="post"
      className="w-72 shrink-0 rounded-2xl border border-white/10 bg-slate-900/60 p-3"
    >
      <input type="hidden" name="intent" value="createList" />
      <input type="hidden" name="order" value={nextOrder} />
      <input
        name="title"
        autoFocus
        required
        maxLength={50}
        placeholder="List title"
        className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-sky-400/50 focus:outline-none focus:ring-2 focus:ring-sky-400/20"
      />
      <div className="mt-2 flex gap-2">
        <Button type="submit" variant="primary" isLoading={isSubmitting} className="px-3 py-1.5 text-xs">
          Add list
        </Button>
        <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="px-3 py-1.5 text-xs">
          Cancel
        </Button>
      </div>
    </fetcher.Form>
  );
}