import { useState } from "react";
import type { LabelDto } from "@repo/shared";
import type { Board } from "~/lib/api/board";
import { Modal } from "~/components/ui/Modal";
import { BoardDetailsSettings } from "./BoardDetailsSettings";
import { BoardMembersSettings } from "./BoardMembersSettings";
import { LabelManagement } from "./LabelManagement";

type SettingsTab = "edit" | "labels";

interface BoardSettingsPanelProps {
  open: boolean;
  board: Board;
  labels: LabelDto[];
  members: Board["members"];
  currentUserId: string;
  onClose: () => void;
}

export function BoardSettingsPanel({ open, board, labels, members, currentUserId, onClose }: BoardSettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("edit");

  return (
    <Modal open={open} onClose={onClose} title="Board settings" size="xl">
      <div className="flex border-b border-white/10" role="tablist" aria-label="Board settings sections">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "edit"}
          onClick={() => setActiveTab("edit")}
          className={`-mb-px flex-1 cursor-pointer border-b-2 px-4 pb-3 pt-1 text-sm font-medium outline-none transition focus-visible:bg-white/5 ${activeTab === "edit" ? "border-sky-400 text-sky-300" : "border-transparent text-slate-400 hover:border-white/20 hover:text-slate-200"}`}
        >
          Edit board
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "labels"}
          onClick={() => setActiveTab("labels")}
          className={`-mb-px flex-1 cursor-pointer border-b-2 px-4 pb-3 pt-1 text-sm font-medium outline-none transition focus-visible:bg-white/5 ${activeTab === "labels" ? "border-sky-400 text-sky-300" : "border-transparent text-slate-400 hover:border-white/20 hover:text-slate-200"}`}
        >
          Labels <span className={`ml-1 rounded-full px-1.5 py-0.5 text-xs ${activeTab === "labels" ? "bg-sky-400/15 text-sky-200" : "bg-white/5 text-slate-500"}`}>{labels.length}</span>
        </button>
      </div>

      <div className="mt-6">
        {activeTab === "edit" ? (
          <div className="grid gap-8 lg:grid-cols-2 lg:[&>section]:border-t-0 lg:[&>section]:pt-0">
            <BoardDetailsSettings board={board} />
            <BoardMembersSettings members={members} currentUserId={currentUserId} visibility={board.visibility} />
          </div>
        ) : (
          <div className="mx-auto max-w-2xl [&>section]:border-t-0 [&>section]:pt-0">
            <LabelManagement labels={labels} />
          </div>
        )}
      </div>
    </Modal>
  );
}
