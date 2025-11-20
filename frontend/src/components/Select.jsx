import React, { useEffect, useId, useMemo, useRef, useState } from "react";

export default function Select({
  name,
  value,
  onChange,
  options = [],
  placeholder = "Выберите вариант",
  disabled = false,
  className = "",
  size = "md",
  ...rest
}) {
  const listId = useId();
  const containerRef = useRef(null);
  const [open, setOpen] = useState(false);

  const normalizedValue = value == null ? "" : String(value);

  const selected = useMemo(
    () => options.find((opt) => String(opt.value) === normalizedValue),
    [options, normalizedValue],
  );

  useEffect(() => {
    function handleClickOutside(e) {
      if (!containerRef.current?.contains(e.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function toggle() {
    if (!disabled) setOpen((prev) => !prev);
  }

  function choose(option) {
    if (disabled) return;
    const nextValue = option.value;
    onChange?.(nextValue, { name, option });
    setOpen(false);
  }

  return (
    <div
      ref={containerRef}
      className={`ui-select ${open ? "open" : ""} ${disabled ? "disabled" : ""} ${className}`.trim()}
    >
      <button
        type="button"
        className="ui-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={toggle}
        disabled={disabled}
        data-size={size}
        {...rest}
      >
        <div className="ui-select-value">
          <span className={selected ? "" : "placeholder"}>{selected?.label || placeholder}</span>
          {selected?.hint && <small>{selected.hint}</small>}
        </div>
        <span className="ui-select-chevron" aria-hidden>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      <div className="ui-select-dropdown" role="listbox" id={listId}>
        {options.map((opt) => {
          const isSelected = String(opt.value) === normalizedValue;
          return (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={isSelected}
              className={`ui-select-option ${isSelected ? "selected" : ""}`.trim()}
              onClick={() => choose(opt)}
            >
              <div className="option-text">
                <div className="option-title">{opt.label}</div>
                {opt.hint && <div className="option-hint">{opt.hint}</div>}
              </div>
              {isSelected && <span className="option-check" aria-hidden>•</span>}
            </button>
          );
        })}
        {options.length === 0 && <div className="ui-select-empty">Нет вариантов</div>}
      </div>
    </div>
  );
}
