import { Route, Routes } from "react-router-dom"
import AppLayout from "./components/Layout/AppLayout"
import Login from "./components/Authentication/Login"
import Register from "./components/Authentication/Register"
import Configuration from "./components/Authentication/Configuration"
import Dashboard from "./pages/Dashboard"
import Analytics from "./pages/Analytics"
import ApplianceControl from "./pages/ApplianceControl"
import Trading from "./pages/TradingPlatform"
import Community from "./pages/Community"
import Optimization from "./pages/Optimization"
import Weather from "./pages/Weather"
import Settings from "./pages/Settings"
import ProtectedRoute from "./components/Authentication/ProtectedRoute"
import Home from "./pages/Home"

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/configuration" element={<Configuration />} />

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/appliance-control" element={<ApplianceControl />} />
        <Route path="/trading" element={<Trading />} />
        <Route path="/community" element={<Community />} />
        <Route path="/optimization" element={<Optimization />} />
        <Route path="/weather" element={<Weather />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes

