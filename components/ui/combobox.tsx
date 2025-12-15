"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export type ComboboxOption = {
  value: string
  label: string
}

export interface ComboboxProps {
  /** Current selected value (must match an option value or be empty). */
  value: string
  /** Called when the user selects a value. */
  onChange: (value: string) => void
  /** List of options to show in the combobox. */
  options: ComboboxOption[]
  /** Label shown when no value is selected. */
  placeholder?: string
  /** Optional aria-label for accessibility. */
  "aria-label"?: string
  /** Optional className for the trigger button. */
  className?: string
  /** Optional empty state text in the list. */
  emptyMessage?: string
}

export function Combobox({
  value,
  onChange,
  options,
  placeholder = "Select an option...",
  emptyMessage = "No results found.",
  className,
  "aria-label": ariaLabel,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const selected = options.find((opt) => opt.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={ariaLabel ?? placeholder}
          role="combobox"
          aria-expanded={open}
          className={cn(
            "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
            !selected && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">
            {selected ? selected.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 size-3 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--combobox-width,16rem)] border border-border bg-popover p-0 text-popover-foreground">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt.value}
                  value={opt.label}
                  onSelect={() => {
                    const next = value === opt.value ? "" : opt.value
                    onChange(next)
                    setOpen(false)
                  }}
                  className="flex items-center gap-2 text-sm"
                >
                  <Check
                    className={cn(
                      "size-3",
                      value === opt.value
                        ? "opacity-100 text-zinc-900"
                        : "opacity-0 text-zinc-400"
                    )}
                  />
                  <span className="truncate">{opt.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}


