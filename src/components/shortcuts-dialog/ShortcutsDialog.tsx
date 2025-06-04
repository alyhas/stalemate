import cn from "classnames";
import { useEffect, useState } from "react";
import useHotkey from "../../hooks/use-hotkey";
import Button from "../ui/Button";
import "./shortcuts-dialog.scss";

const shortcuts = [
  { keys: "Ctrl+B", desc: "Toggle side panel" },
  { keys: "Ctrl+1", desc: "Show all logs" },
  { keys: "Ctrl+2", desc: "Show conversations" },
  { keys: "Ctrl+3", desc: "Show tool logs" },
  { keys: "Ctrl+K", desc: "Focus log search" },
  { keys: "Ctrl+E", desc: "Focus message input" },
  { keys: "Ctrl+Enter", desc: "Send message" },
  { keys: "Ctrl+Shift+L", desc: "Toggle theme" },
  { keys: "Ctrl+Shift+M", desc: "Toggle mute" },
  { keys: "Ctrl+Shift+W", desc: "Toggle webcam" },
  { keys: "Ctrl+Shift+S", desc: "Toggle screen share" },
  { keys: "Ctrl+Shift+P", desc: "Toggle picture-in-picture" },
  { keys: "Ctrl+Shift+C", desc: "Connect/disconnect" },
  { keys: "Ctrl+/", desc: "Show this help" },
];

type ShortcutsDialogProps = {
  open: boolean;
  onClose: () => void;
};

export default function ShortcutsDialog({ open, onClose }: ShortcutsDialogProps) {
  const [closing, setClosing] = useState(false);
  useHotkey("escape", () => setClosing(true), []);

  const handleClose = () => setClosing(true);

  useEffect(() => {
    if (open) setClosing(false);
  }, [open]);

  if (!open && !closing) return null;

  return (
    <dialog
      className={cn("shortcuts-dialog", { open, closing })}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
      onAnimationEnd={() => {
        if (closing) {
          setClosing(false);
          onClose();
        }
      }}
    >
      <h3 id="shortcuts-title">Keyboard Shortcuts</h3>
      <ul>
        {shortcuts.map((s) => (
          <li key={s.keys}>
            <span className="keys">{s.keys}</span>
            <span className="desc">{s.desc}</span>
          </li>
        ))}
      </ul>
      <Button onClick={handleClose}>Close</Button>
    </dialog>
  );
}
