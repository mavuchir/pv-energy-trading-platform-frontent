import { Route, Routes } from "react-router-dom"
import AppLayout from "./components/Layout/AppLayout"
import Login from "./components/Authentication/Login"
import Register from "./components/Authentication/Register"
import Dashboard from "./pages/Dashboard"
import Analytics from "./pages/Analytics"
import ApplianceControl from "./pages/ApplianceControl"
import Trading from "./pages/Trading"
import Community from "./pages/CommunityDetails"
import CommunityDetails from "./pages/CommunityDetails"
import Optimization from "./pages/Optimization"
import Weather from "./pages/Weather"
import Settings from "./pages/Settings"
import ProtectedRoute from "./components/Authentication/ProtectedRoute"
import Home from "./pages/Home"
import AdminPanel from "./pages/AdminPanel"
import Profile from "./pages/Profile"
import BatteryManagement from "./pages/BatteryManagement"
import HouseholdManagement from "./pages/HouseholdManagement"
import NotFound from "./pages/NotFound"
import Unauthorized from "./pages/Unauthorized"

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/appliance-control" element={<ApplianceControl />} />
          <Route path="/trading" element={<Trading />} />
          <Route path="/community" element={<Community />} />
          <Route path="/community/:id" element={<CommunityDetails />} />
          <Route path="/optimization" element={<Optimization />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/battery" element={<BatteryManagement />} />
          <Route path="/households" element={<HouseholdManagement />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/:section"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminPanel />
              </ProtectedRoute>
            }
          />
        </Route>
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRoutes
