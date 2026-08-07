import { useMemo, useState } from "react";
import type { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import { TaskStatus, type UserDto } from "@repo/shared";
import {
  HiOutlineCog,
  HiOutlineLockClosed,
  HiOutlineSearch,
  HiOutlineUserGroup,
} from "react-icons/hi";
import { CreateListForm } from "~/components/board/CreateListForm";
import { ListColumn } from "~/components/board/ListColumn";
import { HeaderActionPortal } from "~/components/layout/HeaderActionPortal";
import { Badge } from "~/components/ui/Badge";
import { Breadcrumb } from "~/components/ui/Breadcrumb";
import { GroupMembers } from "~/components/ui/GroupMembers";
import { MutationProvider, useMutation } from "~/modules/mutations/client";
import { getBoard, type Board, type BoardDetailList } from "~/server/api/board";
import type { List } from "~/server/api/list";
import type { Task } from "~/server/api/task";
import { getCurrentUser } from "~/server/api/user";
import { loadProtectedPage } from "~/server/auth/page";

const EMPTY_TASKS: Task[] = [];
const EMPTY_LISTS: BoardDetailList[] = [];

const BoardSettingsPanel = dynamic(
  () =>
    import("~/components/board/settings/BoardSettingsPanel").then(
      (module) => module.BoardSettingsPanel,
    ),
  { ssr: false },
);
const CreateTaskDialog = dynamic(
  () =>
    import("~/components/board/CreateTaskDialog").then(
      (module) => module.CreateTaskDialog,
    ),
  { ssr: false },
);
const TaskDetailDialog = dynamic(
  () =>
    import("~/components/board/TaskDetailDialog").then(
      (module) => module.TaskDetailDialog,
    ),
  { ssr: false },
);
const EditListDialog = dynamic(
  () =>
    import("~/components/board/EditListDialog").then(
      (module) => module.EditListDialog,
    ),
  { ssr: false },
);

interface BoardPageProps {
  user: UserDto;
  board: Board;
}

export const getServerSideProps: GetServerSideProps<BoardPageProps> = async (
  context,
) =>
  loadProtectedPage(context, async (token) => {
    const workspaceId = context.params?.workspaceId;
    const boardId = context.params?.boardId;
    if (
      typeof workspaceId !== "string" ||
      typeof boardId !== "string" ||
      !workspaceId ||
      !boardId
    ) {
      return null;
    }

    const [user, board] = await Promise.all([
      getCurrentUser(token),
      getBoard(token, workspaceId, boardId),
    ]);

    return { user, board };
  });

function BoardPageContent({ board, user }: BoardPageProps) {
  const mutation = useMutation<{ ok: boolean; message?: string }>();
  const [createTaskListId, setCreateTaskListId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [editingList, setEditingList] = useState<List | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [draggingSourceListId, setDraggingSourceListId] = useState<string | null>(null);
  const [lists, setLists] = useState(board.lists ?? EMPTY_LISTS);
  const labels = board.labels ?? [];
  const members = board.members;
  const allTasks = useMemo(
    () => lists.flatMap((list) => list.tasks ?? EMPTY_TASKS),
    [lists],
  );
  const completedTaskCount = allTasks.filter(
    (task) => task.status === TaskStatus.DONE,
  ).length;
  const progress =
    allTasks.length === 0
      ? 0
      : Math.round((completedTaskCount / allTasks.length) * 100);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const tasksByList = useMemo(
    () =>
      Object.fromEntries(
        lists.map((list) => [
          list.id,
          normalizedQuery
            ? list.tasks.filter((task) =>
                [
                  task.title,
                  task.description ?? "",
                  ...(task.labels?.map(({ label }) => label.name) ?? []),
                ].some((value) =>
                  value.toLocaleLowerCase().includes(normalizedQuery),
                ),
              )
            : list.tasks,
        ]),
      ) as Record<string, Task[]>,
    [lists, normalizedQuery],
  );
  const membersById = useMemo(
    () =>
      Object.fromEntries(
        members.map(({ user: member }) => [member.id, member]),
      ),
    [members],
  );
  const memberAvatars = members.map(({ user: member }) => ({
    id: member.id,
    avatar: member.avatar,
    name:
      [member.firstName, member.lastName].filter(Boolean).join(" ") ||
      member.email ||
      "Member",
  }));
  const nextListOrder =
    lists.reduce((highest, list) => Math.max(highest, list.order), -1) + 1;

  function applyTaskOrderPlan(
    currentLists: typeof lists,
    sourceListId: string,
    targetListId: string,
    movedTaskId: string,
    targetOrder: number,
  ) {
    const sourceList = currentLists.find((list) => list.id === sourceListId);
    const targetList = currentLists.find((list) => list.id === targetListId);

    if (!sourceList || !targetList || !movedTaskId) {
      return currentLists;
    }

    const sourceTasks = [...sourceList.tasks].sort((a, b) => a.order - b.order);
    const targetTasks = [...targetList.tasks].sort((a, b) => a.order - b.order);
    const movedTask = sourceTasks.find((task) => task.id === movedTaskId);

    if (!movedTask) {
      return currentLists;
    }

    const safeTargetOrder = Math.max(
      0,
      Math.min(targetOrder, sourceListId === targetListId ? sourceTasks.length : targetTasks.length),
    );

    if (sourceListId === targetListId) {
      const withoutMoved = sourceTasks.filter((task) => task.id !== movedTaskId);
      const reordered = [
        ...withoutMoved.slice(0, safeTargetOrder),
        movedTask,
        ...withoutMoved.slice(safeTargetOrder),
      ];

      return currentLists.map((list) =>
        list.id === sourceListId
          ? {
              ...list,
              tasks: reordered.map((task, index) => ({ ...task, order: index + 1 })),
            }
          : list,
      );
    }

    const sourceWithoutMoved = sourceTasks.filter((task) => task.id !== movedTaskId);
    const targetWithoutMoved = targetTasks.filter((task) => task.id !== movedTaskId);
    const nextTargetTasks = [
      ...targetWithoutMoved.slice(0, safeTargetOrder),
      { ...movedTask, listId: targetListId },
      ...targetWithoutMoved.slice(safeTargetOrder),
    ];

    return currentLists.map((list) => {
      if (list.id === sourceListId) {
        return {
          ...list,
          tasks: sourceWithoutMoved.map((task, index) => ({ ...task, order: index + 1 })),
        };
      }

      if (list.id === targetListId) {
        return {
          ...list,
          tasks: nextTargetTasks.map((task, index) => ({ ...task, order: index + 1 })),
        };
      }

      return list;
    });
  }

  async function handleReorderTask(
    sourceListId: string,
    targetListId: string,
    movedTaskId: string,
    targetOrder: number,
  ) {
    if (!movedTaskId) return;

    const previousLists = lists;
    const optimisticLists = applyTaskOrderPlan(
      previousLists,
      sourceListId,
      targetListId,
      movedTaskId,
      targetOrder,
    );

    setDraggingTaskId(null);
    setDraggingSourceListId(null);
    setLists(optimisticLists);

    const result = await mutation.submit({
      intent: "reorderTask",
      sourceListId,
      targetListId,
      movedTaskId,
      targetOrder,
    });

    if (!result?.ok) {
      setLists(previousLists);
    }
  }
  const activeListTasks = createTaskListId
    ? (lists.find((list) => list.id === createTaskListId)?.tasks ?? EMPTY_TASKS)
    : EMPTY_TASKS;
  const nextTaskOrder =
    activeListTasks.reduce(
      (highest, task) => Math.max(highest, task.order),
      -1,
    ) + 1;

  return (
    <>
      <Head>
        <title>{board.name} · Tsk Manager</title>
        <meta
          name="description"
          content={
            board.description?.trim() || `Manage tasks on ${board.name}.`
          }
        />
      </Head>

      <main
        id="main-content"
        className="product-grid flex h-[calc(100dvh-4rem)] min-h-[36rem] flex-col overflow-hidden bg-slate-950 text-white"
      >
        <HeaderActionPortal>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            aria-label="Board settings"
            aria-expanded={settingsOpen}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${
              settingsOpen
                ? "bg-sky-400/15 text-sky-300"
                : "text-slate-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <HiOutlineCog className="h-5 w-5" />
          </button>
        </HeaderActionPortal>

        <header className="shrink-0 border-b border-white/[0.08] bg-slate-950/80 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[100rem]">
            <Breadcrumb
              items={[
                { label: "Workspaces", to: "/workspaces" },
                {
                  label: board.workspace?.name ?? "Workspace",
                  to: `/workspaces/${board.workspaceId}`,
                },
                { label: board.name },
              ]}
            />

            <div className="mt-3 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="truncate text-2xl font-semibold tracking-[-0.035em] text-white sm:text-3xl">
                    {board.name}
                  </h1>
                  {board.visibility === "PRIVATE" ? (
                    <Badge className="border-violet-300/20 bg-violet-400/10 text-violet-100">
                      <HiOutlineLockClosed className="mr-1 h-3 w-3" />
                      Private
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-1.5 max-w-2xl truncate text-xs text-slate-500 sm:text-sm">
                  {board.description?.trim() ||
                    "Keep the next step visible and the whole project moving."}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {/* <div className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-2 sm:justify-start">
                  <div>
                    <p className="text-xs font-semibold text-white">
                      {completedTaskCount}/{allTasks.length} complete
                    </p>
                    <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-300 transition-[width] duration-500 motion-reduce:transition-none"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-300">
                    {progress}%
                  </span>
                </div> */}

                <div className="flex items-center gap-2">
                  <HiOutlineUserGroup className="h-4 w-4 text-slate-600" />
                  <GroupMembers members={memberAvatars} max={4} size="xs" />
                </div>

                <label className="relative block min-w-0 sm:w-64">
                  <span className="sr-only">Filter tasks</span>
                  <HiOutlineSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Filter tasks"
                    className="min-h-10 w-full rounded-xl border border-white/10 bg-slate-900/80 py-2 pl-9 pr-3 text-xs text-white outline-none transition placeholder:text-slate-600 hover:border-white/20 focus:border-sky-300/45 focus:ring-2 focus:ring-sky-300/15"
                  />
                </label>
              </div>
            </div>
          </div>
        </header>

        <section
          aria-label={`${board.name} lists`}
          className="board-scrollbar min-h-0 flex-1 snap-x snap-proximity overflow-x-auto overflow-y-hidden scroll-px-4 px-4 py-4 sm:px-6 lg:px-8"
        >
          <div className="mx-auto flex h-full w-max min-w-full max-w-[100rem] gap-4">
            {lists.map((list) => (
              <ListColumn
                key={list.id}
                list={list}
                tasks={tasksByList[list.id] ?? EMPTY_TASKS}
                totalTaskCount={list.tasks.length}
                isFiltered={Boolean(normalizedQuery)}
                membersById={membersById}
                onOpenTask={setActiveTask}
                onAddTask={setCreateTaskListId}
                onEditList={setEditingList}
                onReorderTask={handleReorderTask}
                draggingTaskId={draggingTaskId}
                draggingSourceListId={draggingSourceListId}
                onDragStart={(taskId, listId) => {
                  setDraggingTaskId(taskId);
                  setDraggingSourceListId(listId);
                }}
                onDragEnd={() => {
                  setDraggingTaskId(null);
                  setDraggingSourceListId(null);
                }}
              />
            ))}

            <CreateListForm nextOrder={nextListOrder} />
          </div>
        </section>

        {settingsOpen ? (
          <BoardSettingsPanel
            open
            board={board}
            labels={labels}
            members={members}
            currentUserId={user.id}
            onClose={() => setSettingsOpen(false)}
          />
        ) : null}

        {createTaskListId ? (
          <CreateTaskDialog
            listId={createTaskListId}
            nextOrder={nextTaskOrder}
            labels={labels}
            members={members}
            onClose={() => setCreateTaskListId(null)}
          />
        ) : null}

        {activeTask ? (
          <TaskDetailDialog
            task={activeTask}
            boardId={board.id}
            labels={labels}
            members={members}
            onClose={() => setActiveTask(null)}
          />
        ) : null}

        {editingList ? (
          <EditListDialog
            list={editingList}
            onClose={() => setEditingList(null)}
          />
        ) : null}
      </main>
    </>
  );
}

export default function BoardPage(props: BoardPageProps) {
  return (
    <MutationProvider endpoint={`/api/mutations/boards/${props.board.id}`}>
      <BoardPageContent {...props} />
    </MutationProvider>
  );
}
