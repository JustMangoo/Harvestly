import { useMemo } from "react";
import "./ToggleGroup.css";

export default function ToggleGroup({
  options = [],
  value,
  onChange,
  className = "",
  defaultValue,
}) {
  const resolvedOptions = useMemo(() => {
    if (options.length > 0) return options;
    return [
      { label: "Fences", value: "fences" },
      { label: "Small items", value: "small" },
      { label: "Big items", value: "big" },
    ];
  }, [options]);

  return (
    <div className={`toggle-group ${className}`.trim()}>
      {resolvedOptions.map((option) => {
        const isActive =
          value !== undefined
            ? value === option.value
            : defaultValue
            ? defaultValue === option.value
            : option === resolvedOptions[0];
        return (
          <button
            key={option.value ?? option.label}
            type="button"
            className={isActive ? "active" : ""}
            onClick={() => onChange?.(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
