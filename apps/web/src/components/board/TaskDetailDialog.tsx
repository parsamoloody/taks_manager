// app/components/board/TaskDetailDialog.tsx
import { useEffect, useRef, useState } from "react";
import { HiOutlineLightBulb, HiOutlinePencil, HiOutlineSparkles } from "react-icons/hi";
import type { LabelDto } from "@repo/shared";
import type { Task } from "~/server/api/task";
import type { Board } from "~/server/api/board";
import { Modal } from "~/components/ui/Modal";
import { Button } from "~/components/ui/Button";
import { ConfirmDialog } from "~/components/ui/ConfirmDialog";
import { FormInput, FormTextarea } from "~/components/ui/FormField";
import { TaskLabelPicker } from "./TaskLabelPicker";
import { HiOutlineBell } from "react-icons/hi";
import { TaskPriorityPicker } from "./TaskPriorityPicker";
import { TaskAssigneePicker } from "./TaskAssigneePicker";
import { MutationForm, useMutation } from "~/modules/mutations/client";
import {
  getTaskDueInfo,
  reminderTitle,
  type TaskDueState,
} from "~/lib/taskDue";

interface TaskDetailDialogProps {
  task: Task | null;
  boardId: string;
  onClose: () => void;
  labels: LabelDto[];
  members: Board["members"];
}

