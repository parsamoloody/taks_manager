// app/components/board/ListColumn.tsx
import { useFetcher } from "react-router";
import { HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import type { List } from "~/lib/api/list";
import type { Task } from "~/lib/api/task";
import { TaskCard } from "./TaskCard";
import { KebabMenu } from "~/components/ui/KebabMenu";
import type { UpdateListDto } from "@repo/shared";

interface ListColumnProps {
  list: List;
  tasks: Task[];
  onOpenTask: (task: Task) => void;
  onAddTask: (listId: string) => void;
  onEditList: (list: UpdateListDto) => void;
}

export function ListColumn({ list, tasks, onOpenTask, onAddTask, onEditList }: ListColumnProps) {
  const fetcher = useFetcher();
  const isDeleting = fetcher.state !== "idle" && fetcher.formData?.get("listId") === list.id;

  return (
    <div
      className={`group flex w-72 shrink-0 flex-col rounded-2xl border border-white/10 bg-slate-900/60 ${
        isDeleting ? "pointer-events-none opacity-40" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
        <h3 className="truncate text-sm font-semibold text-white">{list.title}</h3>
        <div className="flex items-center gap-1">

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
                onClick: () => {
                  if (!confirm(`Delete "${list.title}" and all its tasks?`)) return;
                  fetcher.submit(
                    { intent: "deleteList", listId: list.id },
                    { method: "delete" },
                  );
                },
              },
            ]}
          />
        </div>
      </div>

      <div className="flex-1 space-y-2.5 overflow-y-auto p-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onOpen={onOpenTask} />
        ))}
      </div>

      <button
        onClick={() => onAddTask(list.id)}
        className="m-3 mt-0 rounded-xl px-3 py-2 text-left text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
      >
        + Add task
      </button>
    </div>
  );
}