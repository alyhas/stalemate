import React, { memo, useRef } from "react";
import cn from "classnames";
import useHotkey from "../../hooks/use-hotkey";
import useFocusTrap from "../../hooks/use-focus-trap";
import Button from "../ui/Button";
import "./shortcuts-dialog.scss";

const shortcuts = [
  { keys: "Ctrl+B", desc: "Toggle side panel" },
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

function ShortcutsDialog({ open, onClose }: ShortcutsDialogProps) {
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  useHotkey("escape", onClose, [onClose]);
  useFocusTrap(dialogRef, open);

  return (
    <dialog
      ref={dialogRef}
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
      <Button variant="outlined" onClick={onClose}>Close</Button>
    </dialog>
  );
}

export default memo(ShortcutsDialog);
