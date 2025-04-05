"use client"
import { FaBatteryEmpty, FaBatteryQuarter, FaBatteryHalf, FaBatteryThreeQuarters, FaBatteryFull } from "react-icons/fa"

const BatteryStatus = ({ level = 0, charging = false, mode = "auto", onModeChange }) => {
  // Determine which battery icon to show based on level
  const getBatteryIcon = () => {
    if (level < 12.5) return <FaBatteryEmpty className="text-red-500" size={24} />
    if (level < 37.5) return <FaBatteryQuarter className="text-orange-500" size={24} />
    if (level < 62.5) return <FaBatteryHalf className="text-yellow-500" size={24} />
    if (level < 87.5) return <FaBatteryThreeQuarters className="text-green-500" size={24} />
    return <FaBatteryFull className="text-green-500" size={24} />
  }

  // Get color based on battery level
  const getLevelColor = () => {
    if (level < 20) return "text-red-500"
    if (level < 40) return "text-orange-500"
    if (level < 60) return "text-yellow-500"
    return "text-green-500"
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          {getBatteryIcon()}
          <span className={`text-xl font-bold ml-2 ${getLevelColor()}`}>{level.toFixed(0)}%</span>
          {charging && <span className="ml-2 text-green-500 text-sm">Charging</span>}
        </div>
        <div>
          <select
            value={mode}
            onChange={(e) => onModeChange && onModeChange(e.target.value)}
            className="text-sm border rounded p-1"
          >
            <option value="auto">Auto</option>
            <option value="charge">Charge</option>
            <option value="discharge">Discharge</option>
            <option value="hold">Hold</option>
          </select>
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${charging ? "animate-pulse" : ""} ${getLevelColor().replace("text", "bg")}`}
          style={{ width: `${level}%` }}
        ></div>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        {mode === "auto" && "Automatically manages charging and discharging based on energy needs"}
        {mode === "charge" && "Prioritizes charging the battery from available sources"}
        {mode === "discharge" && "Prioritizes using battery power before drawing from the grid"}
        {mode === "hold" && "Maintains current battery level for later use"}
      </div>
    </div>
  )
}

export default BatteryStatus

