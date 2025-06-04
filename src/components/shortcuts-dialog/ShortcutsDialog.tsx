import cn from "classnames";
import useHotkey from "../../hooks/use-hotkey";
import Button from "../ui/Button";
import "./shortcuts-dialog.scss";

const shortcuts = [
  { keys: "Ctrl+B", desc: "Toggle side panel" },
  { keys: "Ctrl+K", desc: "Focus log search" },
  { keys: "Ctrl+E", desc: "Focus message input" },
  { keys: "Ctrl+Enter", desc: "Send message" },
  { keys: "Ctrl+/", desc: "Show this help" },
];

type ShortcutsDialogProps = {
  open: boolean;
  onClose: () => void;
};

export default function ShortcutsDialog({ open, onClose }: ShortcutsDialogProps) {
  useHotkey("escape", onClose, [onClose]);

  return (
    <dialog
      className={cn("shortcuts-dialog", { open })}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
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
      <Button onClick={onClose}>Close</Button>
    </dialog>
  );
}
