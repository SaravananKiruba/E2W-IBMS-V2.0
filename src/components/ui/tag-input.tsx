"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface Tag {
  id: string
  label: string
  color?: string
}

interface TagInputProps {
  tags: Tag[]
  onTagsChange?: (tags: Tag[]) => void
  placeholder?: string
  maxTags?: number
  allowCustomTags?: boolean
  suggestions?: string[]
  className?: string
  disabled?: boolean
}

export function TagInput({
  tags,
  onTagsChange,
  placeholder = "Add tags...",
  maxTags,
  allowCustomTags = true,
  suggestions = [],
  className,
  disabled = false
}: TagInputProps) {
  const [inputValue, setInputValue] = React.useState("")
  const [showSuggestions, setShowSuggestions] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const filteredSuggestions = suggestions.filter(
    suggestion => 
      suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
      !tags.some(tag => tag.label.toLowerCase() === suggestion.toLowerCase())
  )

  const addTag = (label: string) => {
    if (!label.trim()) return
    if (maxTags && tags.length >= maxTags) return
    if (tags.some(tag => tag.label.toLowerCase() === label.toLowerCase())) return

    const newTag: Tag = {
      id: Date.now().toString(),
      label: label.trim()
    }

    onTagsChange?.([...tags, newTag])
    setInputValue("")
    setShowSuggestions(false)
  }

  const removeTag = (tagId: string) => {
    onTagsChange?.(tags.filter(tag => tag.id !== tagId))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      if (allowCustomTags && inputValue.trim()) {
        addTag(inputValue)
      }
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1].id)
    } else if (e.key === "Escape") {
      setShowSuggestions(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    setShowSuggestions(e.target.value.length > 0 && suggestions.length > 0)
  }

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "flex min-h-10 w-full flex-wrap items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          disabled && "cursor-not-allowed opacity-50"
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag) => (
          <Badge key={tag.id} variant="secondary" className="gap-1">
            {tag.label}
            {!disabled && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation()
                  removeTag(tag.id)
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </Badge>
        ))}
        
        <input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(inputValue.length > 0 && suggestions.length > 0)}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          disabled={disabled || (maxTags ? tags.length >= maxTags : false)}
        />
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-popover p-1 shadow-md">
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={index}
              className="cursor-pointer rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
              onClick={() => addTag(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
