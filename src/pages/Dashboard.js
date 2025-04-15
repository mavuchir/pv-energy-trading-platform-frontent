"use client"
import { useAuth } from "../contexts/AuthContext"
import AdminDashboard from "../components/Dashboard/AdminDashboard"
import HouseholdDashboard from "../components/Dashboard/HouseholdDashboard"

const Dashboard = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      {user?.role === "admin" ? <AdminDashboard /> : <HouseholdDashboard />}
    </div>
  )
}

export default Dashboard
