import { Link } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { useNavigation } from "../../contexts/NavigationContext"
import { Menu, Bell, User } from "lucide-react"
import { Button } from "../ui/button"

const TopNavigation = () => {
  const { user } = useAuth()
  const { isScrollingDown, toggleSidebar } = useNavigation()

  return (
    <nav
      className={`
        fixed top-0 left-0 right-0 bg-white shadow-sm z-40
        transition-transform duration-300
        ${isScrollingDown ? "-translate-y-full" : "translate-y-0"}
      `}
    >
      <div className="h-16 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {user && (
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <Link to="/" className="text-xl font-semibold text-teal-600">
            EnergyTrade
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="default">Login</Button>
              </Link>
              <Link to="/register">
                <Button variant="outline">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default TopNavigation

