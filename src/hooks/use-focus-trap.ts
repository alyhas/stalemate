import { useEffect } from "react";

const focusableSelector =
  "button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex='-1'])";

export default function useFocusTrap(
  ref: React.RefObject<HTMLElement>,
  active: boolean,
) {
  useEffect(() => {
    const el = ref.current;
    if (!active || !el) return;

    const getFocusable = () =>
      Array.from(el.querySelectorAll<HTMLElement>(focusableSelector));

    const first = getFocusable()[0];
    first?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const nodes = getFocusable();
      if (!nodes.length) return;
      const firstNode = nodes[0];
      const lastNode = nodes[nodes.length - 1];
      if (!e.shiftKey && document.activeElement === lastNode) {
        e.preventDefault();
        firstNode.focus();
      } else if (e.shiftKey && document.activeElement === firstNode) {
        e.preventDefault();
        lastNode.focus();
      }
    };

    const keepFocus = (e: FocusEvent) => {
      if (el.contains(e.target as Node)) return;
      const nodes = getFocusable();
      nodes[0]?.focus();
    };

    document.addEventListener("focusin", keepFocus);
    el.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("focusin", keepFocus);
      el.removeEventListener("keydown", handleKeyDown);
    };
  }, [active, ref]);
}
