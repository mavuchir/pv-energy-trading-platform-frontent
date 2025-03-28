import axios from "axios"

// Create axios instance
const api = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
  // Add withCredentials for CORS with credentials
  withCredentials: true,
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't automatically logout on 401 errors
    // Just log the error and let the component handle it
    if (error.response && error.response.status === 401) {
      console.error("Authentication error:", error)
      // Don't remove token here - let the component decide what to do
      return Promise.reject(error)
    }

    console.error("API Error:", error)

    // Handle network errors
    if (!error.response) {
      console.error("Network error - no response received")
      return Promise.reject(new Error("Network error. Please check your connection."))
    }

    // Handle token expiration or invalid token
    if (error.response && (error.response.status === 401 || error.response.status === 422)) {
      // Check if the error is due to an expired or invalid token
      if (
        error.response.data.msg === "Token has expired" ||
        error.response.data.msg === "Invalid user ID in token" ||
        error.response.data.msg === "Token has been revoked"
      ) {
        console.log("Authentication error, clearing token and redirecting to login")
        // Clear local storage
        localStorage.removeItem("token")
        localStorage.removeItem("user")

        // Redirect to login page
        window.location.href = "/login"
      }
    }

    return Promise.reject(error)
  },
)

export default api

