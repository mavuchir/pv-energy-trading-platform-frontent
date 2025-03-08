import { FaInfoCircle, FaExclamationTriangle, FaCheckCircle, FaTimesCircle } from "react-icons/fa"
import { cn } from "../../lib/utils"

const variants = {
  default: "bg-blue-50 text-blue-800 border-blue-200",
  destructive: "bg-red-50 text-red-800 border-red-200",
  warning: "bg-yellow-50 text-yellow-800 border-yellow-200",
  success: "bg-green-50 text-green-800 border-green-200",
}

const icons = {
  default: <FaInfoCircle className="h-5 w-5 text-blue-500" />,
  destructive: <FaTimesCircle className="h-5 w-5 text-red-500" />,
  warning: <FaExclamationTriangle className="h-5 w-5 text-yellow-500" />,
  success: <FaCheckCircle className="h-5 w-5 text-green-500" />,
}

export const Alert = ({ children, variant = "default", className, icon, onClose, ...props }) => {
  return (
    <div className={cn("flex items-start p-4 border rounded-md", variants[variant], className)} role="alert" {...props}>
      <div className="flex-shrink-0 mr-3">{icon || icons[variant]}</div>
      <div className="flex-1">{children}</div>
      {onClose && (
        <button
          type="button"
          className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 focus:outline-none focus:ring-2 focus:ring-offset-2"
          onClick={onClose}
          aria-label="Close"
        >
          <span className="sr-only">Close</span>
          <FaTimesCircle className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}

