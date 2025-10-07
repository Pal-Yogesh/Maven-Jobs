"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type SelectContextType = {
  value?: string
  onChange?: (v: string) => void
}
const SelectContext = React.createContext<SelectContextType>({})

export function Select({
  value,
  onValueChange,
  children,
}: {
  value?: string
  onValueChange?: (v: string) => void
  children: React.ReactNode
}) {
  return (
    <SelectContext.Provider value={{ value, onChange: onValueChange }}>
      <div className="relative inline-flex">{children}</div>
    </SelectContext.Provider>
  )
}

export function SelectTrigger({
  className,
  children,
}: {
  className?: string
  children?: React.ReactNode
}) {
  return <div className={cn("w-40", className)}>{children}</div>
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const ctx = React.useContext(SelectContext)
  return (
    <button
      type="button"
      className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
      tabIndex={-1}
      aria-label="Open"
    >
      <span className={cn(!ctx.value && "text-muted-foreground")}>{ctx.value || placeholder || "Select"}</span>
    </button>
  )
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  const ctx = React.useContext(SelectContext)
  return (
    <select
      className="absolute right-0 top-0 h-9 w-full opacity-0"
      value={ctx.value}
      onChange={(e) => ctx.onChange?.(e.target.value)}
    >
      {children}
    </select>
  )
}

export function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  return <option value={value}>{children}</option>
}
