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
import { TaskStatus, type UpdateListDto } from "@repo/shared";
import { Breadcrumb } from "~/components/ui/BreadCriumb";
import { ListColumn } from "~/components/board/ListColumn";
import { CreateListForm } from "~/components/board/CreateListForm";
import { CreateTaskDialog } from "~/components/board/CreateTaskDialog";
import { TaskDetailDialog } from "~/components/board/TaskDetailDialog";
import type { Route } from "./+types/board.$boardId";
import { EditListDialog } from "~/components/board/EditListDialog";

export function meta({ }: Route.MetaArgs) {
    return [{ title: "Board · Tsk Manager" }];
}

export async function loader({ request, params }: Route.LoaderArgs) {
    const token = await requireAccessToken(request);
    const { workspaceId, boardId } = params as { workspaceId: string; boardId: string };

    const lists = await getLists(token, boardId);

    const tasksByList = await Promise.all(
        lists.map((list) => getTasks(token, boardId, list.id).then((tasks) => [list.id, tasks] as const)),
    );

    return {
        workspaceId,
        boardId,
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

            default:
                return { ok: false, message: "Unknown action" };
        }
    } catch (error) {
        return { ok: false, message: getErrorMessage(error) };
    }
}

export default function BoardPage() {
    const { workspaceId, lists, tasksByList } = useLoaderData<typeof loader>();
    const [createTaskListId, setCreateTaskListId] = useState<string | null>(null);
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [editingList, setEditingList] = useState<UpdateListDto | null>(null);

    return (
        <main className="flex min-h-screen flex-col bg-slate-950 text-white">
            <div className="border-b border-white/10 px-4 py-5 sm:px-6 lg:px-8">
                <Breadcrumb
                    items={[
                        { label: "Workspaces", to: "/workspaces" },
                        { label: "Workspace", to: `/workspaces/${workspaceId}` },
                        { label: "Board" },
                    ]}
                />
            </div>

            <div className="flex-1 overflow-x-auto px-4 py-6 sm:px-6 lg:px-8">
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

            <CreateTaskDialog
                listId={createTaskListId}
                nextOrder={createTaskListId ? (tasksByList[createTaskListId]?.length ?? 0) : 0}
                onClose={() => setCreateTaskListId(null)}
            />

            <TaskDetailDialog task={activeTask} onClose={() => setActiveTask(null)} />
            <EditListDialog list={editingList} onClose={() => setEditingList(null)} />        </main>
    );
}