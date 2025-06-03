import cn from "classnames";
import { forwardRef } from "react";

export type ControlButtonProps = {
  icon: string;
  label: string;
  onClick?: () => void;
  active?: boolean;
  className?: string;
};

const ControlButton = forwardRef<HTMLButtonElement, ControlButtonProps>(
  ({ icon, label, onClick, active = false, className }, ref) => (
    <button
      ref={ref}
      className={cn("control-button action-button", className, { active })}
      onClick={onClick}
      aria-label={label}
      data-tooltip={label}
    >
      <span className="material-symbols-outlined filled">{icon}</span>
    </button>
  )
);

export default ControlButton;
