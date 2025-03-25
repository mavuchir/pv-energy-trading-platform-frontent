"use client"

import { createContext, useContext } from "react"
import { useToast } from "../hooks/use-toast"
import { Toaster } from "./ui/toast"

const ToastContext = createContext({
  toast: () => {},
  toasts: [],
  dismissToast: () => {},
})

export const useToastContext = () => useContext(ToastContext)

export const ToastProvider = ({ children }) => {
  const { toast, toasts, dismissToast } = useToast()

  return (
    <ToastContext.Provider value={{ toast, toasts, dismissToast }}>
      {children}
      <Toaster toasts={toasts} dismissToast={dismissToast} />
    </ToastContext.Provider>
  )
}

