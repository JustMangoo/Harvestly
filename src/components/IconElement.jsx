import React from "react";
import "./IconElement.css";

export default function IconElement({
  icon = "favorite",
  filled = true,
  size = 24,
  className = "",
  ...props
}) {
  const classes = ["icon-element", filled ? "filled" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      className={classes}
      style={{ fontSize: size, width: size, height: size }}
      aria-hidden="true"
      {...props}
    >
      {icon}
    </span>
  );
}
