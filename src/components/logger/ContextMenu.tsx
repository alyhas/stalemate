import { useEffect } from "react";
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
  useEffect(() => {
    const handler = () => onClose();
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [onClose]);

  return (
    <ul className="context-menu" style={{ top: y, left: x }} role="menu">
      {items.map((item) => (
        <li key={item.label} role="none">
          <button
            role="menuitem"
            onClick={() => {
              item.onClick();
              onClose();
            }}
          >
            {item.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
