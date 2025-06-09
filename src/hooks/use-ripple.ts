import { useCallback } from "react";
import usePrefersReducedMotion from "./use-prefers-reduced-motion";

export default function useRipple() {
  const reduceMotion = usePrefersReducedMotion();
  return useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (reduceMotion) return;
      const btn = e.currentTarget as HTMLElement;
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const ripple = document.createElement("span");
      ripple.className = "ripple";
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    ripple.style.width = ripple.style.height = `${size}px`;
    btn.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove());
    },
    [reduceMotion]
  );
}
