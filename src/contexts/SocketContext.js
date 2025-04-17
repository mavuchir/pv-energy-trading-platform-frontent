"use client"

import { createContext, useState, useEffect, useContext } from "react"
import io from "socket.io-client"
import { useAuth } from "./AuthContext"

const SocketContext = createContext()

export const useSocket = () => useContext(SocketContext)

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const { token, isAuthenticated } = useAuth()

  useEffect(() => {
    let socketInstance = null

    if (isAuthenticated && token) {
      // Initialize socket connection
      socketInstance = io(process.env.REACT_APP_API_BASE_URL || "http://localhost:5000", {
        auth: {
          token,
        },
      })

      socketInstance.on("connect", () => {
        console.log("Socket connected")
        setConnected(true)
      })

      socketInstance.on("disconnect", () => {
        console.log("Socket disconnected")
        setConnected(false)
      })

      socketInstance.on("connect_error", (error) => {
        console.error("Socket connection error:", error)
        setConnected(false)
      })

      setSocket(socketInstance)
    }

    // Cleanup on unmount or when auth state changes
    return () => {
      if (socketInstance) {
        socketInstance.disconnect()
        setSocket(null)
        setConnected(false)
      }
    }
  }, [isAuthenticated, token])

  return <SocketContext.Provider value={{ socket, connected }}>{children}</SocketContext.Provider>
}
