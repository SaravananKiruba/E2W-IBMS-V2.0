"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void
  debounceMs?: number
  icon?: React.ReactNode
  clearable?: boolean
}

export function SearchInput({
  className,
  onSearch,
  debounceMs = 300,
  icon,
  clearable = true,
  ...props
}: SearchInputProps) {
  const [value, setValue] = React.useState(props.value || "")
  const timeoutRef = React.useRef<NodeJS.Timeout>()

  React.useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      onSearch?.(value as string)
    }, debounceMs)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value, onSearch, debounceMs])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
    props.onChange?.(e)
  }

  const handleClear = () => {
    setValue("")
    onSearch?.("")
  }

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2">
        {icon || <Search className="h-4 w-4 text-muted-foreground" />}
      </div>
      <Input
        {...props}
        value={value}
        onChange={handleChange}
        className={cn("pl-9", clearable && value && "pr-9", className)}
      />
      {clearable && value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          ✕
        </button>
      )}
    </div>
  )
}