function toDateInputValue(value?: string | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export function TaskDetailDialog({
  task,
  boardId,
  onClose,
  labels,
  members,
}: TaskDetailDialogProps) {
  const mutation = useMutation<{ ok: boolean; message?: string }>();
  const formRef = useRef<HTMLFormElement>(null);
  const submissionStartedRef = useRef(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [titleDraft, setTitleDraft] = useState(task?.title ?? "");
  const [descriptionDraft, setDescriptionDraft] = useState(task?.description ?? "");
  const [aiLoadingMode, setAiLoadingMode] = useState<"fix" | "enhance" | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const isSubmitting = mutation.state !== "idle";

  useEffect(() => {
    if (task) {
      setTitleDraft(task.title);
      setDescriptionDraft(task.description ?? "");
      setAiError(null);
    }
  }, [task?.id, task?.title, task?.description]);

  useEffect(() => {
    if (mutation.state !== "idle") {
      submissionStartedRef.current = true;
      return;
    }

    if (submissionStartedRef.current && mutation.data?.ok) {
      submissionStartedRef.current = false;
      onClose();
    }
  }, [mutation.state, mutation.data, onClose]);

  if (!task) return null;
  const dueInfo = getTaskDueInfo(task.dueDate, task.status === "DONE");

  async function handleImproveTask(mode: "fix" | "enhance") {
    if (!task) return;

    setAiError(null);
    setAiLoadingMode(mode);

    try {
      const response = await fetch(`/api/task/ai/${boardId}/${task.listId}/${task.id}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode,
          title: titleDraft,
          description: descriptionDraft,
        }),
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        message?: string;
        title?: string;
        description?: string;
      };

      if (!response.ok || payload.ok === false) {
        throw new Error(payload.message || "AI could not refine this task right now.");
      }

      await Promise.all([
        typeText(payload.title ?? task.title, setTitleDraft),
        typeText(payload.description ?? task.description ?? "", setDescriptionDraft),
      ]);
    } catch (error) {
      setAiError(
        error instanceof Error
          ? error.message
          : "AI could not refine this task right now.",
      );
    } finally {
      setAiLoadingMode(null);
    }
  }

  return (
    <>
      <Modal
        open={Boolean(task) && !confirmDelete}
        onClose={onClose}
        title="Task details"
        size="lg"
      >
        <MutationForm mutation={mutation} ref={formRef} className="space-y-4">
          <input type="hidden" name="intent" value="updateTask" />
          <input type="hidden" name="taskId" value={task.id} />
          <input type="hidden" name="listId" value={task.listId} />
          <input type="hidden" name="order" value={task.order} />

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <HiOutlinePencil className="h-3.5 w-3.5" />
            Click a value to edit it
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void handleImproveTask("fix")}
              disabled={aiLoadingMode !== null}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-700/80 bg-slate-900/70 px-2.5 py-1.5 text-[11px] font-semibold text-slate-200 transition-colors duration-100 motion-reduce:transition-none hover:border-sky-400/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <HiOutlineSparkles className="h-3.5 w-3.5" />
              Fix
            </button>
            <button
              type="button"
              onClick={() => void handleImproveTask("enhance")}
              disabled={aiLoadingMode !== null}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-700/80 bg-slate-900/70 px-2.5 py-1.5 text-[11px] font-semibold text-slate-200 transition-colors duration-100 motion-reduce:transition-none hover:border-fuchsia-400/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <HiOutlineLightBulb className="h-3.5 w-3.5" />
              Enhance
            </button>
          </div>

          {aiError ? (
            <p role="alert" className="text-sm text-rose-400">
              {aiError}
            </p>
          ) : null}

          <div className={aiLoadingMode ? aiFieldShellClass(aiLoadingMode) : "rounded-2xl"}>
            <FormInput
              id="title"
              name="title"
              aria-label="Task title"
              value={titleDraft}
              onChange={(event) => setTitleDraft(event.target.value)}
              required
              maxLength={100}
              className="border-transparent bg-transparent px-2 py-1.5 text-2xl font-semibold leading-tight hover:bg-white/4 focus:border-sky-400/50 focus:bg-slate-950/60 focus:ring-2"
            />
          </div>

          <div className={aiLoadingMode ? aiFieldShellClass(aiLoadingMode) : "rounded-2xl"}>
            <FormTextarea
              id="description"
              name="description"
              label="Description"
              value={descriptionDraft}
              onChange={(event) => setDescriptionDraft(event.target.value)}
              rows={4}
              placeholder="Add a description…"
              className="border-transparent bg-transparent px-2 py-2 leading-6 hover:bg-white/4 focus:border-sky-400/50 focus:bg-slate-950/60 focus:ring-2"
            />
          </div>

          <div className="border-t border-white/10 pt-4">
            <TaskAssigneePicker
              key={task.id}
              members={members}
              defaultSelected={task.assignee?.map((item) => item.userId)}
            />
          </div>
          <div className="border-t border-white/10 pt-4">
            <TaskLabelPicker
              key={task.id}
              labels={labels}
              defaultSelected={task.labels?.map((item) => item.labelId)}
            />
          </div>
          <div className="grid pb-6 grid-cols-1 gap-3 border-t border-b border-white/10 pt-4 sm:grid-cols-3">
            <TaskPriorityPicker key={task.id} defaultValue={task.priority} />

            <FormInput
              id="dueDate"
              name="dueDate"
              label={
                <span className="inline-flex items-center gap-1.5">
                  Due date
                  {(task.assignee?.length ?? 0) > 0 ? (
                    <HiOutlineBell
                      className="h-3.5 w-3.5 text-slate-500"
                      title={reminderTitle()}
                    />
                  ) : null}
                </span>
              }
              optional
              type="date"
              defaultValue={toDateInputValue(task.dueDate)}
              className={`bg-transparent px-2 hover:bg-white/4 focus:border-sky-400/50 focus:bg-slate-950/60 ${dueDateInputClass(dueInfo?.state)}`}
            />

            <FormInput
              id="startDate"
              name="startDate"
              label="Start date"
              optional
              type="date"
              defaultValue={toDateInputValue(task.startDate)}
              className="border-transparent bg-transparent px-2 hover:bg-white/4 focus:border-sky-400/50 focus:bg-slate-950/60"
            />
          </div>

          {mutation.data && !mutation.data.ok && (
            <p role="alert" className="text-sm text-rose-400">
              {mutation.data.message}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setConfirmDelete(true)}
              className="min-h-10 cursor-pointer rounded-xl px-3 text-sm font-medium text-rose-400 transition-colors duration-100 motion-reduce:transition-none hover:bg-rose-400/10 hover:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Delete task
            </button>

            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Save changes
              </Button>
            </div>
          </div>
        </MutationForm>
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete task?"
        description={`“${task.title}” will be permanently removed from this board.`}
        confirmLabel="Delete task"
        isLoading={isSubmitting}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() =>
          void mutation.submit({
            intent: "deleteTask",
            taskId: task.id,
            listId: task.listId,
          })
        }
      />
    </>
  );
}

function aiFieldShellClass(mode: "fix" | "enhance") {
  if (mode === "enhance") {
    return "rounded-2xl border border-fuchsia-400/40 bg-fuchsia-400/[0.08] p-1 shadow-[0_0_0_1px_rgba(192,132,252,0.18),0_0_18px_rgba(217,70,239,0.16)]";
  }

  return "rounded-2xl border border-sky-400/40 bg-sky-400/[0.08] p-1 shadow-[0_0_0_1px_rgba(56,189,248,0.18),0_0_18px_rgba(56,189,248,0.16)]";
}

function typeText(value: string, setter: (value: string) => void) {
  return new Promise<void>((resolve) => {
    setter("");

    if (!value) {
      resolve();
      return;
    }

    let index = 0;
    const step = () => {
      setter(value.slice(0, index + 1));
      index += 1;

      if (index < value.length) {
        window.setTimeout(step, 18);
      } else {
        resolve();
      }
    };

    window.setTimeout(step, 18);
  });
}

function dueDateInputClass(state?: TaskDueState) {
  if (state === "overdue" || state === "today") {
    return "border-rose-400/40 bg-rose-400/[0.08] text-rose-100";
  }
  if (state === "soon") {
    return "border-amber-300/30 bg-amber-300/[0.06] text-amber-100";
  }
  return "border-transparent";
}
