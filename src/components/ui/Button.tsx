import React from "react";
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

export default function Button({
  variant = "primary",
  icon,
  className,
  children,
  ...props
}: ButtonProps) {
  const ripple = useRipple();
  return (
    <button
      className={cn("button", `button--${variant}`, className)}
      onPointerDown={(e) => {
        ripple(e);
        props.onPointerDown?.(e);
      }}
      {...props}
    >
      {icon && <span className="material-symbols-outlined filled">{icon}</span>}
      {children}
    </button>
  );
}
