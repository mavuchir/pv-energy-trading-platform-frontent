import { createContext, useContext, useState } from "react"

const NavigationContext = createContext(undefined)

export const useNavigation = () => {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error("useNavigation must be used within NavigationProvider")
  }
  return context
}

export const NavigationProvider = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isScrollingDown, setIsScrollingDown] = useState(false)

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  return (
    <NavigationContext.Provider
      value={{
        isSidebarOpen,
        toggleSidebar,
        isScrollingDown,
        setIsScrollingDown,
      }}
    >
      {children}
    </NavigationContext.Provider>
  )
}

