import { useState } from "react";
import { useLoaderData } from "react-router";
import { requireAccessToken } from "~/lib/api/auth.server";
import { getLists, createList, deleteList, updateList, type List } from "~/lib/api/list";
import {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    getTask,
    type Task,
} from "~/lib/api/task";
import { getErrorMessage } from "~/lib/api/client";
import { BoardVisibility, TaskStatus } from "@repo/shared";
import { ListColumn } from "~/components/board/ListColumn";
import { CreateListForm } from "~/components/board/CreateListForm";
import { CreateTaskDialog } from "~/components/board/CreateTaskDialog";
import { TaskDetailDialog } from "~/components/board/TaskDetailDialog";
import type { Route } from "./+types/board.$boardId";
import { EditListDialog } from "~/components/board/EditListDialog";
import { getBoard, updateBoard } from "~/lib/api/board";
import { getLabels, createLabel, updateLabel, deleteLabel } from "~/lib/api/label";
import { addBoardMember, getBoardMembers, removeBoardMember } from "~/lib/api/board-member";
import { getCurrentUser } from "~/lib/api/user";
import { BoardSettingsPanel } from "~/components/board/settings/BoardSettingsPanel";
import { HeaderActionPortal } from "~/components/layout/HeaderActionPortal";
import { HiOutlineCog } from "react-icons/hi";

export function meta({ }: Route.MetaArgs) {
    return [{ title: "Board · Tsk Manager" }];
}

export async function loader({ request, params }: Route.LoaderArgs) {
    const token = await requireAccessToken(request);
    const { workspaceId, boardId } = params as { workspaceId: string; boardId: string };

    const [board, lists, labels, members, currentUser] = await Promise.all([
        getBoard(token, workspaceId, boardId),
        getLists(token, boardId),
        getLabels(token, boardId),
        getBoardMembers(token, boardId),
        getCurrentUser(token),
    ]);

    const tasksByList = await Promise.all(
        lists.map((list) => getTasks(token, boardId, list.id).then((tasks) => [list.id, tasks] as const)),
    );

    return {
        workspaceId,
        boardId,
        board,
        labels,
        members,
        currentUserId: currentUser.id,
        lists,
        tasksByList: Object.fromEntries(tasksByList) as Record<string, Task[]>,
    };
}

export async function action({ request, params }: Route.ActionArgs) {
    const token = await requireAccessToken(request);
    const boardId = params.boardId!;
    const formData = await request.formData();
    const intent = formData.get("intent");

    try {
        switch (intent) {
            case "createList": {
                await createList(token, boardId, {
                    title: String(formData.get("title") ?? "").trim(),
                    order: Number(formData.get("order") ?? 0),
                });
                return { ok: true };
            }
            case "updateList": {
                await updateList(token, boardId, String(formData.get("listId")), {
                    title: String(formData.get("title") ?? "").trim(),
                    order: Number(formData.get("order") ?? 0),
                });
                return { ok: true };
            }

            case "deleteList": {
                await deleteList(token, boardId, String(formData.get("listId")));
                return { ok: true };
            }

            case "createTask": {
                const listId = String(formData.get("listId"));
                const dueDate = formData.get("dueDate");
                await createTask(token, boardId, listId, {
                    title: String(formData.get("title") ?? "").trim(),
                    description: String(formData.get("description") ?? "") || undefined,
                    order: Number(formData.get("order") ?? 0),
                    priority: (formData.get("priority") as any) || undefined,
                    dueDate: dueDate ? new Date(String(dueDate)).toISOString() : undefined,
                    labels: formData.getAll("labelIds").map(String),
                });
                return { ok: true };
            }

            case "updateTask": {
                const listId = String(formData.get("listId"));
                const taskId = String(formData.get("taskId"));
                const dueDate = formData.get("dueDate");
                const startDate = formData.get("startDate");

                await updateTask(token, boardId, listId, taskId, {
                    title: String(formData.get("title") ?? "").trim(),
                    description: String(formData.get("description") ?? "") || undefined,
                    order: Number(formData.get("order") ?? 0),
                    priority: (formData.get("priority") as any) || undefined,
                    dueDate: dueDate ? new Date(String(dueDate)).toISOString() : undefined,
                    startDate: startDate ? new Date(String(startDate)).toISOString() : undefined,
                    labels: formData.getAll("labelIds").map(String),
                });
                return { ok: true };
            }

            case "toggleStatus": {
                const listId = String(formData.get("listId"));
                const taskId = String(formData.get("taskId"));
                const current = await getTask(token, boardId, listId, taskId);
                const nextStatus =
                    current.status === TaskStatus.DONE ? TaskStatus.PENDING : TaskStatus.DONE;

                await updateTask(token, boardId, listId, taskId, {
                    title: current.title,
                    description: current.description ?? undefined,
                    order: current.order,
                    priority: current.priority,
                    dueDate: current.dueDate ?? undefined,
                    startDate: current.startDate ?? undefined,
                    status: nextStatus,
                });
                return { ok: true };
            }

            case "deleteTask": {
                const listId = String(formData.get("listId"));
                const taskId = String(formData.get("taskId"));
                await deleteTask(token, boardId, listId, taskId);
                return { ok: true };
            }
            case "updateBoard": {
                await updateBoard(token, boardId, {
                    name: String(formData.get("name") ?? "").trim(),
                    visibility: formData.get("visibility") === BoardVisibility.PRIVATE
                        ? BoardVisibility.PRIVATE
                        : BoardVisibility.WORKSPACE,
                });
                return { ok: true, intent };
            }
            case "addBoardMember": {
                await addBoardMember(token, boardId, {
                    email: String(formData.get("email") ?? "").trim(),
                });
                return { ok: true, intent };
            }
            case "removeBoardMember": {
                await removeBoardMember(token, boardId, String(formData.get("userId") ?? ""));
                return { ok: true, intent };
            }
            case "createLabel": {
                await createLabel(token, boardId, {
                    name: String(formData.get("name") ?? "").trim(),
                    color: String(formData.get("color") ?? ""),
                });
                return { ok: true, intent };
            }
            case "updateLabel": {
                await updateLabel(token, boardId, String(formData.get("labelId") ?? ""), {
                    name: String(formData.get("name") ?? "").trim(),
                    color: String(formData.get("color") ?? ""),
                });
                return { ok: true, intent };
            }
            case "deleteLabel": {
                await deleteLabel(token, boardId, String(formData.get("labelId") ?? ""));
                return { ok: true, intent };
            }

            default:
                return { ok: false, message: "Unknown action" };
        }
    } catch (error) {
        return { ok: false, message: getErrorMessage(error) };
    }
}

