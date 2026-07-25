import {
  useEffect,
  useRef,
  type Dispatch,
  type KeyboardEvent,
  type SetStateAction,
} from "react";

interface ListboxControlsOptions {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export function useListboxControls({ open, setOpen }: ListboxControlsOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    const focusFrame = window.requestAnimationFrame(() => {
      const selectedOption =
        listboxRef.current?.querySelector<HTMLButtonElement>(
          '[role="option"][aria-selected="true"]',
        );
      const firstOption =
        listboxRef.current?.querySelector<HTMLButtonElement>('[role="option"]');
      (selectedOption ?? firstOption)?.focus();
    });

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.cancelAnimationFrame(focusFrame);
    };
  }, [open, setOpen]);

  function closeAndRestoreFocus() {
    setOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      event.preventDefault();
      setOpen(true);
      return;
    }

    if (event.key === "Escape" && open) {
      event.preventDefault();
      event.stopPropagation();
      closeAndRestoreFocus();
      return;
    }

    if (!open) return;

    const options = Array.from(
      listboxRef.current?.querySelectorAll<HTMLButtonElement>(
        '[role="option"]',
      ) ?? [],
    );
    const currentIndex = options.indexOf(
      document.activeElement as HTMLButtonElement,
    );
    let nextIndex: number | null = null;

    if (event.key === "ArrowDown") {
      nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
    } else if (event.key === "ArrowUp") {
      nextIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = options.length - 1;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      options[nextIndex]?.focus();
    }
  }

  return {
    closeAndRestoreFocus,
    containerRef,
    handleKeyDown,
    listboxRef,
    triggerRef,
  };
}
