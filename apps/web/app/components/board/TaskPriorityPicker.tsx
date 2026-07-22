import { useId, useState } from "react";
import { HiChevronDown, HiOutlineFlag } from "react-icons/hi";
import { TaskPriority } from "@repo/shared";

const PRIORITY_META: Record<TaskPriority, { label: string; description: string; color: string }> = {
  [TaskPriority.LOW]: {
    label: "Low",
    description: "Can wait",
    color: "#22c55e",
  },
  [TaskPriority.MEDIUM]: {
    label: "Medium",
    description: "Normal priority",
    color: "#3b82f6",
  },
  [TaskPriority.HIGH]: {
    label: "High",
    description: "Needs attention",
    color: "#f59e0b",
  },
  [TaskPriority.URGENT]: {
    label: "Urgent",
    description: "Act immediately",
    color: "#f43f5e",
  },
};

interface TaskPriorityPickerProps {
  defaultValue?: TaskPriority;
}

export function TaskPriorityPicker({ defaultValue = TaskPriority.MEDIUM }: TaskPriorityPickerProps) {
  const [priority, setPriority] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const listboxId = useId();
  const selected = PRIORITY_META[priority];

  function selectPriority(nextPriority: TaskPriority) {
    setPriority(nextPriority);
    setOpen(false);
  }

  return (
    <fieldset className="relative" onKeyDown={(event) => event.key === "Escape" && setOpen(false)}>
      <legend className="mb-1.5 text-sm font-medium text-slate-300">Priority</legend>
      <input type="hidden" name="priority" value={priority} />

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-md border px-3 py-2.5 text-left outline-none transition hover:brightness-110 focus-visible:ring-2 focus-visible:ring-sky-400/30"
        style={{
          borderColor: `${selected.color}70`,
          backgroundColor: `${selected.color}20`,
        }}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md" style={{ backgroundColor: `${selected.color}28` }}>
            <HiOutlineFlag className="h-4 w-4" style={{ color: selected.color }} />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-slate-100">{selected.label}</span>
            <span className="block truncate text-xs text-slate-400">{selected.description}</span>
          </span>
        </span>
        <HiChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Task priority"
          className="absolute bottom-full left-0 right-0 z-30 mb-2 overflow-hidden rounded-md border border-white/10 bg-slate-950/95 p-1.5 shadow-2xl backdrop-blur-xl"
        >
          <div className="space-y-1">
            {Object.values(TaskPriority).map((option) => {
              const meta = PRIORITY_META[option];
              const isSelected = option === priority;
              return (
                <button
                  key={option}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => selectPriority(option)}
                  className={`flex w-full cursor-pointer items-center gap-3 rounded-md px-2.5 py-2 text-left outline-none transition hover:bg-white/[0.07] focus-visible:bg-white/[0.07] ${isSelected ? "bg-white/[0.05]" : ""}`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md" style={{ backgroundColor: `${meta.color}20` }}>
                    <HiOutlineFlag className="h-4 w-4" style={{ color: meta.color }} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-slate-200">{meta.label}</span>
                    <span className="block text-xs text-slate-500">{meta.description}</span>
                  </span>
                  {isSelected ? <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: meta.color }} /> : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </fieldset>
  );
}
