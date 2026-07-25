import { memo } from "react";
import { TaskStatus } from "@repo/shared";
import { HiOutlineCalendar, HiOutlineDocumentText } from "react-icons/hi";
import type { MemberUser } from "~/server/api/board";
import type { Task } from "~/server/api/task";
import { GroupMembers } from "~/components/ui/GroupMembers";
import { PriorityBadge } from "~/components/ui/PriorityBadge";
import { MutationForm, useMutation } from "~/modules/mutations/client";

interface TaskCardProps {
  task: Task;
  membersById: Readonly<Record<string, MemberUser>>;
  onOpen: (task: Task) => void;
}

const DATE_FORMATTER = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

function formatDate(value?: string | null) {
  if (!value) return null;
  return DATE_FORMATTER.format(new Date(value));
}

function TaskCardComponent({ task, membersById, onOpen }: TaskCardProps) {
  const mutation = useMutation<{ ok: boolean; message?: string }>();
  const isDone = task.status === TaskStatus.DONE;
  const isToggling =
    mutation.state !== "idle" && mutation.formData?.get("taskId") === task.id;
  const assignedMembers = (task.assignee ?? [])
    .map(({ userId }) => membersById[userId])
    .filter((member): member is MemberUser => Boolean(member))
    .map((member) => ({
      id: member.id,
      avatar: member.avatar,
      name:
        [member.firstName, member.lastName].filter(Boolean).join(" ") ||
        member.email ||
        "Member",
    }));
  const visibleLabels = task.labels?.slice(0, 2) ?? [];
  const remainingLabels = Math.max((task.labels?.length ?? 0) - 2, 0);
  const formattedDueDate = formatDate(task.dueDate);

  return (
    <article
      aria-busy={isToggling || undefined}
      className={`task-card group rounded-2xl border border-white/[0.09] bg-white/[0.04] p-3 transition hover:border-sky-300/25 hover:bg-white/[0.07] focus-within:border-sky-300/35 ${
        isToggling ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start gap-1.5">
        <MutationForm mutation={mutation}>
          <input type="hidden" name="intent" value="toggleStatus" />
          <input type="hidden" name="taskId" value={task.id} />
          <input type="hidden" name="listId" value={task.listId} />
          <input
            type="hidden"
            name="status"
            value={isDone ? TaskStatus.PENDING : TaskStatus.DONE}
          />
          <button
            type="submit"
            disabled={isToggling}
            aria-label={isDone ? "Mark as pending" : "Mark as done"}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl outline-none transition hover:bg-white/[0.05] focus-visible:ring-2 focus-visible:ring-sky-300 disabled:cursor-wait"
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full border transition ${
                isDone
                  ? "border-emerald-400 bg-emerald-400/80 text-slate-950"
                  : "border-slate-500 group-hover:border-slate-400"
              }`}
            >
              {isDone ? (
                <span className="text-[10px] font-bold leading-none">✓</span>
              ) : null}
            </span>
          </button>
        </MutationForm>

        <button
          type="button"
          onClick={() => onOpen(task)}
          aria-label={`Open task: ${task.title}`}
          className="min-w-0 flex-1 cursor-pointer rounded-lg px-1 py-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
        >
          <span
            className={`line-clamp-2 block text-sm font-medium leading-5 ${
              isDone ? "text-slate-500 line-through" : "text-slate-100"
            }`}
          >
            {task.title}
          </span>

          {visibleLabels.length > 0 ? (
            <span className="mt-2 flex flex-wrap items-center gap-1.5">
              {visibleLabels.map(({ label }) => (
                <span
                  key={label.id}
                  className="max-w-24 truncate rounded-full border px-2 py-0.5 text-[9px] font-semibold"
                  style={{
                    borderColor: `${label.color}45`,
                    backgroundColor: `${label.color}14`,
                    color: label.color,
                  }}
                >
                  {label.name}
                </span>
              ))}
              {remainingLabels > 0 ? (
                <span className="text-[10px] font-medium text-slate-500">
                  +{remainingLabels}
                </span>
              ) : null}
            </span>
          ) : null}
        </button>
      </div>

      <div className="mt-2 flex min-h-6 flex-wrap items-center gap-2 pl-11">
        <PriorityBadge priority={task.priority} />
        {task.description?.trim() ? (
          <span title="Has description" className="text-slate-500">
            <HiOutlineDocumentText className="h-3.5 w-3.5" />
          </span>
        ) : null}
        {formattedDueDate ? (
          <time
            dateTime={task.dueDate ?? undefined}
            className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400"
          >
            <HiOutlineCalendar className="h-3.5 w-3.5 text-slate-500" />
            {formattedDueDate}
          </time>
        ) : null}
        {assignedMembers.length > 0 ? (
          <span className="ml-auto">
            <GroupMembers
              members={assignedMembers}
              max={2}
              size="xs"
              label={`${assignedMembers.length} assigned`}
            />
          </span>
        ) : null}
      </div>

      {mutation.data && !mutation.data.ok ? (
        <p role="alert" className="mt-2 pl-11 text-[11px] text-rose-400">
          {mutation.data.message}
        </p>
      ) : null}
    </article>
  );
}

export const TaskCard = memo(TaskCardComponent);
