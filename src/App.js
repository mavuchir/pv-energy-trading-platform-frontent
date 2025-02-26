import { BrowserRouter } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { NavigationProvider } from "./contexts/NavigationContext"
import AppRoutes from "./routes"

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NavigationProvider>
          <AppRoutes />
        </NavigationProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

