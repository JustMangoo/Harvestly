import IconElement from "./IconElement.jsx";
import "./Button.css";

const SIZE_ICON_MAP = {
  sm: 18,
  md: 20,
  lg: 24,
};

const DEFAULT_ICON_SIZE = 20;

export default function Button({
  variant = "solid",
  size = "md",
  icon,
  iconPosition = "leading",
  iconFilled = true,
  iconSize,
  text,
  children,
  hideText = false,
  className = "",
  ...rest
}) {
  const resolvedText = typeof text === "string" ? text : children;
  const showIcon = Boolean(icon);
  const hasText = !hideText && Boolean(resolvedText);
  const iconOnly = showIcon && !hasText;

  const computedIconSize = iconSize ?? SIZE_ICON_MAP[size] ?? DEFAULT_ICON_SIZE;

  const elementClassNames = ["main-button"];
  if (iconOnly) elementClassNames.push("icon-only");
  if (className) elementClassNames.push(className);

  return (
    <button
      className={elementClassNames.join(" ")}
      data-variant={variant}
      data-size={size}
      {...rest}
    >
      {showIcon && iconPosition === "leading" && (
        <span className="icon-slot" aria-hidden="true">
          <IconElement
            icon={icon}
            size={computedIconSize}
            filled={iconFilled}
          />
        </span>
      )}
      {hasText && <span className="text-slot">{resolvedText}</span>}
      {showIcon && iconPosition === "trailing" && (
        <span className="icon-slot" aria-hidden="true">
          <IconElement
            icon={icon}
            size={computedIconSize}
            filled={iconFilled}
          />
        </span>
      )}
    </button>
  );
}
