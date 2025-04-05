import { Card, CardContent } from "../ui/Card"
import { FaChartLine, FaArrowUp, FaArrowDown, FaExchangeAlt, FaPlug } from "react-icons/fa"

const CommunityEnergyStats = ({ stats }) => {
  if (!stats) return null

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-medium flex items-center mb-4">
          <FaChartLine className="mr-2 text-teal-600" />
          Energy Statistics
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 mr-2">
                  <FaArrowUp />
                </div>
                <span>Total Generation</span>
              </div>
              <span className="font-bold">{stats.total_generation?.toFixed(2) || 0} kWh</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-700 mr-2">
                  <FaArrowDown />
                </div>
                <span>Total Consumption</span>
              </div>
              <span className="font-bold">{stats.total_consumption?.toFixed(2) || 0} kWh</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 mr-2">
                  <FaExchangeAlt />
                </div>
                <span>Energy Traded</span>
              </div>
              <span className="font-bold">{stats.total_energy_traded?.toFixed(2) || 0} kWh</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 mr-2">
                  <FaPlug />
                </div>
                <span>Current Demand</span>
              </div>
              <span className="font-bold">{stats.current_demand_kw?.toFixed(2) || 0} kW</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 mr-2">
                  <FaChartLine />
                </div>
                <span>Energy Balance</span>
              </div>
              <span className={`font-bold ${(stats.energy_balance || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                {stats.energy_balance?.toFixed(2) || 0} kWh
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 mr-2">
                  <FaExchangeAlt />
                </div>
                <span>Trading Activity</span>
              </div>
              <span className="font-bold capitalize">{stats.trading_activity || "Medium"}</span>
            </div>
          </div>
        </div>

        {/* Energy balance visualization */}
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-2">Community Energy Balance</p>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${(stats.energy_balance || 0) >= 0 ? "bg-green-500" : "bg-red-500"}`}
              style={{
                width: `${Math.min(Math.abs(((stats.energy_balance || 0) / (stats.total_generation || 1)) * 100), 100)}%`,
                marginLeft: (stats.energy_balance || 0) >= 0 ? "50%" : "",
                marginRight: (stats.energy_balance || 0) < 0 ? "50%" : "",
              }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Deficit</span>
            <span>Balance</span>
            <span>Surplus</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CommunityEnergyStats

