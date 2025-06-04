import React from "react";
import "./spinner.scss";

export default function Spinner({ size = 16 }: { size?: number }) {
  return <div className="spinner" style={{ width: size, height: size }} />;
}
