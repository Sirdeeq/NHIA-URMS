import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        // layout
        "h-11 w-full min-w-0 rounded-xl px-3.5 py-2 text-sm",
        // background
        "bg-[#f4f7f5]",
        // thick visible border — dark green at rest, always visible
        "border-2 border-[#1a7a52]",
        // text & placeholder
        "text-slate-800 placeholder:text-slate-400",
        // transitions
        "transition-all duration-200 outline-none",
        // hover
        "hover:border-[#0f3d2e] hover:bg-white",
        // focus
        "focus-visible:border-[#0f3d2e] focus-visible:bg-white",
        "focus-visible:ring-3 focus-visible:ring-[#1a7a52]/25",
        // shadow
        "shadow-[0_1px_3px_rgba(20,92,63,0.06)]",
        "focus-visible:shadow-[0_2px_8px_rgba(20,92,63,0.12)]",
        // file input
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-slate-700",
        // disabled
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-100",
        // invalid
        "aria-invalid:border-rose-500 aria-invalid:ring-3 aria-invalid:ring-rose-400/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
