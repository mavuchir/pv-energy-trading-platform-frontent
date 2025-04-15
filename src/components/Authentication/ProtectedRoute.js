"use client"

import React from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  // Allow access to '/' (home page) for all users
  if (!isAuthenticated && location.pathname !== '/') {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  return <Outlet />
}

export default ProtectedRoute