import React, { useState } from "react"
import { Outlet } from "react-router-dom"
import Header from "./Header"
import Sidebar from "./Sidebar"
import { FaExclamationTriangle } from "react-icons/fa"
import { useAuth } from "../../contexts/AuthContext"

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { error } = useAuth()

  return (
    <div className="min-h-screen bg-gray-100">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <div className="flex-1 pt-16 overflow-y-auto">
          {/* Global error message */}
          {error && (
            <div className="mx-4 mt-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaExclamationTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Main content */}
          <main className="px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </main>
          
          {/* Footer */}
          <footer className="bg-white shadow-inner p-4 text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} Energy Management System. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </div>
  )
}

export default AppLayout