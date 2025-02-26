// Calculate total energy consumption for a household
export const calculateTotalConsumption = (appliances) => {
  return appliances.reduce((total, appliance) => {
    return total + (appliance.status ? appliance.consumption : 0);
  }, 0);
};

// Calculate energy cost
export const calculateEnergyCost = (consumption, rate) => {
  return consumption * rate;
};

