import axios from "axios"

// Create axios instance
const api = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
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
    // Handle token expiration
    if (error.response && error.response.status === 401) {
      // Check if the error is due to an expired token
      if (error.response.data.msg === "Token has expired") {
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

