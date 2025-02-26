import React, { createContext, useContext, useState, useEffect } from 'react';

const SimulationContext = createContext();

export function useSimulation() {
  return useContext(SimulationContext);
}

export function SimulationProvider({ children }) {
  const [simulationData, setSimulationData] = useState({
    solarSystem: {
      panelCount: 10,
      panelEfficiency: 0.2,
      batterySize: 10,
      inverterSize: 5,
    },
    weatherData: null,
    householdSetup: {
      occupants: 4,
      squareMeters: 150,
    },
    applianceStatus: {
      lights: false,
      tv: false,
      waterHeater: false,
      airConditioner: false,
    },
    energyProduction: 0,
    energyConsumption: 0,
    availableEnergy: 0,
    batteryCharge: 0,
    recentTrades: [],
  });

  useEffect(() => {
    // Initial weather data
    updateWeatherData(generateWeatherData());

    // Update weather and recalculate energy every minute (for demonstration purposes)
    const interval = setInterval(() => {
      updateWeatherData(generateWeatherData());
      recalculateEnergy();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    recalculateEnergy();
  }, [simulationData.solarSystem, simulationData.weatherData, simulationData.householdSetup, simulationData.applianceStatus]);

  const generateWeatherData = () => {
    return {
      temperature: Math.round(Math.random() * 30 + 10), // 10-40°C
      solarIrradiance: Math.round(Math.random() * 800 + 200), // 200-1000 W/m²
      cloudCover: Math.round(Math.random() * 100), // 0-100%
      windSpeed: Math.round(Math.random() * 20), // 0-20 km/h
    };
  };

  const calculateSolarProduction = (solarSystem, weatherData) => {
    if (!solarSystem || !weatherData) return 0;
    const baseProduction = solarSystem.panelCount * solarSystem.panelEfficiency * 1000; // Assuming 1000W/m² standard test condition
    const weatherFactor = (100 - weatherData.cloudCover) / 100;
    const rawProduction = +(baseProduction * weatherFactor * (weatherData.solarIrradiance / 1000)).toFixed(2);
    return Math.min(rawProduction, solarSystem.inverterSize * 1000); // Production limited by inverter size
  };

  const calculateEnergyConsumption = (householdSetup, applianceStatus) => {
    if (!householdSetup) return 0;
    const baseConsumption = householdSetup.occupants * 0.5 + householdSetup.squareMeters * 0.01;
    const applianceConsumption = Object.entries(applianceStatus).reduce((total, [appliance, isOn]) => {
      const consumptionRates = {
        lights: 0.1,
        tv: 0.15,
        waterHeater: 2.0,
        airConditioner: 1.5,
      };
      return total + (isOn ? consumptionRates[appliance] : 0);
    }, 0);
    return +(baseConsumption + applianceConsumption).toFixed(2);
  };

  const recalculateEnergy = () => {
    const production = calculateSolarProduction(simulationData.solarSystem, simulationData.weatherData);
    const consumption = calculateEnergyConsumption(simulationData.householdSetup, simulationData.applianceStatus);
    const energyDelta = production - consumption;
    let newBatteryCharge = simulationData.batteryCharge + energyDelta;
    newBatteryCharge = Math.max(0, Math.min(newBatteryCharge, simulationData.solarSystem.batterySize * 1000));

    setSimulationData((prevData) => ({
      ...prevData,
      energyProduction: production,
      energyConsumption: consumption,
      availableEnergy: newBatteryCharge / 1000, // Convert to kWh
      batteryCharge: newBatteryCharge,
    }));
  };

  const updateSolarSystem = (solarSystemData) => {
    setSimulationData((prevData) => ({
      ...prevData,
      solarSystem: solarSystemData,
    }));
  };

  const updateWeatherData = (weatherData) => {
    setSimulationData((prevData) => ({
      ...prevData,
      weatherData,
    }));
  };

  const updateHouseholdSimulation = (householdData) => {
    setSimulationData((prevData) => ({
      ...prevData,
      householdSetup: householdData,
    }));
  };

  const updateApplianceStatus = (appliance, status) => {
    setSimulationData((prevData) => ({
      ...prevData,
      applianceStatus: {
        ...prevData.applianceStatus,
        [appliance]: status,
      },
    }));
  };

  const createTrade = (tradeData) => {
    setSimulationData((prevData) => ({
      ...prevData,
      recentTrades: [tradeData, ...prevData.recentTrades.slice(0, 9)],
      availableEnergy: Math.max(0, prevData.availableEnergy - tradeData.amount),
    }));
  };

  const value = {
    simulationData,
    updateSolarSystem,
    updateWeatherData,
    updateHouseholdSimulation,
    updateApplianceStatus,
    createTrade,
  };

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
}