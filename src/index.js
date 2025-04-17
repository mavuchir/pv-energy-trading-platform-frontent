import React from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App"

// Ensure that there's a root element with the id 'root' in your public/index.html
const container = document.getElementById("root")

// Create a root.
const root = createRoot(container)

// Initial render: Render the app
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
