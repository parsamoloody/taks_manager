// app/components/board/CreateListForm.tsx
import { useState, type FormEvent } from "react";
import { HiOutlinePlus, HiOutlineViewBoards } from "react-icons/hi";
import { Button } from "~/components/ui/Button";
import { FormInput } from "~/components/ui/FormField";
import { MutationForm, useMutation } from "~/modules/mutations/client";

export function CreateListForm({ nextOrder }: { nextOrder: number }) {
  const mutation = useMutation<{ ok: boolean }>();
  const [isOpen, setIsOpen] = useState(false);
  const isSubmitting = mutation.state !== "idle";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    void mutation.submit(form).then((result) => {
      if (!result?.ok) return;
      form.reset();
      setIsOpen(false);
    });
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex h-fit min-h-28 w-[min(20rem,calc(100vw-2rem))] shrink-0 snap-start flex-col items-center justify-center rounded-[22px] border border-dashed border-white/15 bg-slate-900/35 px-4 py-4 text-sm font-medium text-slate-400 transition hover:border-sky-300/25 hover:bg-sky-400/[0.035] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 sm:w-80"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.05] text-sky-200">
          <HiOutlinePlus className="h-5 w-5" />
        </span>
        <span className="mt-2">Add another list</span>
      </button>
    );
  }

  return (
    <MutationForm
      mutation={mutation}
      onSubmit={handleSubmit}
      className="h-fit w-[min(20rem,calc(100vw-2rem))] shrink-0 snap-start rounded-[22px] border border-sky-300/20 bg-slate-900/90 p-4 shadow-xl sm:w-80"
    >
      <input type="hidden" name="intent" value="createList" />
      <input type="hidden" name="order" value={nextOrder} />
      <FormInput
        name="title"
        autoFocus
        required
        maxLength={50}
        placeholder="List title"
      />
      <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
        <HiOutlineViewBoards className="h-3.5 w-3.5" />
        Use a stage such as To do, In progress, or Done.
      </p>
      <div className="mt-2 flex gap-2">
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          className="px-3 py-1.5 text-xs"
        >
          Add list
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setIsOpen(false)}
          className="px-3 py-1.5 text-xs"
        >
          Cancel
        </Button>
      </div>
    </MutationForm>
  );
}
