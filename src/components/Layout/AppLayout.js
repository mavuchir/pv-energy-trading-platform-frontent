"use client"

import { useEffect, useRef } from "react"
import { Outlet } from "react-router-dom"
import { useNavigation } from "../../contexts/NavigationContext"
import TopNavigation from "./TopNavigation"
import Sidebar from "./Sidebar"

const AppLayout = () => {
  const { setIsScrollingDown, isSidebarOpen } = useNavigation()
  const lastScrollYRef = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setIsScrollingDown(currentScrollY > lastScrollYRef.current)
      lastScrollYRef.current = currentScrollY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [setIsScrollingDown])

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? "md:ml-64" : "md:ml-20"}`}>
        <TopNavigation />
        <main className="flex-1 overflow-auto p-6 pt-20">
          <div className="container mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AppLayout
