import ApplianceList from "../components/ApplianceControl/ApplianceList"
import EnergyUsageSummary from "../components/ApplianceControl/EnergyUsageSummary"
import ScheduleOptimizer from "../components/ApplianceControl/ScheduleOptimizer"
import EnergyDemandForecast from "../components/ApplianceControl/EnergyDemandForecast"
import TradeRecommendation from "../components/ApplianceControl/TradeRecommendation"

const ApplianceControl = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Appliance Control</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ApplianceList />
        <div className="space-y-6">
          <EnergyUsageSummary />
          <ScheduleOptimizer />
        </div>
        <EnergyDemandForecast />
        <TradeRecommendation />
      </div>
    </div>
  )
}

export default ApplianceControl

