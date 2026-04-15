"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { cn } from "@/lib/utils"
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from "lucide-react"

const Select = SelectPrimitive.Root

function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("scroll-my-1 p-1", className)}
      {...props}
    />
  )
}

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn("flex flex-1 text-left text-slate-800", className)}
      {...props}
    />
  )
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: SelectPrimitive.Trigger.Props & { size?: "sm" | "default" }) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        // layout
        "flex w-full items-center justify-between gap-2",
        "rounded-xl border bg-[#f4f7f5] px-3.5 py-2 text-sm",
        "whitespace-nowrap select-none",
        // thick visible border — dark green at rest, always visible
        "border-2 border-[#1a7a52] text-slate-800",
        // placeholder
        "data-placeholder:text-slate-400",
        // transitions
        "transition-all duration-200",
        // hover
        "hover:border-[#0f3d2e] hover:bg-white",
        // focus
        "outline-none focus-visible:border-[#0f3d2e] focus-visible:ring-3 focus-visible:ring-[#1a7a52]/25",
        // shadow
        "shadow-[0_1px_3px_rgba(20,92,63,0.06)]",
        "hover:shadow-[0_2px_8px_rgba(20,92,63,0.12)]",
        // sizes
        "data-[size=default]:h-11",
        "data-[size=sm]:h-9 data-[size=sm]:rounded-lg data-[size=sm]:text-xs",
        // disabled
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50",
        // invalid
        "aria-invalid:border-rose-400 aria-invalid:ring-3 aria-invalid:ring-rose-400/20",
        // svg
        "[&_svg]:pointer-events-none [&_svg]:shrink-0",
        "*:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        render={
          <ChevronDownIcon className="pointer-events-none size-4 text-[#25a872] shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        }
      />
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  side = "bottom",
  sideOffset = 6,
  align = "center",
  alignOffset = 0,
  alignItemWithTrigger = true,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<SelectPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger">) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="isolate z-50"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          data-align-trigger={alignItemWithTrigger}
          className={cn(
            // base
            "relative isolate z-50 overflow-hidden",
            "max-h-(--available-height) w-(--anchor-width) min-w-40",
            "origin-(--transform-origin)",
            // appearance
            "rounded-2xl bg-white",
            "border border-[#d4e8dc]",
            "shadow-[0_8px_32px_rgba(20,92,63,0.12),0_2px_8px_rgba(20,92,63,0.08)]",
            // scroll
            "overflow-x-hidden overflow-y-auto",
            // animation
            "duration-150",
            "data-[align-trigger=true]:animate-none",
            "data-[side=bottom]:slide-in-from-top-2",
            "data-[side=top]:slide-in-from-bottom-2",
            "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
            "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List className="p-1.5">
            {children}
          </SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({ className, ...props }: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn(
        "px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#5a7a6a]",
        className
      )}
      {...props}
    />
  )
}

function SelectItem({ className, children, ...props }: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        // layout
        "relative flex w-full cursor-pointer items-center gap-2",
        "rounded-xl px-3 py-2.5 pr-9",
        "text-sm font-medium text-slate-700",
        // transitions
        "outline-none select-none transition-all duration-150",
        // hover / focus
        "hover:bg-[#e8f5ee] hover:text-[#145c3f]",
        "focus:bg-[#e8f5ee] focus:text-[#145c3f]",
        // selected state
        "data-[highlighted]:bg-[#e8f5ee] data-[highlighted]:text-[#145c3f]",
        // disabled
        "data-disabled:pointer-events-none data-disabled:opacity-40",
        // svg
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="flex flex-1 shrink-0 gap-2 whitespace-nowrap">
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none absolute right-2.5 flex size-5 items-center justify-center rounded-full bg-[#145c3f]" />
        }
      >
        <CheckIcon className="pointer-events-none size-3 text-white" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({ className, ...props }: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-1 my-1.5 h-px bg-[#e8f5ee]", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn(
        "sticky top-0 z-10 flex w-full cursor-default items-center justify-center",
        "bg-white/90 backdrop-blur-sm py-1.5 text-[#25a872]",
        "[&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <ChevronUpIcon />
    </SelectPrimitive.ScrollUpArrow>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn(
        "sticky bottom-0 z-10 flex w-full cursor-default items-center justify-center",
        "bg-white/90 backdrop-blur-sm py-1.5 text-[#25a872]",
        "[&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <ChevronDownIcon />
    </SelectPrimitive.ScrollDownArrow>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
