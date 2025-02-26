import React from 'react';
import { FaLightbulb, FaTv, FaWater, FaTemperatureHigh } from 'react-icons/fa';
import { useSimulation } from '../../context/SimulationContext';

export default function ApplianceControl() {
  const { simulationData, updateApplianceStatus } = useSimulation();

  const appliances = [
    { name: 'lights', icon: FaLightbulb, color: 'yellow', rating: 0.1 },
    { name: 'tv', icon: FaTv, color: 'blue', rating: 0.15 },
    { name: 'waterHeater', icon: FaWater, color: 'blue', rating: 2.0 },
    { name: 'airConditioner', icon: FaTemperatureHigh, color: 'red', rating: 1.5 },
  ];

  const handleStatusChange = (appliance) => {
    const newStatus = !simulationData.applianceStatus[appliance];
    updateApplianceStatus(appliance, newStatus);
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="bg-purple-600 text-white px-6 py-4">
        <h3 className="text-xl font-semibold flex items-center">
          <FaLightbulb className="mr-2" />
          Appliance Control
        </h3>
      </div>
      <div className="p-6 space-y-6">
        {appliances.map((appliance) => (
          <div key={appliance.name} className="flex items-center justify-between">
            <span className="flex items-center text-gray-700">
              <appliance.icon className={`text-${appliance.color}-500 mr-2`} />
              {appliance.name.charAt(0).toUpperCase() + appliance.name.slice(1)}
              <span className="ml-2 text-sm text-gray-500">({appliance.rating} kW)</span>
            </span>
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={simulationData.applianceStatus[appliance.name]}
                  onChange={() => handleStatusChange(appliance.name)}
                />
                <div className="w-10 h-4 bg-gray-400 rounded-full shadow-inner"></div>
                <div className={`absolute w-6 h-6 bg-white rounded-full shadow -left-1 -top-1 transition ${simulationData.applianceStatus[appliance.name] ? 'transform translate-x-full bg-green-500' : ''}`}></div>
              </div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}