import { useEffect, useRef } from "react";
import { HiOutlineTrash } from "react-icons/hi";
import { Avatar } from "~/components/ui/Avatar";
import { Button } from "~/components/ui/Button";
import { Modal } from "~/components/ui/Modal";
import { FormInput } from "~/components/ui/FormField";
import { Notification } from "~/components/ui/Notification";
import type { Workspace } from "~/server/api/workspace";
import { MutationForm, useMutation } from "~/modules/mutations/client";

interface EditWorkspaceDialogProps {
  open: boolean;
  onClose: () => void;
  workspace: Workspace;
}

type ActionResult = { ok: boolean; intent?: string; message?: string };

function memberName(member: Workspace["members"][number]) {
  return (
    [member.user.firstName, member.user.lastName].filter(Boolean).join(" ") ||
    "unknown name"
  );
}

export function EditWorkspaceDialog({
  open,
  onClose,
  workspace,
}: EditWorkspaceDialogProps) {
  const mutation = useMutation<ActionResult>();
  const inviteFormRef = useRef<HTMLFormElement>(null);
  const isSubmitting = mutation.state !== "idle";

  useEffect(() => {
    if (mutation.state !== "idle" || !mutation.data?.ok) return;

    if (mutation.data.intent === "update-workspace") onClose();
    if (mutation.data.intent === "invite-member") {
      inviteFormRef.current?.reset();
    }
  }, [mutation.state, mutation.data, onClose]);

  return (
    <Modal open={open} onClose={onClose} title="Edit workspace">
      <div className="max-h-[70vh] space-y-6 overflow-y-auto pr-1">
        <MutationForm mutation={mutation} className="space-y-4">
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
        </MutationForm>

        <section className="border-t border-white/10 pt-5">
          <h3 className="text-sm font-semibold text-white">Members</h3>
          <p className="mt-1 text-sm text-slate-400">
            Send an email invitation to join this workspace.
          </p>

          <MutationForm
            mutation={mutation}
            ref={inviteFormRef}
            className="mt-3 flex flex-col gap-2 sm:flex-row"
          >
            <input type="hidden" name="intent" value="invite-member" />
            <FormInput
              name="email"
              type="email"
              required
              placeholder="name@example.com"
              aria-label="Member email"
              wrapperClassName="min-w-0 flex-1"
            />
            <Button type="submit" variant="secondary" isLoading={isSubmitting}>
              Invite
            </Button>
          </MutationForm>

          {mutation.data?.intent === "invite-member" ? (
            <Notification
              tone={mutation.data.ok ? "success" : "error"}
              className="mt-3"
            >
              {mutation.data.message}
            </Notification>
          ) : null}

          <ul className="mt-4 space-y-2">
            {workspace.members.map((member) => (
              <li
                key={member.userId}
                className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2"
              >
                <Avatar
                  name={memberName(member)}
                  src={member.user.avatar}
                  size="sm"
                  fullRound
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {memberName(member)}
                  </p>
                  {member.user.email && (
                    <p className="truncate text-xs text-slate-400">
                      {member.user.email}
                    </p>
                  )}
                </div>
                <span className="text-xs font-medium text-slate-400">
                  {member.role.toLowerCase()}
                </span>
                {member.role !== "OWNER" && (
                  <MutationForm mutation={mutation}>
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
                  </MutationForm>
                )}
              </li>
            ))}
          </ul>
        </section>

        {mutation.data &&
        !mutation.data.ok &&
        mutation.data.intent !== "invite-member" ? (
          <p role="alert" className="text-sm text-rose-400">
            {mutation.data.message}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
