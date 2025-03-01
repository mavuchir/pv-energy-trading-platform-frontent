import { Route, Routes } from "react-router-dom";
import AppLayout from "./components/Layout/AppLayout";
import Login from "./components/Authentication/Login";
import Register from "./components/Authentication/Register";
import Configuration from "./components/Authentication/Configuration";
import Dashboard from "./pages/Dashboard";
import SolarSimulation from "./pages/SolarSimulation";
import TradingPlatform from "./pages/TradingPlatform";
import ApplianceControl from "./pages/ApplianceControl";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import UserManagement from "./pages/UserManagement";
import SystemSettings from "./pages/SystemSettings";
import ProtectedRoute from "./components/Authentication/ProtectedRoute";
import Home from "./pages/Home"

const AppRoutes = () => {
  return (
    <Routes>
    
      {/* Public Routes */}
      <Route path="/" element={<Home/>} />
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
        <Route path="/solar-simulation" element={<SolarSimulation />} />
        <Route path="/trading-platform" element={<TradingPlatform />} />
        <Route path="/appliance-control" element={<ApplianceControl />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/user-management" element={<UserManagement />} />
        <Route path="/system-settings" element={<SystemSettings />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
