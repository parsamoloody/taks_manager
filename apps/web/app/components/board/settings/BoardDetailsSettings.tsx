import { BoardVisibility } from "@repo/shared";
import { useFetcher } from "react-router";
import type { Board } from "~/lib/api/board";
import { Button } from "~/components/ui/Button";
import { FormInput, FormSelect } from "~/components/ui/FormField";

export function BoardDetailsSettings({ board }: { board: Board }) {
  const fetcher = useFetcher<{ ok: boolean; message?: string }>();

  return (
    <section>
      <h3 className="text-sm font-semibold text-white">Board details</h3>
      <p className="mt-1 text-xs leading-5 text-slate-400">Update how this board appears and who can access it.</p>
      <fetcher.Form method="post" className="mt-4 space-y-4">
        <input type="hidden" name="intent" value="updateBoard" />
        <FormInput name="name" label="Title" required minLength={3} maxLength={50} defaultValue={board.name} />
        <FormSelect name="visibility" label="Visibility" defaultValue={board.visibility}>
          <option value={BoardVisibility.WORKSPACE}>Workspace — everyone in the workspace</option>
          <option value={BoardVisibility.PRIVATE}>Private — invited board members only</option>
        </FormSelect>
        {fetcher.data && !fetcher.data.ok ? <p className="text-xs text-rose-400">{fetcher.data.message}</p> : null}
        <Button type="submit" variant="primary" isLoading={fetcher.state !== "idle"} className="w-full">
          Save board details
        </Button>
      </fetcher.Form>
    </section>
  );
}
