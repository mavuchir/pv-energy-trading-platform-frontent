import { BrowserRouter as Router } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { SimulationProvider } from "./contexts/SimulationContext"
import { NavigationProvider } from "./contexts/NavigationContext"
import { NotificationProvider } from "./contexts/NotificationContext"
import { ThemeProvider } from "./contexts/ThemeContext"
import AppRouter from "./AppRouter"

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <SimulationProvider>
            <NavigationProvider>
              <NotificationProvider>
                <AppRouter />
              </NotificationProvider>
            </NavigationProvider>
          </SimulationProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App
