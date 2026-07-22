import { useState } from "react";
import { useFetcher } from "react-router";
import { HiOutlinePencil, HiOutlineTrash, HiOutlineX } from "react-icons/hi";
import type { LabelDto } from "@repo/shared";
import { Button } from "~/components/ui/Button";
import { FormInput } from "~/components/ui/FormField";

const DEFAULT_COLOR = "#38bdf8";
const PRESET_COLORS = [
  { name: "Red", value: "#ef4444" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#22c55e" },
  { name: "Yellow", value: "#eab308" },
  { name: "Purple", value: "#a855f7" },
  { name: "Pink", value: "#ec4899" },
] as const;

function ColorPresets({ value, onChange }: { value: string; onChange: (color: string) => void }) {
  return (
    <div className="flex items-center gap-2" aria-label="Quick color selection">
      {PRESET_COLORS.map((color) => {
        const selected = value.toLowerCase() === color.value;
        return (
          <button
            key={color.value}
            type="button"
            title={color.name}
            aria-label={`Select ${color.name}`}
            aria-pressed={selected}
            onClick={() => onChange(color.value)}
            className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${selected ? "ring-2 ring-white ring-offset-2 ring-offset-slate-900" : "ring-1 ring-white/15"}`}
            style={{ backgroundColor: color.value }}
          >
            {selected ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
          </button>
        );
      })}
    </div>
  );
}

export function LabelManagement({ labels }: { labels: LabelDto[] }) {
  const createFetcher = useFetcher<{ ok: boolean; message?: string }>();
  const editFetcher = useFetcher<{ ok: boolean; message?: string }>();
  const deleteFetcher = useFetcher<{ ok: boolean; message?: string }>();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [createColor, setCreateColor] = useState(DEFAULT_COLOR);
  const [editColor, setEditColor] = useState(DEFAULT_COLOR);

  return (
    <section className="border-t border-white/10 pt-6">
      <h3 className="text-sm font-semibold text-white">Labels</h3>
      <p className="mt-1 text-xs leading-5 text-slate-400">Create reusable labels for organizing tasks on this board.</p>

      <createFetcher.Form method="post" className="mt-4 grid grid-cols-[1fr_3rem] gap-2">
        <input type="hidden" name="intent" value="createLabel" />
        <FormInput name="name" label="New label" required maxLength={30} placeholder="e.g. Bug" />
        <FormInput name="color" label="Color" type="color" value={createColor} onChange={(event) => setCreateColor(event.target.value)} className="h-[42px] cursor-pointer px-1.5 py-1" />
        <div className="col-span-2">
          <p className="mb-2 text-xs text-slate-400">Quick colors</p>
          <ColorPresets value={createColor} onChange={setCreateColor} />
        </div>
        <Button type="submit" variant="secondary" isLoading={createFetcher.state !== "idle"} className="col-span-2">Add label</Button>
      </createFetcher.Form>
      {createFetcher.data && !createFetcher.data.ok ? <p className="mt-2 text-xs text-rose-400">{createFetcher.data.message}</p> : null}

      <ul className="mt-4 space-y-2">
        {labels.length === 0 ? <li className="rounded-md border border-dashed border-white/10 px-3 py-4 text-center text-xs text-slate-500">No labels yet</li> : null}
        {labels.map((label) => (
          <li key={label.id} className="rounded-md border border-white/10 bg-white/5 p-2.5">
            {editingId === label.id ? (
              <editFetcher.Form method="post" className="grid grid-cols-[1fr_3rem] gap-2">
                <input type="hidden" name="intent" value="updateLabel" />
                <input type="hidden" name="labelId" value={label.id} />
                <FormInput name="name" required maxLength={30} defaultValue={label.name} aria-label="Label name" />
                <FormInput name="color" type="color" value={editColor} onChange={(event) => setEditColor(event.target.value)} aria-label="Label color" className="h-[42px] cursor-pointer px-1.5 py-1" />
                <div className="col-span-2">
                  <ColorPresets value={editColor} onChange={setEditColor} />
                </div>
                <div className="col-span-2 flex gap-2">
                  <Button type="submit" variant="primary" isLoading={editFetcher.state !== "idle"} className="flex-1">Save</Button>
                  <Button type="button" variant="ghost" onClick={() => setEditingId(null)} aria-label="Cancel editing"><HiOutlineX /></Button>
                </div>
              </editFetcher.Form>
            ) : (
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: label.color }} />
                <span className="min-w-0 flex-1 truncate text-sm text-slate-200">{label.name}</span>
                <button type="button" onClick={() => { setEditingId(label.id); setEditColor(label.color); }} aria-label={`Edit ${label.name}`} className="rounded p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"><HiOutlinePencil className="h-4 w-4" /></button>
                <deleteFetcher.Form method="post">
                  <input type="hidden" name="intent" value="deleteLabel" />
                  <input type="hidden" name="labelId" value={label.id} />
                  <button type="submit" aria-label={`Delete ${label.name}`} className="rounded p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-300"><HiOutlineTrash className="h-4 w-4" /></button>
                </deleteFetcher.Form>
              </div>
            )}
          </li>
        ))}
      </ul>
      {editFetcher.data && !editFetcher.data.ok ? <p className="mt-2 text-xs text-rose-400">{editFetcher.data.message}</p> : null}
      {deleteFetcher.data && !deleteFetcher.data.ok ? <p className="mt-2 text-xs text-rose-400">{deleteFetcher.data.message}</p> : null}
    </section>
  );
}
