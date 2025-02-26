import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import EnergyUsageSimulator from '../components/HouseholdSimulation/EnergyUsageSimulator';
import ApplianceControl from '../components/HouseholdSimulation/ApplianceControl';

export default function HouseholdSimulation() {
  const { simulationData, updateHouseholdSimulation } = useSimulation();

  const handleHouseholdSetup = (setupData) => {
    updateHouseholdSimulation(setupData);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-900">Household Simulation</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <EnergyUsageSimulator onSimulate={handleHouseholdSetup} />
        <ApplianceControl />
      </div>
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Current Energy Consumption</h3>
        <p className="text-3xl font-bold text-red-600">{simulationData.energyConsumption.toFixed(2)} kWh</p>
      </div>
    </div>
  );
}