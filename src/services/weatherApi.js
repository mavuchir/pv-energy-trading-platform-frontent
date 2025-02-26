export const getWeatherData = async () => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        temperature: 25,
        cloudCover: 20,
        solarIrradiance: 800,
      });
    }, 1000);
  });
};
