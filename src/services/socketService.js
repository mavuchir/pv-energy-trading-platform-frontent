import { io } from "socket.io-client"

class SocketService {
  socket = null
  connected = false
  callbacks = {}

  connect() {
    if (this.socket) {
      return
    }

    const token = localStorage.getItem("auth_token")
    if (!token) {
      console.error("No token available for socket connection")
      return
    }

    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000"

    // Initialize socket connection with authentication
    this.socket = io(API_URL, {
      auth: {
        token: token,
      },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    })

    // Setup event handlers
    this.socket.on("connect", () => {
      console.log("Socket connected")
      this.connected = true
      this._triggerCallbacks("connect")
    })

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason)
      this.connected = false
      this._triggerCallbacks("disconnect", reason)
    })

    this.socket.on("error", (error) => {
      console.error("Socket error:", error)
      this._triggerCallbacks("error", error)
    })

    // Energy event handlers
    this.socket.on("production_updated", (data) => {
      console.log("Production updated:", data)
      this._triggerCallbacks("production_updated", data)
    })

    this.socket.on("consumption_updated", (data) => {
      console.log("Consumption updated:", data)
      this._triggerCallbacks("consumption_updated", data)
    })

    this.socket.on("battery_updated", (data) => {
      console.log("Battery updated:", data)
      this._triggerCallbacks("battery_updated", data)
    })

    this.socket.on("appliance_updated", (data) => {
      console.log("Appliance updated:", data)
      this._triggerCallbacks("appliance_updated", data)
    })

    this.socket.on("weather_updated", (data) => {
      console.log("Weather updated:", data)
      this._triggerCallbacks("weather_updated", data)
    })

    this.socket.on("recommendation_updated", (data) => {
      console.log("Recommendation updated:", data)
      this._triggerCallbacks("recommendation_updated", data)
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.connected = false
    }
  }

  // Subscribe to events
  subscribe(event, callback) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = []
    }
    this.callbacks[event].push(callback)

    return () => {
      this.callbacks[event] = this.callbacks[event].filter((cb) => cb !== callback)
    }
  }

  // Trigger callbacks for an event
  _triggerCallbacks(event, data) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach((callback) => {
        try {
          callback(data)
        } catch (err) {
          console.error(`Error in ${event} callback:`, err)
        }
      })
    }
  }

  // Helper to check connection status
  isConnected() {
    return this.connected
  }
}

// Singleton instance
const socketService = new SocketService()
export default socketService
