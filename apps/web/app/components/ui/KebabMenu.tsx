// app/components/ui/KebabMenu.tsx
import { useEffect, useRef, useState, type ReactNode } from "react";
import { HiDotsVertical } from "react-icons/hi";

export interface KebabMenuItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: "default" | "danger";
}

interface KebabMenuProps {
  items: KebabMenuItem[];
  label?: string;
  trigger?: ReactNode;
}

export function KebabMenu({ items, label = "Open menu", trigger }: KebabMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={`cursor-pointer rounded-full text-slate-400 transition hover:bg-white/10 ${trigger ? "p-0" : "p-1"}`}
        data-open={open}
      >
        {trigger ?? <HiDotsVertical size={16} />}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-xl border border-white/10 bg-slate-900 py-1 shadow-xl"
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
              className={`cursor-pointer flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition ${
                item.variant === "danger"
                  ? "text-rose-400 hover:bg-rose-500/10"
                  : "text-slate-200 hover:bg-white/5"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
