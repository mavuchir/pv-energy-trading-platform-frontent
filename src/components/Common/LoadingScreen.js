import { FaSpinner } from "react-icons/fa"

const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center">
        <FaSpinner className="animate-spin h-12 w-12 text-teal-500" />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  )
}

export default LoadingScreen
