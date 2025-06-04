import { useEffect } from "react";

export default function useHotkey(
  combo: string,
  callback: (e: KeyboardEvent) => void,
  deps: any[] = []
) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const keys = combo.toLowerCase().split("+");
      const mainKey = keys[keys.length - 1];
      if (
        keys.includes("ctrl") && !(e.ctrlKey || e.metaKey) ||
        (!keys.includes("ctrl") && (e.ctrlKey || e.metaKey))
      ) {
        return;
      }
      if (
        keys.includes("shift") && !e.shiftKey ||
        (!keys.includes("shift") && e.shiftKey)
      ) {
        return;
      }
      if (keys.includes("alt") && !e.altKey || (!keys.includes("alt") && e.altKey)) {
        return;
      }
      if (e.key.toLowerCase() === mainKey) {
        e.preventDefault();
        callback(e);
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, deps);
}
