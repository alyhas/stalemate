import React from "react";
import cn from "classnames";
import "./card.scss";

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

export default function Card({ className, ...props }: CardProps) {
  return <div className={cn("card", className)} {...props} />;
}
