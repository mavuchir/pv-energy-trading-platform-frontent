"use client"

import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { useNavigation } from "../../contexts/NavigationContext"
import { BarChart2, Sun, Settings, Users, Sliders, LogOut, LayoutDashboard, LineChart } from "lucide-react"
import { Button } from "../ui/button"
import { ScrollArea } from "../ui/scroll-area"

const NAV_ITEMS = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    roles: ["household", "admin"],
    description: "Overview of your energy system",
  },
  {
    name: "Solar Simulation",
    path: "/solar-simulation",
    icon: Sun,
    roles: ["household"],
    description: "Monitor solar panel performance",
  },
  {
    name: "Trading Platform",
    path: "/trading-platform",
    icon: LineChart,
    roles: ["household"],
    description: "Buy and sell energy",
  },
  {
    name: "Appliance Control",
    path: "/appliance-control",
    icon: Sliders,
    roles: ["household"],
    description: "Manage your appliances",
  },
  {
    name: "Community",
    path: "/community",
    icon: Users,
    roles: ["household"],
    description: "Connect with energy community",
  },
  {
    name: "Analytics",
    path: "/analytics",
    icon: BarChart2,
    roles: ["household", "admin"],
    description: "Detailed energy analytics",
  },
  {
    name: "Settings",
    path: "/settings",
    icon: Settings,
    roles: ["household", "admin"],
    description: "System preferences",
  },
  {
    name: "User Management",
    path: "/user-management",
    icon: Users,
    roles: ["admin"],
    description: "Manage system users",
  },
  {
    name: "Demo Controls",
    path: "/demo-control",
    icon: Sliders,
    roles: ["admin"],
    description: "System simulation controls",
  },
]

const Sidebar = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const { isSidebarOpen, toggleSidebar } = useNavigation()

  const filteredNavItems = NAV_ITEMS.filter((item) => item.roles.includes(user?.role || "household"))

  if (!user) return null

  return (
    <aside
      className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 bg-white border-r transform transition-transform duration-300
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <h1 className="text-xl font-semibold text-teal-600">Energy Management</h1>
          <p className="text-sm text-gray-500">Welcome, {user.name || user.username}</p>
        </div>

        <ScrollArea className="flex-1 py-2">
          <nav className="px-2 space-y-1">
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg
                  transition-colors duration-200
                  ${location.pathname === item.path ? "bg-teal-50 text-teal-700" : "text-gray-700 hover:bg-gray-100"}
                `}
              >
                <item.icon className="h-5 w-5" />
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
              </Link>
            ))}
          </nav>
        </ScrollArea>

        <div className="p-4 border-t">
          <Button variant="destructive" className="w-full" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar

