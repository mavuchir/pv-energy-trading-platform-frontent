import { Navigate } from "react-router-dom"
import Login from "./components/Authentication/Login"
import ForgotPassword from "./components/Authentication/ForgotPassword"
import Dashboard from "./pages/Dashboard"
import ProtectedRoute from "./components/Authentication/ProtectedRoute"
import AppLayout from "./components/Layout/AppLayout"
import EnergyProduction from "./pages/EnergyProduction"
import EnergyConsumption from "./pages/EnergyConsumption"
import BatteryStatus from "./pages/BatteryStatus"
import ProfileSettings from "./pages/ProfileSettings"
import Notifications from "./pages/Notifications"
import Settings from "./pages/Settings"
import UserManagement from "./pages/UserManagement"
import SystemSettings from "./pages/SystemSettings"
import NotFound from "./pages/NotFound"
import ApplianceControl from "./pages/ApplianceControl"
import Trading from "./pages/Trading"
import Community from "./pages/Community"
import Optimization from "./pages/Optimization"
import Weather from "./pages/Weather"
import Analytics from "./pages/Analytics"
import AdminPanel from "./pages/AdminPanel"
import DemoControls from "./pages/DemoControls"
import Home from "./pages/Home"

const routes = [
  {
    path: "/",
    element: <Home/>, // Homepage is now directly accessible
  },
  {
    path: "/auth",
    children: [
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
    ],
  },
  {
    path: "/",
    element: <ProtectedRoute />, // Now this protects the nested AppLayout routes
    children: [
      {
        path: "/",
        element: <AppLayout />,
        children: [
          {
            path: "dashboard",
            element: <Dashboard />,
          },
          {
            path: "energy-production",
            element: <EnergyProduction />,
          },
          {
            path: "energy-consumption",
            element: <EnergyConsumption />,
          },
          {
            path: "battery-status",
            element: <BatteryStatus />,
          },
          {
            path: "profile-settings",
            element: <ProfileSettings />,
          },
          {
            path: "notifications",
            element: <Notifications />,
          },
          {
            path: "settings",
            element: <Settings />,
          },
          {
            path: "user-management",
            element: <UserManagement />,
          },
          {
            path: "system-settings",
            element: <SystemSettings />,
          },
          {
            path: "appliance-control",
            element: <ApplianceControl />,
          },
          {
            path: "trading",
            element: <Trading />,
          },
          {
            path: "community",
            element: <Community />,
          },
          {
            path: "optimization",
            element: <Optimization />,
          },
          {
            path: "weather",
            element: <Weather />,
          },
          {
            path: "analytics",
            element: <Analytics />,
          },
          {
            path: "admin",
            element: <AdminPanel />,
          },
          {
            path: "demo",
            element: <DemoControls />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]

export default routes