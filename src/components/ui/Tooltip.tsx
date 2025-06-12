import React, { ReactElement, ReactNode, useId } from "react";
import "./tooltip.scss";

type TooltipProps = {
  text: string;
  children: ReactElement;
};

export default function Tooltip({ text, children }: TooltipProps) {
  const id = useId();
  return (
    <span className="tooltip-wrapper" data-tooltip>
      {React.cloneElement(children, { "aria-describedby": id })}
      <span role="tooltip" id={id} className="tooltip">
        {text}
      </span>
    </span>
  );
}
