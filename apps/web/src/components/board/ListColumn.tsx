import { memo, useState } from "react";
import { TaskStatus } from "@repo/shared";
import {
  HiOutlinePencil,
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineTrash,
} from "react-icons/hi";
import type { MemberUser } from "~/server/api/board";
import type { List } from "~/server/api/list";
import type { Task } from "~/server/api/task";
import { ConfirmDialog } from "~/components/ui/ConfirmDialog";
import { KebabMenu } from "~/components/ui/KebabMenu";
import { useMutation } from "~/modules/mutations/client";
import { TaskCard } from "./TaskCard";

interface ListColumnProps {
  list: List;
  tasks: Task[];
  totalTaskCount: number;
  isFiltered: boolean;
  membersById: Readonly<Record<string, MemberUser>>;
  onOpenTask: (task: Task) => void;
  onAddTask: (listId: string) => void;
  onEditList: (list: List) => void;
  onReorderTask: (
    sourceListId: string,
    targetListId: string,
    movedTaskId: string,
    targetOrder: number,
  ) => void;
  draggingTaskId: string | null;
  draggingSourceListId: string | null;
  onDragStart: (taskId: string, listId: string) => void;
  onDragEnd: () => void;
}

function ListColumnComponent({
  list,
  tasks,
  totalTaskCount,
  isFiltered,
  membersById,
  onOpenTask,
  onAddTask,
  onEditList,
  onReorderTask,
  draggingTaskId,
  draggingSourceListId,
  onDragStart,
  onDragEnd,
}: ListColumnProps) {
  const mutation = useMutation<{ ok: boolean; message?: string }>();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isDeleting =
    mutation.state !== "idle" && mutation.formData?.get("listId") === list.id;
  // const completedCount = tasks.filter(
    // (task) => task.status === TaskStatus.DONE,
  // ).length;
  // const progress =
  //   tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  async function deleteList() {
    const result = await mutation.submit({
      intent: "deleteList",
      listId: list.id,
    });
    if (result?.ok) setConfirmDelete(false);
  }

  return (
    <>
      <article
        aria-labelledby={`list-${list.id}-title`}
        aria-busy={isDeleting || undefined}
        onDragOver={(event) => event.preventDefault()}
        onDrop={() =>
          onReorderTask(
            draggingSourceListId ?? list.id,
            list.id,
            draggingTaskId ?? "",
            tasks.length,
          )
        }
        className={`group flex h-full min-h-0 w-[min(20rem,calc(100vw-2rem))] shrink-0 snap-start flex-col overflow-hidden rounded-[22px] border border-white/10 bg-slate-900/75 shadow-[0_22px_60px_-38px_rgba(0,0,0,0.9)] sm:w-80 ${
          isDeleting ? "pointer-events-none opacity-40" : ""
        }`}
      >
        <header className="shrink-0 border-b border-white/[0.08] bg-slate-900/90 px-4 py-3.5">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2
                  id={`list-${list.id}-title`}
                  className="truncate text-sm font-semibold text-white"
                >
                  {list.title}
                </h2>
                <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-semibold text-slate-400">
                  {isFiltered
                    ? `${tasks.length}/${totalTaskCount}`
                    : totalTaskCount}
                </span>
              </div>
              {/* {tasks.length > 0 && !isFiltered ? (
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-300 transition-[width] duration-500 motion-reduce:transition-none"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              ) : null} */}
            </div>

            <KebabMenu
              label={`List options for ${list.title}`}
              items={[
                {
                  label: "Edit list",
                  icon: <HiOutlinePencil className="h-4 w-4" />,
                  onClick: () => onEditList(list),
                },
                {
                  label: "Delete list",
                  icon: <HiOutlineTrash className="h-4 w-4" />,
                  variant: "danger",
                  onClick: () => setConfirmDelete(true),
                },
              ]}
            />
          </div>
        </header>

        <div className="board-scrollbar min-h-0 flex-1 space-y-2.5 overflow-y-auto overscroll-contain p-3">
          {tasks.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              index={index}
              membersById={membersById}
              onOpen={onOpenTask}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDrop={(targetOrder) =>
                onReorderTask(
                  draggingSourceListId ?? list.id,
                  list.id,
                  draggingTaskId ?? "",
                  targetOrder,
                )
              }
              isDragging={draggingTaskId === task.id}
            />
          ))}

          {tasks.length === 0 ? (
            <button
              type="button"
              onClick={() => {
                if (!isFiltered) onAddTask(list.id);
              }}
              className={`flex min-h-32 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 px-4 text-center transition ${
                isFiltered
                  ? "cursor-default text-slate-600"
                  : "cursor-pointer text-slate-500 hover:border-sky-300/20 hover:bg-sky-400/[0.035] hover:text-slate-300"
              }`}
            >
              {isFiltered ? (
                <HiOutlineSearch className="h-5 w-5" />
              ) : (
                <HiOutlinePlus className="h-5 w-5" />
              )}
              <span className="mt-2 text-xs font-medium">
                {isFiltered ? "No matching tasks" : "Add the first task"}
              </span>
            </button>
          ) : null}
        </div>

        <footer className="shrink-0 border-t border-white/[0.08] bg-slate-900/90 p-3">
          <button
            type="button"
            onClick={() => onAddTask(list.id)}
            className="flex min-h-10 w-full items-center gap-2 rounded-xl px-3 text-left text-sm font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
          >
            <HiOutlinePlus className="h-4 w-4" />
            Add task
          </button>
          {mutation.data && !mutation.data.ok ? (
            <p role="alert" className="px-3 pt-2 text-xs text-rose-400">
              {mutation.data.message}
            </p>
          ) : null}
        </footer>
      </article>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete list?"
        description={`“${list.title}” and every task inside it will be permanently deleted.`}
        confirmLabel="Delete list"
        isLoading={isDeleting}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => void deleteList()}
      />
    </>
  );
}

export const ListColumn = memo(ListColumnComponent);
