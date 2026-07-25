import { BoardVisibility } from "@repo/shared";
import type { Board } from "~/server/api/board";
import { Button } from "~/components/ui/Button";
import { FormInput, FormSelect, FormTextarea } from "~/components/ui/FormField";
import { MutationForm, useMutation } from "~/modules/mutations/client";

export function BoardDetailsSettings({ board }: { board: Board }) {
  const mutation = useMutation<{ ok: boolean; message?: string }>();

  return (
    <section>
      <h3 className="text-sm font-semibold text-white">Board details</h3>
      <p className="mt-1 text-xs leading-5 text-slate-400">
        Update how this board appears and who can access it.
      </p>
      <MutationForm mutation={mutation} className="mt-4 space-y-4">
        <input type="hidden" name="intent" value="updateBoard" />
        <FormInput
          name="name"
          label="Title"
          required
          minLength={3}
          maxLength={50}
          defaultValue={board.name}
        />
        <FormTextarea
          name="description"
          label="Description"
          optional
          maxLength={255}
          rows={3}
          defaultValue={board.description ?? ""}
          placeholder="What is this board for?"
        />
        <FormSelect
          name="visibility"
          label="Visibility"
          defaultValue={board.visibility}
        >
          <option value={BoardVisibility.WORKSPACE}>
            Workspace — everyone in the workspace
          </option>
          <option value={BoardVisibility.PRIVATE}>
            Private — invited board members only
          </option>
        </FormSelect>
        {mutation.data && !mutation.data.ok ? (
          <p role="alert" className="text-xs text-rose-400">
            {mutation.data.message}
          </p>
        ) : null}
        <Button
          type="submit"
          variant="primary"
          isLoading={mutation.state !== "idle"}
          className="w-full"
        >
          Save board details
        </Button>
      </MutationForm>
    </section>
  );
}
