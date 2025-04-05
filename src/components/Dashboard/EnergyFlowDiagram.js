import { FaSolarPanel, FaHome, FaBatteryFull, FaExchangeAlt } from "react-icons/fa"

const EnergyFlowDiagram = ({
  solarGeneration = 0,
  homeConsumption = 0,
  batteryLevel = 0,
  batteryCharging = false,
  gridImport = 0,
  gridExport = 0,
}) => {
  // Calculate flow values
  const solarToHome = Math.min(solarGeneration, homeConsumption)
  const solarToBattery = batteryCharging ? Math.min(solarGeneration - solarToHome, 5) : 0
  const solarToGrid = gridExport
  const batteryToHome =
    !batteryCharging && homeConsumption > solarGeneration ? Math.min(homeConsumption - solarGeneration, 5) : 0
  const gridToHome = gridImport

  // Determine arrow colors and thicknesses based on flow values
  const getArrowStyle = (value) => {
    const maxThickness = 8
    const minThickness = 2
    const maxValue = 5 // kW

    // Calculate thickness based on value (capped at maxValue)
    const normalizedValue = Math.min(value, maxValue) / maxValue
    const thickness = minThickness + normalizedValue * (maxThickness - minThickness)

    return {
      strokeWidth: value > 0 ? thickness : 0,
      opacity: normalizedValue * 0.8 + 0.2, // Minimum opacity of 0.2
    }
  }

  return (
    <div className="relative h-[250px] w-full">
      <svg viewBox="0 0 400 250" className="w-full h-full">
        {/* Solar Panel */}
        <g transform="translate(50, 30)">
          <rect x="-25" y="-25" width="50" height="50" rx="5" fill="#FEFCBF" />
          <foreignObject x="-15" y="-15" width="30" height="30">
            <FaSolarPanel className="text-yellow-500 w-full h-full" />
          </foreignObject>
          <text x="0" y="40" textAnchor="middle" className="text-xs font-medium">
            {solarGeneration.toFixed(1)} kW
          </text>
        </g>

        {/* Home */}
        <g transform="translate(200, 200)">
          <rect x="-30" y="-30" width="60" height="60" rx="5" fill="#E6FFFA" />
          <foreignObject x="-15" y="-15" width="30" height="30">
            <FaHome className="text-teal-500 w-full h-full" />
          </foreignObject>
          <text x="0" y="45" textAnchor="middle" className="text-xs font-medium">
            {homeConsumption.toFixed(1)} kW
          </text>
        </g>

        {/* Battery */}
        <g transform="translate(200, 30)">
          <rect x="-25" y="-25" width="50" height="50" rx="5" fill="#EBF4FF" />
          <foreignObject x="-15" y="-15" width="30" height="30">
            <FaBatteryFull className="text-blue-500 w-full h-full" />
          </foreignObject>
          <text x="0" y="40" textAnchor="middle" className="text-xs font-medium">
            {batteryLevel}%
          </text>
        </g>

        {/* Grid */}
        <g transform="translate(350, 30)">
          <rect x="-25" y="-25" width="50" height="50" rx="5" fill="#F0FFF4" />
          <foreignObject x="-15" y="-15" width="30" height="30">
            <FaExchangeAlt className="text-green-500 w-full h-full" />
          </foreignObject>
          <text x="0" y="40" textAnchor="middle" className="text-xs font-medium">
            {gridImport > 0 ? `↓ ${gridImport.toFixed(1)}` : gridExport > 0 ? `↑ ${gridExport.toFixed(1)}` : "0.0"} kW
          </text>
        </g>

        {/* Arrows */}
        {/* Solar to Home */}
        <path
          d="M 75 55 L 170 170"
          stroke="#FBBF24"
          strokeLinecap="round"
          markerEnd="url(#arrowhead)"
          style={getArrowStyle(solarToHome)}
          fill="none"
        />

        {/* Solar to Battery */}
        <path
          d="M 75 30 L 170 30"
          stroke="#FBBF24"
          strokeLinecap="round"
          markerEnd="url(#arrowhead)"
          style={getArrowStyle(solarToBattery)}
          fill="none"
        />

        {/* Solar to Grid */}
        <path
          d="M 75 15 C 120 -20 280 -20 325 15"
          stroke="#FBBF24"
          strokeLinecap="round"
          markerEnd="url(#arrowhead)"
          style={getArrowStyle(solarToGrid)}
          fill="none"
        />

        {/* Battery to Home */}
        <path
          d="M 200 55 L 200 170"
          stroke="#3B82F6"
          strokeLinecap="round"
          markerEnd="url(#arrowhead)"
          style={getArrowStyle(batteryToHome)}
          fill="none"
        />

        {/* Grid to Home */}
        <path
          d="M 325 55 L 230 170"
          stroke="#10B981"
          strokeLinecap="round"
          markerEnd="url(#arrowhead)"
          style={getArrowStyle(gridToHome)}
          fill="none"
        />

        {/* Arrowhead marker definition */}
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
          </marker>
        </defs>
      </svg>
    </div>
  )
  
}

export default EnergyFlowDiagram

