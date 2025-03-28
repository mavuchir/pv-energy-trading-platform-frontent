"use client"
import { useAuth } from "../contexts/AuthContext"
import { Navigate } from "react-router-dom"
import TradingPlatform from "../components/TradingPlatform/TradingPlatform"

const TradingPlatformPage = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  return (
    <div className="container mx-auto py-6">
      <TradingPlatform />
    </div>
  )
}

export default TradingPlatformPage

