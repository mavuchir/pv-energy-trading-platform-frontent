// Simplified solar energy calculation
export const simulateSolarSystem = (panelCount, panelEfficiency) => {
  const averageDailySunHours = 5; // Assume 5 hours of sunlight per day
  const panelSize = 1.6; // Assume 1.6 m^2 per panel
  const solarIrradiance = 1000; // W/m^2 (standard solar irradiance)

  const dailyEnergy = panelCount * panelSize * solarIrradiance * panelEfficiency * averageDailySunHours / 1000; // in kWh
  const monthlyEnergy = dailyEnergy * 30; // Assuming 30 days per month

  return {
    dailyEnergy,
    monthlyEnergy
  };
};

