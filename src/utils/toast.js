// Simple toast utility to handle notifications
export const toast = {
    success: (message) => {
      console.log("Success:", message)
      // You can replace this with your preferred toast library
      if (window.toastify) {
        window.toastify.success(message)
      } else {
        alert(message)
      }
    },
  
    error: (message) => {
      console.error("Error:", message)
      // You can replace this with your preferred toast library
      if (window.toastify) {
        window.toastify.error(message)
      } else {
        alert(`Error: ${message}`)
      }
    },
  
    info: (message) => {
      console.info("Info:", message)
      // You can replace this with your preferred toast library
      if (window.toastify) {
        window.toastify.info(message)
      } else {
        alert(message)
      }
    },
  }
  