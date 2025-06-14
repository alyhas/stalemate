import React from "react";
import cn from "classnames";
import "./button.scss";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "icon";
  icon?: string;
};

export default function Button({
  variant = "primary",
  icon,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn("button", `button--${variant}`, className)}
      {...props}
    >
      {icon && (
        <span className="material-symbols-outlined filled">{icon}</span>
      )}
      {children}
    </button>
  );
}
