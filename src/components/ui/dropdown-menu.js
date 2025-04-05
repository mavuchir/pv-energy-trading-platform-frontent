"use client"

import React, { createContext, useContext, useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { usePopper } from "react-popper"
import { cn } from "../../lib/utils"
import { Check, Circle } from "lucide-react"

const DropdownMenuContext = createContext({})

export function DropdownMenu({ children }) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(null)

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, activeIndex, setActiveIndex }}>
      <div className="relative inline-block text-left">{children}</div>
    </DropdownMenuContext.Provider>
  )
}

export function DropdownMenuTrigger({ children, className, ...props }) {
  const { open, setOpen } = useContext(DropdownMenuContext)
  const ref = useRef(null)

  return (
    <button
      type="button"
      ref={ref}
      onClick={() => setOpen(!open)}
      aria-expanded={open}
      aria-haspopup="menu"
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-primary",
        "disabled:opacity-50 disabled:pointer-events-none",
        "bg-white text-gray-900 hover:bg-gray-100",
        "dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function DropdownMenuContent({ children, className, align = "center", sideOffset = 4, ...props }) {
  const { open, setOpen } = useContext(DropdownMenuContext)
  const triggerRef = useRef(null)
  const contentRef = useRef(null)
  const [mounted, setMounted] = useState(false)

  const { styles, attributes } = usePopper(triggerRef.current, contentRef.current, {
    placement: align === "center" ? "bottom" : `bottom-${align}`,
    modifiers: [
      { name: "offset", options: { offset: [0, sideOffset] } },
      { name: "preventOverflow", options: { padding: 8 } },
    ],
  })

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open, setOpen])

  // Handle escape key
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [open, setOpen])

  // Handle mounting
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted || !open) {
    return null
  }

  return createPortal(
    <div
      ref={contentRef}
      style={styles.popper}
      {...attributes.popper}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 shadow-md animate-in fade-in-80",
        "dark:border-gray-800 dark:bg-gray-900",
        className,
      )}
      {...props}
    >
      {children}
    </div>,
    document.body,
  )
}

export function DropdownMenuItem({ children, className, disabled, destructive, inset, onClick, ...props }) {
  return (
    <button
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
        "focus:bg-gray-100 focus:text-gray-900",
        "dark:focus:bg-gray-800 dark:focus:text-gray-50",
        inset && "pl-8",
        destructive && "text-red-600 focus:text-red-600",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

export function DropdownMenuSeparator({ className }) {
  return <div className={cn("h-px my-1 bg-gray-200 dark:bg-gray-700", className)} role="separator" />
}

export function DropdownMenuLabel({ className, inset, ...props }) {
  return (
    <div
      className={cn("px-2 py-1.5 text-sm font-semibold text-gray-900 dark:text-gray-300", inset && "pl-8", className)}
      {...props}
    />
  )
}

export function DropdownMenuCheckboxItem({ className, children, checked, onCheckedChange, ...props }) {
  return (
    <button
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors",
        "focus:bg-gray-100 focus:text-gray-900",
        "dark:focus:bg-gray-800 dark:focus:text-gray-50",
        className,
      )}
      role="menuitemcheckbox"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {checked ? <Check className="h-4 w-4" /> : null}
      </span>
      {children}
    </button>
  )
}

export function DropdownMenuRadioItem({ className, children, value, checked, onCheckedChange, ...props }) {
  return (
    <button
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors",
        "focus:bg-gray-100 focus:text-gray-900",
        "dark:focus:bg-gray-800 dark:focus:text-gray-50",
        className,
      )}
      role="menuitemradio"
      aria-checked={checked}
      onClick={() => onCheckedChange(value)}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {checked ? <Circle className="h-2 w-2 fill-current" /> : null}
      </span>
      {children}
    </button>
  )
}

export function DropdownMenuRadioGroup({ value, onValueChange, children }) {
  return React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        checked: child.props.value === value,
        onCheckedChange: onValueChange,
      })
    }
    return child
  })
}

// Alias for backward compatibility
export const DropdownMenuButton = DropdownMenuTrigger

