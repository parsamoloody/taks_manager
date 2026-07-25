import { useRef, useState, type KeyboardEvent } from "react";
import type { LabelDto } from "@repo/shared";
import type { Board } from "~/server/api/board";
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

export function BoardSettingsPanel({
  open,
  board,
  labels,
  members,
  currentUserId,
  onClose,
}: BoardSettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("edit");
  const editTabRef = useRef<HTMLButtonElement>(null);
  const labelsTabRef = useRef<HTMLButtonElement>(null);

  function selectTab(tab: SettingsTab) {
    setActiveTab(tab);
    window.requestAnimationFrame(() => {
      (tab === "edit" ? editTabRef : labelsTabRef).current?.focus();
    });
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowLeft" || event.key === "Home") {
      event.preventDefault();
      selectTab("edit");
    } else if (event.key === "ArrowRight" || event.key === "End") {
      event.preventDefault();
      selectTab("labels");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Board settings" size="xl">
      <div
        className="flex rounded-xl bg-slate-950/55 p-1"
        role="tablist"
        aria-label="Board settings sections"
      >
        <button
          ref={editTabRef}
          id="board-settings-edit-tab"
          type="button"
          role="tab"
          aria-selected={activeTab === "edit"}
          aria-controls="board-settings-edit-panel"
          tabIndex={activeTab === "edit" ? 0 : -1}
          onClick={() => setActiveTab("edit")}
          onKeyDown={handleTabKeyDown}
          className={`min-h-10 flex-1 cursor-pointer rounded-lg px-4 text-sm font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-sky-300 ${
            activeTab === "edit"
              ? "bg-white/[0.08] text-white shadow-sm"
              : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
          }`}
        >
          Edit board
        </button>
        <button
          ref={labelsTabRef}
          id="board-settings-labels-tab"
          type="button"
          role="tab"
          aria-selected={activeTab === "labels"}
          aria-controls="board-settings-labels-panel"
          tabIndex={activeTab === "labels" ? 0 : -1}
          onClick={() => setActiveTab("labels")}
          onKeyDown={handleTabKeyDown}
          className={`min-h-10 flex-1 cursor-pointer rounded-lg px-4 text-sm font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-sky-300 ${
            activeTab === "labels"
              ? "bg-white/[0.08] text-white shadow-sm"
              : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
          }`}
        >
          Labels{" "}
          <span
            className={`ml-1 rounded-full px-1.5 py-0.5 text-xs ${activeTab === "labels" ? "bg-sky-400/15 text-sky-200" : "bg-white/5 text-slate-500"}`}
          >
            {labels.length}
          </span>
        </button>
      </div>

      <div
        id={`board-settings-${activeTab}-panel`}
        role="tabpanel"
        aria-labelledby={`board-settings-${activeTab}-tab`}
        className="mt-6"
      >
        {activeTab === "edit" ? (
          <div className="grid gap-8 lg:grid-cols-2 lg:[&>section]:border-t-0 lg:[&>section]:pt-0">
            <BoardDetailsSettings board={board} />
            <BoardMembersSettings
              members={members}
              currentUserId={currentUserId}
              visibility={board.visibility}
            />
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
