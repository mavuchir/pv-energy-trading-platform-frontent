import axios from "axios"

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  // Add withCredentials for CORS with credentials
  withCredentials: true,
})

// Add a request interceptor to include the auth token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token")
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle 401 Unauthorized errors by redirecting to login
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem("auth_token")
      localStorage.removeItem("user")

      // Redirect to login page
      window.location.href = "auth/login"
      // We can't use navigate here, so we'll let the component handle the redirect
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
        error.response.data.msg === "Subject must be a string" ||
        error.response.data.msg === "Invalid user ID in token" ||
        error.response.data.msg === "Token has been revoked"
      ) {
        console.log("Authentication error, clearing token and redirecting to login")
        // Clear local storage
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user")

        // Redirect to login page
        window.location.href = "auth/login"
      }
    }
    return Promise.reject(error)
  },
)

export default api
