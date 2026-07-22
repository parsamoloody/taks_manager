import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

export function HeaderActionPortal({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setTarget(document.getElementById("header-board-actions"));
  }, []);

  return target ? createPortal(children, target) : null;
}
