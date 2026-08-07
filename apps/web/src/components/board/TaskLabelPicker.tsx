import { useId, useState } from "react";
import { HiChevronDown, HiOutlinePlus, HiOutlineX } from "react-icons/hi";
import type { LabelDto } from "@repo/shared";
import { useListboxControls } from "~/components/ui/useListboxControls";

interface TaskLabelPickerProps {
  labels: LabelDto[];
  defaultSelected?: string[];
}

export function TaskLabelPicker({
  labels,
  defaultSelected = [],
}: TaskLabelPickerProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(defaultSelected);
  const [open, setOpen] = useState(false);
  const listboxId = useId();
  const {
    closeAndRestoreFocus,
    containerRef,
    handleKeyDown,
    listboxRef,
    triggerRef,
  } = useListboxControls({ open, setOpen });
  const selectedLabels = selectedIds
    .map((id) => labels.find((label) => label.id === id))
    .filter((label): label is LabelDto => Boolean(label));
  const availableLabels = labels.filter(
    (label) => !selectedIds.includes(label.id),
  );

  function addLabel(labelId: string) {
    if (!labelId || selectedIds.includes(labelId)) return;
    setSelectedIds((current) => [...current, labelId]);
    closeAndRestoreFocus();
  }

  function removeLabel(labelId: string) {
    setSelectedIds((current) => current.filter((id) => id !== labelId));
  }

  return (
    <fieldset onKeyDown={handleKeyDown}>
      <legend className="mb-2 text-sm font-medium text-slate-300">
        Labels <span className="font-normal text-slate-500">(optional)</span>
      </legend>

      {selectedLabels.length ? (
        <div className="mb-2 flex flex-wrap gap-2" aria-label="Selected labels">
          {selectedLabels.map((label) => (
            <span
              key={label.id}
              className="inline-flex items-center gap-1.5 rounded-full border py-1 pl-2.5 pr-1 text-xs font-medium text-slate-100"
              style={{
                borderColor: `${label.color}70`,
                backgroundColor: `${label.color}20`,
              }}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: label.color }}
              />
              {label.name}
              <button
                type="button"
                onClick={() => removeLabel(label.id)}
                aria-label={`Remove ${label.name}`}
                className="ml-0.5 cursor-pointer rounded-full p-0.5 text-slate-400 transition-colors duration-100 motion-reduce:transition-none hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              >
                <HiOutlineX className="h-3.5 w-3.5" />
              </button>
              <input type="hidden" name="labelIds" value={label.id} />
            </span>
          ))}
        </div>
      ) : (
        <p className="mb-2 text-xs text-slate-500">No labels selected</p>
      )}

      {labels.length ? (
        <div ref={containerRef} className="relative">
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setOpen((current) => !current)}
            disabled={availableLabels.length === 0}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listboxId}
            className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-left text-sm text-slate-300 outline-none transition-colors duration-100 motion-reduce:transition-none hover:border-white/20 hover:bg-slate-950/80 focus-visible:border-sky-400/50 focus-visible:ring-2 focus-visible:ring-sky-400/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white/5 text-slate-400">
                <HiOutlinePlus className="h-3.5 w-3.5" />
              </span>
              {availableLabels.length ? "Add a label" : "All labels selected"}
            </span>
            <HiChevronDown
              className={`h-4 w-4 text-slate-500 transition-transform duration-100 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
            />
          </button>

          {open && availableLabels.length ? (
            <div
              ref={listboxRef}
              id={listboxId}
              role="listbox"
              aria-label="Available labels"
              className="absolute bottom-full left-0 right-0 z-30 mb-2 overflow-hidden rounded-xl border border-white/10 bg-slate-950/98 p-1.5 shadow-[0_24px_60px_-18px_rgba(0,0,0,0.85)]"
            >
              <p className="px-2 pb-1.5 pt-1 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                Choose labels
              </p>
              <div className="max-h-44 space-y-1 overflow-y-auto">
                {availableLabels.map((label) => (
                  <button
                    key={label.id}
                    type="button"
                    role="option"
                    aria-selected="false"
                    tabIndex={-1}
                    onClick={() => addLabel(label.id)}
                    className="group flex w-full cursor-pointer items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors duration-100 motion-reduce:transition-none hover:bg-white/[0.07] focus-visible:bg-white/[0.07] focus-visible:outline-none"
                  >
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                      style={{ backgroundColor: `${label.color}20` }}
                    >
                      <span
                        className="h-3 w-3 rounded-full ring-2 ring-white/10"
                        style={{ backgroundColor: label.color }}
                      />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-200">
                      {label.name}
                    </span>
                    <HiOutlinePlus className="h-4 w-4 text-slate-600 transition-colors duration-100 motion-reduce:transition-none group-hover:text-sky-300" />
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <p className="rounded-md border border-dashed border-white/10 px-3 py-3 text-center text-xs text-slate-500">
          Create labels in board settings first.
        </p>
      )}
    </fieldset>
  );
}
