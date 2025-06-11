import React, { forwardRef, memo } from "react";
import cn from "classnames";
import useRipple from "../../hooks/use-ripple";
import "./button.scss";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?:
    | "primary"
    | "secondary"
    | "icon"
    | "outlined"
    | "danger"
    | "ghost";
  icon?: string;
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", icon, className, children, onPointerDown, ...props }, ref) => {
    const ripple = useRipple();
    return (
      <button
        ref={ref}
        className={cn("button", `button--${variant}`, className)}
        onPointerDown={(e) => {
          ripple(e);
          onPointerDown?.(e);
        }}
        {...props}
      >
        {icon && (
          <span className="material-symbols-outlined filled" aria-hidden="true">
            {icon}
          </span>
        )}
        {children}
      </button>
    );
  },
);

export default memo(Button);
