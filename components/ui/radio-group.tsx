"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export function RadioGroup({
  className,
  value,
  onValueChange,
  children,
}: {
  className?: string
  value?: string
  onValueChange?: (v: string) => void
  children: React.ReactNode
}) {
  return (
    <div role="radiogroup" className={cn("grid gap-2", className)}>
      {React.Children.map(children, (child) => {
        return child
      })}
    </div>
  )
}

export function RadioGroupItem({
  id,
  value,
  checked,
  onChange,
}: {
  id: string
  value: string
  checked?: boolean
  onChange?: (v: string) => void
}) {
  const [isChecked, setChecked] = React.useState(checked ?? false)
  React.useEffect(() => {
    setChecked(checked ?? false)
  }, [checked])
  return (
    <input
      id={id}
      type="radio"
      className="h-4 w-4 border border-input rounded-full text-primary focus:ring-2 focus:ring-ring"
      value={value}
      checked={isChecked}
      onChange={(e) => {
        setChecked(e.target.checked)
        onChange?.(value)
      }}
      onClick={(e) => {
        const v = (e.target as HTMLInputElement).value
        // bubble via DOM event to be picked up by parent if needed
        const custom = new CustomEvent("radio-change", { detail: v })
        e.currentTarget.dispatchEvent(custom)
      }}
    />
  )
}
