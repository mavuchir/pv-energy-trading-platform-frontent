import { useRoutes } from "react-router-dom"
import routes from "./routes"

const AppRouter = () => {
  const routeElements = useRoutes(routes)
  return routeElements
}

export default AppRouter
