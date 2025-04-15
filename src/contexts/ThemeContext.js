"use client"

import { createContext, useState, useEffect, useContext } from "react"

// Create the theme context
export const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  // Check if user has a theme preference in localStorage or use system preference
  const getInitialTheme = () => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme")
      if (savedTheme) {
        return savedTheme
      }

      // Check system preference
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark"
      }
    }

    return "light"
  }

  const [theme, setTheme] = useState(getInitialTheme)

  // Apply theme to document
  useEffect(() => {
    if (typeof window !== "undefined") {
      const root = window.document.documentElement

      // Remove previous theme class
      root.classList.remove("light", "dark")

      // Add current theme class
      root.classList.add(theme)

      // Save to localStorage
      localStorage.setItem("theme", theme)
    }
  }, [theme])

  // Toggle theme
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"))
  }

  // Set specific theme
  const setThemeMode = (mode) => {
    if (mode === "light" || mode === "dark") {
      setTheme(mode)
    }
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme: setThemeMode,
        isDarkMode: theme === "dark",
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
