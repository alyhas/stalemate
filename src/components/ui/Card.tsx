import React from "react";
import cn from "classnames";
import "./card.scss";

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "success" | "warning";
};

export default function Card({ variant = "default", className, ...props }: CardProps) {
  return (
    <div
      className={cn("card", variant !== "default" && `card--${variant}`, className)}
      {...props}
    />
  );
}
