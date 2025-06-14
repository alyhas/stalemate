import React, { ReactNode } from "react";
import cn from "classnames";
import "./panel.scss";

export type PanelProps = {
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export default function Panel({ title, children, className }: PanelProps) {
  return (
    <section className={cn("panel", className)}>
      {title && <header className="panel-header">{title}</header>}
      <div className="panel-body">{children}</div>
    </section>
  );
}
