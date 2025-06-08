import React, { ReactNode, memo } from "react";
import cn from "classnames";
import "./panel.scss";

export type PanelProps = {
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
  hoverable?: boolean;
};

function Panel({ title, children, className, hoverable = false }: PanelProps) {
  return (
    <section className={cn("panel", { hoverable }, className)}>
      {title && <header className="panel-header">{title}</header>}
      <div className="panel-body">{children}</div>
    </section>
  );
}

export default memo(Panel);
