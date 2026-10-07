import React from "react";

interface MatchSelectOption {
  value: string | number;
  label: string;
}

interface MatchSelectFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  options: MatchSelectOption[];
  isDisabled?: boolean;
  placeholder?: string;
  isModified?: boolean;
  modifiedClassName?: string;
  cssExtra?: string;
}

export const FieldMatchEdit: React.FC<MatchSelectFieldProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  isDisabled=false,
  isModified = false,
  modifiedClassName = "",
  cssExtra = "",
}) => {
  return (
    <form className={`${cssExtra} ${isModified ? modifiedClassName : ""}`}>
      <label className="font-medium text-muted-foreground" htmlFor={label}>{label}</label>
      <select
        aria-label={label}
        id={label}
        disabled={isDisabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-border/50 bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      >
        {placeholder && <option value="none">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </form>
  );
};