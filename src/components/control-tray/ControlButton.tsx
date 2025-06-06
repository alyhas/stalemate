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
  ({ icon, label, active = false, className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn("control-button action-button", className, { active })}
      aria-label={label}
      data-tooltip={label}
      {...props}
    >
      <span className="material-symbols-outlined filled">{icon}</span>
    </button>
  )
);

export default ControlButton;
