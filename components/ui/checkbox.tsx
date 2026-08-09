import * as React from "react";

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = "", checked, onCheckedChange, onChange, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        ref={ref}
        checked={checked}
        onChange={(e) => {
          onChange?.(e);
          onCheckedChange?.(e.target.checked);
        }}
        className={`h-4 w-4 rounded border-slate-300 text-[#25a872] focus:ring-[#25a872] cursor-pointer accent-[#25a872] ${className}`}
        {...props}
      />
    );
  }
);

Checkbox.displayName = "Checkbox";
