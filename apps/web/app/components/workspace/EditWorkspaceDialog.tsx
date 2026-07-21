import { useEffect, useRef } from "react";
import { useFetcher } from "react-router";
import { HiOutlineTrash } from "react-icons/hi";
import { Avatar } from "~/components/ui/Avatar";
import { Button } from "~/components/ui/Button";
import { Modal } from "~/components/ui/Modal";
import { FormInput } from "~/components/ui/FormField";
import type { Workspace } from "~/lib/api/workspace";

interface EditWorkspaceDialogProps {
  open: boolean;
  onClose: () => void;
  workspace: Workspace;
}

type ActionResult = { ok: boolean; intent?: string; message?: string };

function memberName(member: Workspace["members"][number]) {
  return [member.user.firstName, member.user.lastName].filter(Boolean).join(" ") || "unknown name";
}

export function EditWorkspaceDialog({ open, onClose, workspace }: EditWorkspaceDialogProps) {
  const fetcher = useFetcher<ActionResult>();
  const inviteFormRef = useRef<HTMLFormElement>(null);
  const isSubmitting = fetcher.state !== "idle";

  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data?.ok) return;

    if (fetcher.data.intent === "update-workspace") onClose();
    if (fetcher.data.intent === "add-member") inviteFormRef.current?.reset();
  }, [fetcher.state, fetcher.data, onClose]);

  return (
    <Modal open={open} onClose={onClose} title="Edit workspace">
      <div className="max-h-[70vh] space-y-6 overflow-y-auto pr-1">
        <fetcher.Form method="post" className="space-y-4">
          <input type="hidden" name="intent" value="update-workspace" />

          <FormInput
              id="workspace-name"
              name="name"
              label="Workspace name"
              required
              minLength={1}
              maxLength={50}
              defaultValue={workspace.name}
            />

          <FormInput
              id="workspace-logo"
              name="logo"
              label="Logo URL"
              optional
              type="url"
              defaultValue={workspace.logo ?? ""}
              placeholder="https://example.com/logo.png"
            />

          <div className="flex justify-end">
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Save changes
            </Button>
          </div>
        </fetcher.Form>

        <section className="border-t border-white/10 pt-5">
          <h3 className="text-sm font-semibold text-white">Members</h3>
          <p className="mt-1 text-sm text-slate-400">Invite people who already have an account.</p>

          <fetcher.Form ref={inviteFormRef} method="post" className="mt-3 flex gap-2">
            <input type="hidden" name="intent" value="add-member" />
            <FormInput
              name="email"
              type="email"
              required
              placeholder="name@example.com"
              aria-label="Member email"
              wrapperClassName="min-w-0 flex-1"
            />
            <Button type="submit" variant="secondary" isLoading={isSubmitting}>Invite</Button>
          </fetcher.Form>

          <ul className="mt-4 space-y-2">
            {workspace.members.map((member) => (
              <li key={member.userId} className="flex items-center gap-3 rounded-md bg-white/5 px-3 py-2">
                <Avatar name={memberName(member)} src={member.user.avatar} size="sm" fullRound />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{memberName(member)}</p>
                  {member.user.email && <p className="truncate text-xs text-slate-400">{member.user.email}</p>}
                </div>
                <span className="text-xs font-medium text-slate-400">{member.role.toLowerCase()}</span>
                {member.role !== "OWNER" && (
                  <fetcher.Form method="post">
                    <input type="hidden" name="intent" value="remove-member" />
                    <input type="hidden" name="userId" value={member.userId} />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      aria-label={`Remove ${memberName(member)}`}
                      className="rounded p-1.5 text-slate-400 cursor-pointer transition hover:bg-rose-500/10 hover:text-rose-300 disabled:opacity-50"
                    >
                      <HiOutlineTrash className="h-4 w-4" />
                    </button>
                  </fetcher.Form>
                )}
              </li>
            ))}
          </ul>
        </section>

        {fetcher.data && !fetcher.data.ok && <p className="text-sm text-rose-400">{fetcher.data.message}</p>}
      </div>
    </Modal>
  );
}
