import React, { useMemo, useCallback } from "react";
import "./Switcher.css";

/**
 * props:
 * - options: [{ value: string, label: string }]
 * - value: string
 * - onChange: (value) => void
 * - name?: string
 * - disabled?: boolean
 * - ariaLabel?: string
 */
function Switcher({ options, value, onChange, name, disabled, ariaLabel }) {
  const cols = useMemo(() => options.length || 2, [options.length]);
  const handleChange = useCallback(
    (val) => !disabled && onChange?.(val),
    [onChange, disabled]
  );

  return (
    <div
      className="fws"
      style={{ "--cols": cols }}
      role="radiogroup"
      aria-label={ariaLabel}
    >
      {options.map((opt) => {
        const checked = value === opt.value;
        return (
          <label
            key={opt.value}
            className={`fws__item ${checked ? "is-active" : ""} ${disabled ? "is-disabled" : ""}`}
          >
            <input
              type="radio"
              className="fws__input"
              name={name}
              value={opt.value}
              checked={checked}
              onChange={() => handleChange(opt.value)}
              disabled={disabled}
            />
            <span className="fws__label" aria-hidden="true">
              {opt.label}
            </span>
          </label>
        );
      })}
    </div>
  );
}

export default React.memo(Switcher);
