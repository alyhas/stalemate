import cn from "classnames";
import { forwardRef } from "react";
import useRipple from "../../hooks/use-ripple";

export type ControlButtonProps =
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    icon: string;
    label: string;
    active?: boolean;
    className?: string;
  };

const ControlButton = forwardRef<HTMLButtonElement, ControlButtonProps>(
  ({ icon, label, active = false, className, onPointerDown, ...props }, ref) => {
    const ripple = useRipple();
    const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
      ripple(e);
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
