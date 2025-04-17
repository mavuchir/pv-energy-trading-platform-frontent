import { BrowserRouter as Router } from "react-router-dom"
import AppRoutes from "./routes"
import { AuthProvider } from "./contexts/AuthContext"
import { NotificationProvider } from "./contexts/NotificationContext"
import { SocketProvider } from "./contexts/SocketContext"
import "./index.css"

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <NotificationProvider>
            <AppRoutes />
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
