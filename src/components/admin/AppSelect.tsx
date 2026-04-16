import * as React from "react";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface Option { value: string; label: string; }

interface Props {
  value: string;
  onValueChange: (v: string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

/**
 * Thin wrapper around the app's shadcn Select that matches the admin input style.
 */
export default function AppSelect({
  value, onValueChange, options, placeholder = "— Select —", disabled, required,
}: Props) {
  return (
    <Select value={value || undefined} onValueChange={onValueChange}>
      <SelectTrigger
        className="w-full h-11 rounded-xl border border-[#d4e8dc] bg-[#f4f7f5] text-sm text-slate-800 focus:ring-2 focus:ring-[#25a872] focus:border-[#25a872] outline-none transition-all data-placeholder:text-slate-400"
        disabled={disabled}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="rounded-xl border-[#d4e8dc] z-[200]">
        {!required && (
          <SelectItem value="__none__">— None —</SelectItem>
        )}
        {options.map(o => (
          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
