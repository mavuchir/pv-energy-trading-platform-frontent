import React, { useState } from 'react';
import { FaBolt } from 'react-icons/fa';
import { simulateEnergyUsage } from '../../utils/energyUsageCalculations';

export default function EnergyUsageSimulator() {
  const [occupants, setOccupants] = useState(2);
  const [squareMeters, setSquareMeters] = useState(100);
  const [simulationResult, setSimulationResult] = useState(null);

  const handleSimulate = () => {
    const result = simulateEnergyUsage(occupants, squareMeters);
    setSimulationResult(result);
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="bg-green-600 text-white px-6 py-4">
        <h3 className="text-xl font-semibold flex items-center">
          <FaBolt className="mr-2" />
          Energy Usage Simulator
        </h3>
      </div>
      <div className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Number of Occupants</label>
          <input
            type="range"
            min="1"
            max="10"
            value={occupants}
            onChange={(e) => setOccupants(parseInt(e.target.value))}
            className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
          />
          <p className="mt-1 text-sm text-gray-600">{occupants} occupants</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">House Size (m²)</label>
          <input
            type="range"
            min="50"
            max="500"
            step="10"
            value={squareMeters}
            onChange={(e) => setSquareMeters(parseInt(e.target.value))}
            className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
          />
          <p className="mt-1 text-sm text-gray-600">{squareMeters} m²</p>
        </div>
        <button
          onClick={handleSimulate}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-150 ease-in-out"
        >
          Simulate Energy Usage
        </button>
        {simulationResult && (
          <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Estimated Daily Energy Usage:</strong>
            <span className="block sm:inline"> {simulationResult.toFixed(2)} kWh</span>
          </div>
        )}
      </div>
    </div>
  );
}