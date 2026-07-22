import { useId, useState } from "react";
import { HiChevronDown, HiOutlinePlus, HiOutlineX } from "react-icons/hi";
import type { Board } from "~/lib/api/board";
import { Avatar } from "~/components/ui/Avatar";

interface TaskAssigneePickerProps {
  members: Board["members"];
  defaultSelected?: string[];
}

function memberName(member: Board["members"][number]) {
  return [member.user.firstName, member.user.lastName].filter(Boolean).join(" ") || member.user.email || "Member";
}

export function TaskAssigneePicker({ members, defaultSelected = [] }: TaskAssigneePickerProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(defaultSelected);
  const [open, setOpen] = useState(false);
  const listboxId = useId();

  const selectedMembers = selectedIds
    .map((id) => members.find((member) => member.userId === id))
    .filter((member): member is Board["members"][number] => Boolean(member));
  const availableMembers = members.filter((member) => !selectedIds.includes(member.userId));

  function addAssignee(userId: string) {
    if (!userId || selectedIds.includes(userId)) return;
    setSelectedIds((current) => [...current, userId]);
    if (availableMembers.length === 1) setOpen(false);
  }

  function removeAssignee(userId: string) {
    setSelectedIds((current) => current.filter((id) => id !== userId));
  }

  return (
    <fieldset onKeyDown={(event) => event.key === "Escape" && setOpen(false)}>
      <legend className="mb-2 text-sm font-medium text-slate-300">
        Assignee <span className="font-normal text-slate-500">(optional)</span>
      </legend>

      {selectedMembers.length ? (
        <div className="mb-2 flex flex-wrap gap-2" aria-label="Selected assignees">
          {selectedMembers.map((member) => {
            const name = memberName(member);
            return (
              <span
                key={member.userId}
                className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 py-1 pl-1 pr-1.5 text-xs font-medium text-slate-100"
              >
                <Avatar name={name} src={member.user.avatar} size="sm" fullRound />
                <span className="max-w-32 truncate">{name}</span>
                <button
                  type="button"
                  onClick={() => removeAssignee(member.userId)}
                  aria-label={`Remove ${name}`}
                  className="ml-0.5 cursor-pointer rounded-full p-0.5 text-slate-400 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                >
                  <HiOutlineX className="h-3.5 w-3.5" />
                </button>
                <input type="hidden" name="assigneeIds" value={member.userId} />
              </span>
            );
          })}
        </div>
      ) : (
        <p className="mb-2 text-xs text-slate-500">No assignee selected</p>
      )}

      {members.length ? (
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            disabled={availableMembers.length === 0}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listboxId}
            className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-md border border-white/10 bg-slate-950/60 px-3 py-2.5 text-left text-sm text-slate-300 outline-none transition hover:border-white/20 hover:bg-slate-950/80 focus-visible:border-sky-400/50 focus-visible:ring-2 focus-visible:ring-sky-400/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white/5 text-slate-400">
                <HiOutlinePlus className="h-3.5 w-3.5" />
              </span>
              {availableMembers.length ? "Add an assignee" : "All members selected"}
            </span>
            <HiChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>

          {open && availableMembers.length ? (
            <div
              id={listboxId}
              role="listbox"
              aria-label="Available assignees"
              className="absolute bottom-full left-0 right-0 z-30 mb-2 overflow-hidden rounded-md border border-white/10 bg-slate-950/95 p-1.5 shadow-2xl backdrop-blur-xl"
            >
              <p className="px-2 pb-1.5 pt-1 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                Choose assignee
              </p>
              <div className="max-h-44 space-y-1 overflow-y-auto">
                {availableMembers.map((member) => {
                  const name = memberName(member);
                  return (
                    <button
                      key={member.userId}
                      type="button"
                      role="option"
                      aria-selected="false"
                      onClick={() => addAssignee(member.userId)}
                      className="group flex w-full cursor-pointer items-center gap-3 rounded-md px-2.5 py-2 text-left transition hover:bg-white/[0.07] focus-visible:bg-white/[0.07] focus-visible:outline-none"
                    >
                      <Avatar name={name} src={member.user.avatar} size="sm" fullRound />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-slate-200">{name}</span>
                        <span className="block truncate text-xs text-slate-500">{member.user.email}</span>
                      </span>
                      <HiOutlinePlus className="h-4 w-4 text-slate-600 transition group-hover:text-sky-300" />
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <p className="rounded-md border border-dashed border-white/10 px-3 py-3 text-center text-xs text-slate-500">
          No board members available.
        </p>
      )}
    </fieldset>
  );
}
