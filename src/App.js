import { BrowserRouter } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { NavigationProvider } from "./contexts/NavigationContext"
import AppRoutes from "./routes"
import { Toaster } from "react-hot-toast"


const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NavigationProvider>
          <AppRoutes>
            <Toaster position="top-right" />
          </AppRoutes> 
        </NavigationProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

