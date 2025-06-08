import React, { memo } from "react";
import cn from "classnames";
import "./card.scss";

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  hoverable?: boolean;
};

function Card({ className, hoverable = false, ...props }: CardProps) {
  return <div className={cn("card", { hoverable }, className)} {...props} />;
}

export default memo(Card);
