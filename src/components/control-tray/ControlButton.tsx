import cn from "classnames";
import { forwardRef } from "react";

export type ControlButtonProps =
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    icon: string;
    label: string;
    active?: boolean;
    className?: string;
  };

const ControlButton = forwardRef<HTMLButtonElement, ControlButtonProps>(
  ({ icon, label, active = false, className, onPointerDown, ...props }, ref) => {
    const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
      const btn = e.currentTarget;
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const ripple = document.createElement("span");
      ripple.className = "ripple";
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      ripple.style.width = ripple.style.height = `${size}px`;
      btn.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove());
      onPointerDown?.(e);
    };

    return (
      <button
        ref={ref}
        className={cn("control-button action-button", className, { active })}
        aria-label={label}
        data-tooltip={label}
        onPointerDown={handlePointerDown}
        {...props}
      >
        <span className="material-symbols-outlined filled">{icon}</span>
      </button>
    );
  }
);

export default ControlButton;
