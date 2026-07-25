"use client";

import { useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import {
  FiCheck,
  FiChevronDown,
  FiClock,
  FiMoreHorizontal,
  FiPlus,
  FiZap,
} from "react-icons/fi";

type TaskTone = "amber" | "sky" | "violet";

interface PreviewTask {
  id: string;
  title: string;
  label: string;
  due: string;
  tone: TaskTone;
  members: readonly string[];
  initiallyComplete?: boolean;
}

interface Workflow {
  id: string;
  label: string;
  title: string;
  description: string;
  tasks: readonly PreviewTask[];
  suggestion: string;
}

const WORKFLOWS: readonly Workflow[] = [
  {
    id: "product",
    label: "Product",
    title: "Product launch",
    description: "A focused path from idea to release.",
    tasks: [
      {
        id: "product-onboarding",
        title: "Polish the onboarding flow",
        label: "Design",
        due: "Today",
        tone: "violet",
        members: ["KM", "SL"],
      },
      {
        id: "product-empty-states",
        title: "Review mobile empty states",
        label: "Product",
        due: "Tue",
        tone: "sky",
        members: ["AN"],
        initiallyComplete: true,
      },
      {
        id: "product-feedback",
        title: "Prepare the beta feedback form",
        label: "Research",
        due: "Thu",
        tone: "amber",
        members: ["SL", "AN"],
      },
    ],
    suggestion:
      "Consider collecting beta feedback before finalizing the launch story, so early insights can shape the message.",
  },
  {
    id: "marketing",
    label: "Marketing",
    title: "Launch campaign",
    description: "Keep every channel moving together.",
    tasks: [
      {
        id: "marketing-story",
        title: "Draft the launch story",
        label: "Writing",
        due: "Today",
        tone: "violet",
        members: ["SL"],
      },
      {
        id: "marketing-social",
        title: "Schedule social previews",
        label: "Social",
        due: "Wed",
        tone: "sky",
        members: ["KM", "AN"],
        initiallyComplete: true,
      },
      {
        id: "marketing-metrics",
        title: "Choose campaign success metrics",
        label: "Strategy",
        due: "Fri",
        tone: "amber",
        members: ["AN"],
      },
    ],
    suggestion:
      "A short campaign checklist could make handoffs between writing, design, and scheduling easier to follow.",
  },
  {
    id: "personal",
    label: "My week",
    title: "Weekly focus",
    description: "Make space for the work that matters.",
    tasks: [
      {
        id: "personal-focus",
        title: "Plan a focused work block",
        label: "Focus",
        due: "9:30 AM",
        tone: "violet",
        members: ["YOU"],
      },
      {
        id: "personal-update",
        title: "Send the weekly update",
        label: "Team",
        due: "Thu",
        tone: "sky",
        members: ["YOU"],
        initiallyComplete: true,
      },
      {
        id: "personal-reading",
        title: "Clear the saved reading queue",
        label: "Personal",
        due: "Fri",
        tone: "amber",
        members: ["YOU"],
      },
    ],
    suggestion:
      "Try placing the focus block first and moving smaller updates later, while your attention is still fresh.",
  },
];

const TASK_TONES: Record<TaskTone, string> = {
  amber: "border-amber-300/15 bg-amber-300/10 text-amber-200",
  sky: "border-sky-300/15 bg-sky-300/10 text-sky-200",
  violet: "border-violet-300/15 bg-violet-300/10 text-violet-200",
};

const INITIAL_COMPLETED_TASKS = WORKFLOWS.flatMap((workflow) =>
  workflow.tasks
    .filter((task) => task.initiallyComplete)
    .map((task) => task.id),
);

function AvatarStack({ members }: { members: readonly string[] }) {
  return (
    <div
      className="flex -space-x-1.5"
      aria-label={`Assigned to ${members.join(" and ")}`}
    >
      {members.map((member, index) => (
        <span
          key={member}
          aria-hidden="true"
          className={`grid h-6 w-6 place-items-center rounded-full border-2 border-slate-900 text-[8px] font-bold tracking-tight text-white ${
            index % 2 === 0
              ? "bg-gradient-to-br from-sky-400 to-blue-600"
              : "bg-gradient-to-br from-violet-400 to-fuchsia-600"
          }`}
        >
          {member}
        </span>
      ))}
    </div>
  );
}

export function LandingBoardPreview() {
  const previewId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [activeWorkflowId, setActiveWorkflowId] = useState(WORKFLOWS[0].id);
  const [completedTaskIds, setCompletedTaskIds] = useState<ReadonlySet<string>>(
    () => new Set(INITIAL_COMPLETED_TASKS),
  );

  const activeWorkflow =
    WORKFLOWS.find((workflow) => workflow.id === activeWorkflowId) ??
    WORKFLOWS[0];
  const completedCount = activeWorkflow.tasks.filter((task) =>
    completedTaskIds.has(task.id),
  ).length;

  function selectTab(index: number) {
    const workflow = WORKFLOWS[index];
    if (!workflow) return;

    setActiveWorkflowId(workflow.id);
    tabRefs.current[index]?.focus();
  }

  function handleTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let nextIndex: number | undefined;

    switch (event.key) {
      case "ArrowRight":
        nextIndex = (index + 1) % WORKFLOWS.length;
        break;
      case "ArrowLeft":
        nextIndex = (index - 1 + WORKFLOWS.length) % WORKFLOWS.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = WORKFLOWS.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    selectTab(nextIndex);
  }

  function toggleTask(taskId: string) {
    setCompletedTaskIds((current) => {
      const next = new Set(current);

      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }

      return next;
    });
  }

  return (
    <section
      aria-label="Interactive task board preview"
      className="relative isolate mx-auto w-full max-w-[760px]"
    >
      <div
        aria-hidden="true"
        className="absolute -inset-8 -z-10 bg-[radial-gradient(circle_at_75%_25%,rgba(139,92,246,0.2),transparent_40%),radial-gradient(circle_at_20%_80%,rgba(56,189,248,0.18),transparent_38%)] blur-2xl"
      />

      <div className="overflow-hidden rounded-[26px] border border-white/12 bg-slate-950/90 shadow-[0_36px_110px_-42px_rgba(56,189,248,0.48)] ring-1 ring-white/5 backdrop-blur-xl">
        <div className="flex h-11 items-center justify-between border-b border-white/8 bg-white/[0.035] px-4">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          </div>
          <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.16em] text-slate-500 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            Interactive preview
          </div>
        </div>

        <div className="grid min-h-[480px] sm:grid-cols-[148px_minmax(0,1fr)]">
          <aside
            aria-label="Preview navigation"
            className="hidden border-r border-white/8 bg-slate-950/60 p-3 sm:block"
          >
            <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.04] px-2.5 py-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-sky-400 to-violet-500 text-[10px] font-black text-white shadow-lg shadow-sky-500/15">
                T
              </span>
              <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-slate-200">
                Northstar
              </span>
              <FiChevronDown
                aria-hidden="true"
                className="text-slate-500"
                size={12}
              />
            </div>

            <nav
              className="mt-5 space-y-1 text-[11px]"
              aria-label="Example workspace"
            >
              <div className="rounded-lg px-2.5 py-2 text-slate-500">
                Overview
              </div>
              <div className="rounded-lg px-2.5 py-2 text-slate-500">
                My tasks
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-sky-400/10 px-2.5 py-2 font-medium text-sky-200 ring-1 ring-sky-300/10">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-sky-300"
                  aria-hidden="true"
                />
                Team board
              </div>
            </nav>

            <div className="mt-6 border-t border-white/8 pt-4">
              <p className="px-2.5 text-[9px] font-semibold tracking-[0.16em] text-slate-600 uppercase">
                Views
              </p>
              <div className="mt-2 space-y-1 px-2.5 text-[10px] text-slate-500">
                <p>Today</p>
                <p>Upcoming</p>
                <p>Completed</p>
              </div>
            </div>
          </aside>

          <div className="min-w-0 bg-[linear-gradient(145deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))] p-3 sm:p-5">
            <div
              role="tablist"
              aria-label="Choose a workflow preview"
              className="grid grid-cols-3 gap-1 rounded-xl border border-white/8 bg-black/20 p-1"
            >
              {WORKFLOWS.map((workflow, index) => {
                const isSelected = workflow.id === activeWorkflow.id;

                return (
                  <button
                    key={workflow.id}
                    ref={(element) => {
                      tabRefs.current[index] = element;
                    }}
                    id={`${previewId}-tab-${workflow.id}`}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    aria-controls={`${previewId}-panel-${workflow.id}`}
                    tabIndex={isSelected ? 0 : -1}
                    onClick={() => setActiveWorkflowId(workflow.id)}
                    onKeyDown={(event) => handleTabKeyDown(event, index)}
                    className={`cursor-pointer rounded-lg px-2 py-2 text-[10px] font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 motion-reduce:transition-none sm:text-xs ${
                      isSelected
                        ? "bg-white/10 text-white shadow-sm ring-1 ring-white/10"
                        : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-300"
                    }`}
                  >
                    {workflow.label}
                  </button>
                );
              })}
            </div>

            <div
              key={activeWorkflow.id}
              id={`${previewId}-panel-${activeWorkflow.id}`}
              role="tabpanel"
              aria-labelledby={`${previewId}-tab-${activeWorkflow.id}`}
              tabIndex={0}
              className="mt-5 focus-visible:rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-300"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.18em] text-sky-300/80 uppercase">
                    Active board
                  </p>
                  <h3 className="mt-1 text-lg font-semibold tracking-tight text-white sm:text-xl">
                    {activeWorkflow.title}
                  </h3>
                  <p className="mt-1 text-[11px] leading-5 text-slate-500 sm:text-xs">
                    {activeWorkflow.description}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="More preview board options"
                  className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-lg text-slate-500 transition hover:bg-white/8 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 motion-reduce:transition-none"
                >
                  <FiMoreHorizontal aria-hidden="true" size={17} />
                </button>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-200">
                    In progress
                  </span>
                  <span
                    aria-live="polite"
                    className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[9px] font-medium text-slate-400"
                  >
                    {completedCount}/{activeWorkflow.tasks.length} done
                  </span>
                </div>
                <button
                  type="button"
                  aria-label="Add task in this preview"
                  className="flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium text-slate-500 transition hover:bg-white/[0.05] hover:text-slate-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 motion-reduce:transition-none"
                >
                  <FiPlus aria-hidden="true" size={12} />
                  Add task
                </button>
              </div>

              <ul
                className="mt-2 space-y-2"
                aria-label={`${activeWorkflow.title} tasks`}
              >
                {activeWorkflow.tasks.map((task) => {
                  const isComplete = completedTaskIds.has(task.id);

                  return (
                    <li
                      key={task.id}
                      className={`group rounded-xl border p-3 transition motion-reduce:transition-none ${
                        isComplete
                          ? "border-white/[0.05] bg-white/[0.025]"
                          : "border-white/8 bg-white/[0.045] hover:border-sky-300/20 hover:bg-white/[0.065]"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <button
                          type="button"
                          aria-label={
                            isComplete
                              ? `Mark “${task.title}” as not complete`
                              : `Mark “${task.title}” as complete`
                          }
                          aria-pressed={isComplete}
                          onClick={() => toggleTask(task.id)}
                          className={`mt-0.5 grid h-[18px] w-[18px] shrink-0 cursor-pointer place-items-center rounded-full border transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 motion-reduce:transition-none ${
                            isComplete
                              ? "border-emerald-300 bg-emerald-400 text-slate-950 shadow-[0_0_12px_rgba(52,211,153,0.25)]"
                              : "border-slate-600 bg-slate-900 hover:border-sky-300"
                          }`}
                        >
                          {isComplete && (
                            <FiCheck
                              aria-hidden="true"
                              size={11}
                              strokeWidth={3}
                            />
                          )}
                        </button>

                        <div className="min-w-0 flex-1">
                          <p
                            className={`truncate text-xs font-medium transition motion-reduce:transition-none sm:text-[13px] ${
                              isComplete
                                ? "text-slate-600 line-through"
                                : "text-slate-100"
                            }`}
                          >
                            {task.title}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full border px-2 py-0.5 text-[8px] font-semibold ${TASK_TONES[task.tone]}`}
                            >
                              {task.label}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[9px] text-slate-500">
                              <FiClock aria-hidden="true" size={10} />
                              {task.due}
                            </span>
                          </div>
                        </div>

                        <AvatarStack members={task.members} />
                      </div>
                    </li>
                  );
                })}
              </ul>

              <aside
                aria-label="AI suggestion preview"
                className="mt-3 overflow-hidden rounded-xl border border-violet-300/15 bg-[linear-gradient(135deg,rgba(139,92,246,0.12),rgba(56,189,248,0.07))] p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-lg bg-violet-400/15 text-violet-200 ring-1 ring-violet-300/15">
                    <FiZap aria-hidden="true" size={12} />
                  </span>
                  <p className="text-[9px] font-bold tracking-[0.16em] text-violet-200 uppercase">
                    AI suggestion · Preview
                  </p>
                </div>
                <p className="mt-2 text-[10px] leading-[1.55] text-slate-300 sm:text-[11px]">
                  {activeWorkflow.suggestion}
                </p>
                <p className="mt-2 text-[8px] text-slate-600">
                  Example only — this preview does not send or change data.
                </p>
              </aside>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-3 text-center text-[10px] text-slate-600">
        Try the workflow tabs or check off a task.
      </p>
    </section>
  );
}

export default LandingBoardPreview;
