import { useEffect, useState, useRef } from "react";
import useFocusTrap from "../../hooks/use-focus-trap";
import "./context-menu.scss";

export type ContextMenuItem = {
  label: string;
  onClick: () => void;
};

export default function ContextMenu({
  x,
  y,
  items,
  onClose,
}: {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}) {
  const [closing, setClosing] = useState(false);
  const menuRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleClose = () => {
    setClosing(true);
  };

  useFocusTrap(menuRef, !closing);

  useEffect(() => {
    itemRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    const handler = () => handleClose();
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let nextIndex = index;
    if (e.key === "ArrowDown") {
      nextIndex = (index + 1) % items.length;
    } else if (e.key === "ArrowUp") {
      nextIndex = (index - 1 + items.length) % items.length;
    } else if (e.key === "Home") {
      nextIndex = 0;
    } else if (e.key === "End") {
      nextIndex = items.length - 1;
    } else if (e.key === "Escape") {
      handleClose();
      e.preventDefault();
      return;
    } else {
      return;
    }
    e.preventDefault();
    itemRefs.current[nextIndex]?.focus();
  };

  return (
    <ul
      ref={menuRef}
      className={`context-menu${closing ? " closing" : ""}`}
      style={{ top: y, left: x }}
      role="menu"
      onAnimationEnd={() => closing && onClose()}
    >
      {items.map((item, i) => (
        <li key={item.label} role="none">
          <button
            ref={(el) => (itemRefs.current[i] = el)}
            role="menuitem"
            onClick={() => {
              item.onClick();
              handleClose();
            }}
            onKeyDown={(e) => handleKeyDown(e, i)}
          >
            {item.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
