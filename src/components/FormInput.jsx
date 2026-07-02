// src/components/FormInput.jsx
import React from "react";

export const FormInput = ({
  label,
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  className = "",
}) => (
  <div style={{ marginBottom: "16px" }} className={className}>
    {label && (
      <label
        htmlFor={id}
        style={{
          display: "block",
          fontFamily: "var(--font-sans)",
          fontSize: "12px",
          fontWeight: 600,
          letterSpacing: "-0.48px",
          color: "var(--color-ink-black)",
          marginBottom: "6px",
        }}
      >
        {label}
      </label>
    )}
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className="memoir-input"
      style={{
        /* Overrides applied via memoir-input class in theme.css */
      }}
    />
  </div>
);
