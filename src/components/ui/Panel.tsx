import React, { ReactNode, memo } from "react";
import cn from "classnames";
import "./panel.scss";

export type PanelProps = {
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
  hoverable?: boolean;
  animated?: boolean;
};

function Panel({
  title,
  children,
  className,
  hoverable = false,
  animated = false,
}: PanelProps) {
  return (
    <section className={cn("panel", { hoverable, animated }, className)}>
      {title && <header className="panel-header">{title}</header>}
      <div className="panel-body">{children}</div>
    </section>
  );
}

export default memo(Panel);
