"use client"

import React, { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { FaTimes } from "react-icons/fa"

export const Dialog = ({ open, onOpenChange, children }) => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    // Prevent scrolling when dialog is open
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [open])

  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false)
      }
    }

    document.addEventListener("keydown", handleEscapeKey)
    return () => document.removeEventListener("keydown", handleEscapeKey)
  }, [open, onOpenChange])

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onOpenChange(false)
    }
  }

  if (!isMounted || !open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-lg" onClick={(e) => e.stopPropagation()}>
        <button
          className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
          onClick={() => onOpenChange(false)}
        >
          <FaTimes />
          <span className="sr-only">Close</span>
        </button>
        {children}
      </div>
    </div>,
    document.body,
  )
}

export const DialogTrigger = ({ children, onClick }) => {
  return React.cloneElement(children, {
    onClick: (e) => {
      children.props.onClick?.(e)
      onClick?.(e)
    },
  })
}

export const DialogContent = ({ children, className, ...props }) => {
  return (
    <div className={`p-6 ${className || ""}`} {...props}>
      {children}
    </div>
  )
}

export const DialogHeader = ({ children, className, ...props }) => {
  return (
    <div className={`mb-4 ${className || ""}`} {...props}>
      {children}
    </div>
  )
}

export const DialogFooter = ({ children, className, ...props }) => {
  return (
    <div className={`mt-6 flex justify-end space-x-2 ${className || ""}`} {...props}>
      {children}
    </div>
  )
}

export const DialogTitle = ({ children, className, ...props }) => {
  return (
    <h3 className={`text-lg font-bold ${className || ""}`} {...props}>
      {children}
    </h3>
  )
}

export const DialogDescription = ({ children, className, ...props }) => {
  return (
    <p className={`text-sm text-gray-500 mt-1 ${className || ""}`} {...props}>
      {children}
    </p>
  )
}

