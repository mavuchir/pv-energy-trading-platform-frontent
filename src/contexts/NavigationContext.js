"use client"

import { createContext, useState, useContext } from "react"

// Create the navigation context
export const NavigationContext = createContext()

export const NavigationProvider = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isScrollingDown, setIsScrollingDown] = useState(false)
  const [currentSection, setCurrentSection] = useState("dashboard")
  const [breadcrumbs, setBreadcrumbs] = useState([])

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // Update breadcrumbs
  const updateBreadcrumbs = (newBreadcrumbs) => {
    setBreadcrumbs(newBreadcrumbs)
  }

  // Set current section
  const navigateToSection = (section) => {
    setCurrentSection(section)
  }

  return (
    <NavigationContext.Provider
      value={{
        isSidebarOpen,
        setIsSidebarOpen,
        toggleSidebar,
        isScrollingDown,
        setIsScrollingDown,
        currentSection,
        navigateToSection,
        breadcrumbs,
        updateBreadcrumbs,
      }}
    >
      {children}
    </NavigationContext.Provider>
  )
}

// Custom hook to use the navigation context
export const useNavigation = () => {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider")
  }
  return context
}
