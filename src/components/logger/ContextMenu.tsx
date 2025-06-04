import { useEffect, useState } from "react";
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

  const handleClose = () => {
    setClosing(true);
  };

  useEffect(() => {
    const handler = () => handleClose();
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  return (
    <ul
      className={`context-menu${closing ? " closing" : ""}`}
      style={{ top: y, left: x }}
      role="menu"
      onAnimationEnd={() => closing && onClose()}
    >
      {items.map((item) => (
        <li key={item.label} role="none">
          <button
            role="menuitem"
            onClick={() => {
              item.onClick();
              handleClose();
            }}
          >
            {item.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
