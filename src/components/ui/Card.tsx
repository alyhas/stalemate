import React, { memo } from "react";
import cn from "classnames";
import "./card.scss";

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  hoverable?: boolean;
  animated?: boolean;
};

function Card({
  className,
  hoverable = false,
  animated = false,
  ...props
}: CardProps) {
  return (
    <div className={cn("card", { hoverable, animated }, className)} {...props} />
  );
}

export default memo(Card);
