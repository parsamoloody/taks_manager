import { useFetcher } from "react-router";
import { HiOutlineTrash } from "react-icons/hi";
import type { Board } from "~/lib/api/board";
import { Avatar } from "~/components/ui/Avatar";
import { Button } from "~/components/ui/Button";
import { FormInput } from "~/components/ui/FormField";

interface BoardMembersSettingsProps {
  members: Board["members"];
  currentUserId: string;
  visibility: Board["visibility"];
}

export function BoardMembersSettings({ members, currentUserId, visibility }: BoardMembersSettingsProps) {
  const inviteFetcher = useFetcher<{ ok: boolean; message?: string }>();
  const removeFetcher = useFetcher<{ ok: boolean; message?: string }>();

  return (
    <section className="border-t border-white/10 pt-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white">Members</h3>
          <p className="mt-1 text-xs text-slate-400">{members.length} people have access</p>
        </div>
        <div className="flex -space-x-2">
          {members.slice(0, 3).map(({ user }) => {
            const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email || "Member";
            return <Avatar key={user.id} name={name} src={user.avatar} size="sm" fullRound />;
          })}
        </div>
      </div>

      {visibility === "WORKSPACE" ? (
        <div className="mt-4 rounded-md border border-sky-400/20 bg-sky-400/10 px-3 py-2.5 text-xs leading-5 text-sky-200">
          Access is inherited from the workspace. Switch visibility to Private before managing individual members, or invite member to the workspace.
        </div>
      ) : null}

      <inviteFetcher.Form method="post" className="mt-4 flex items-end gap-2">
        <input type="hidden" name="intent" value="addBoardMember" />
        <FormInput name="email" type="email" label="Invite by email" required disabled={visibility === "WORKSPACE"} placeholder="name@example.com" wrapperClassName="min-w-0 flex-1" />
        <Button type="submit" variant="secondary" disabled={visibility === "WORKSPACE"} isLoading={inviteFetcher.state !== "idle"}>Invite</Button>
      </inviteFetcher.Form>
      {inviteFetcher.data && !inviteFetcher.data.ok ? <p className="mt-2 text-xs text-rose-400">{inviteFetcher.data.message}</p> : null}

      <ul className="mt-4 max-h-48 space-y-2 overflow-y-auto pr-1">
        {members.map(({ user }) => {
          const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email || "Member";
          const isCurrentUser = user.id === currentUserId;
          return (
            <li key={user.id} className="flex items-center gap-3 rounded-md bg-white/5 p-2.5">
              <Avatar name={name} src={user.avatar} size="sm" fullRound />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{name}{isCurrentUser ? " (you)" : ""}</p>
                <p className="truncate text-xs text-slate-400">{user.email}</p>
              </div>
              {!isCurrentUser && visibility === "PRIVATE" ? (
                <removeFetcher.Form method="post">
                  <input type="hidden" name="intent" value="removeBoardMember" />
                  <input type="hidden" name="userId" value={user.id} />
                  <button type="submit" aria-label={`Remove ${name}`} className="rounded-md p-2 text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-300">
                    <HiOutlineTrash className="h-4 w-4" />
                  </button>
                </removeFetcher.Form>
              ) : null}
            </li>
          );
        })}
      </ul>
      {removeFetcher.data && !removeFetcher.data.ok ? <p className="mt-2 text-xs text-rose-400">{removeFetcher.data.message}</p> : null}
    </section>
  );
}