export default function BoardPage() {
    const { board, labels, members, currentUserId, lists, tasksByList } = useLoaderData<typeof loader>();
    const [createTaskListId, setCreateTaskListId] = useState<string | null>(null);
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [editingList, setEditingList] = useState<List | null>(null);
    const [settingsOpen, setSettingsOpen] = useState(false);

    return (
        <main className="flex min-h-[calc(100vh-4rem)] flex-col bg-slate-950 text-white">
            <HeaderActionPortal>
                <button
                    type="button"
                    onClick={() => setSettingsOpen((open) => !open)}
                    aria-label="Board settings"
                    aria-expanded={settingsOpen}
                    className={`rounded-full p-2 transition ${settingsOpen ? "bg-sky-400/15 text-sky-300" : "text-slate-400 hover:bg-white/10 hover:text-white"}`}
                >
                    <HiOutlineCog className="h-5 w-5" />
                </button>
            </HeaderActionPortal>

            <div className="flex min-h-0 flex-1">
              <div className="min-w-0 flex-1 overflow-x-auto px-4 py-6 sm:px-6 lg:px-8">
                <div className="mb-5 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wider text-sky-300">Board</p>
                        <h1 className="truncate text-xl font-semibold text-white">{board.name}</h1>
                    </div>
                </div>
                <div className="flex gap-4">
                    {lists.map((list) => (
                        <ListColumn
                            key={list.id}
                            list={list}
                            tasks={tasksByList[list.id] ?? []}
                            onOpenTask={setActiveTask}
                            onAddTask={setCreateTaskListId}
                            onEditList={setEditingList}
                        />
                    ))}

                    <CreateListForm nextOrder={lists.length} />
                </div>
              </div>

            </div>

            <BoardSettingsPanel
                open={settingsOpen}
                board={board}
                labels={labels}
                members={members}
                currentUserId={currentUserId}
                onClose={() => setSettingsOpen(false)}
            />

            <CreateTaskDialog
                listId={createTaskListId}
                nextOrder={createTaskListId ? (tasksByList[createTaskListId]?.length ?? 0) : 0}
                labels={labels}
                onClose={() => setCreateTaskListId(null)}
            />

            <TaskDetailDialog task={activeTask} labels={labels} onClose={() => setActiveTask(null)} />
            <EditListDialog list={editingList} onClose={() => setEditingList(null)} />
        </main>
    );
}
