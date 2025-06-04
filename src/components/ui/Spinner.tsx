import React from "react";
import "./spinner.scss";

export default function Spinner({
  size = 16,
  label = "Loading",
}: {
  size?: number;
  label?: string;
}) {
  return (
    <div
      className="spinner"
      style={{ width: size, height: size }}
      role="status"
      aria-label={label}
    />
  );
}
