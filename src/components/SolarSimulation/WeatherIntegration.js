import React from 'react';
import { FaSun, FaCloud, FaWind, FaThermometerHalf } from 'react-icons/fa';

export default function WeatherIntegration({ weatherData }) {
  // If weather data is not available, show a loading message
  if (!weatherData) {
    return (
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-yellow-500 text-white px-6 py-4">
          <h3 className="text-xl font-semibold flex items-center">
            <FaSun className="mr-2" />
            Weather Integration
          </h3>
        </div>
        <div className="p-6">
          <p className="text-center text-gray-600">Loading weather data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="bg-yellow-500 text-white px-6 py-4">
        <h3 className="text-xl font-semibold flex items-center">
          <FaSun className="mr-2" />
          Weather Integration
        </h3>
      </div>
      <div className="p-6 space-y-4">
        {/* Temperature */}
        <div className="flex items-center justify-between bg-red-100 rounded-lg p-4">
          <div className="flex items-center">
            <FaThermometerHalf className="text-red-500 mr-2" />
            <span className="font-medium">Temperature</span>
          </div>
          <span className="text-lg font-semibold">{weatherData.temperature}°C</span>
        </div>
        {/* Solar Irradiance */}
        <div className="flex items-center justify-between bg-yellow-100 rounded-lg p-4">
          <div className="flex items-center">
            <FaSun className="text-yellow-500 mr-2" />
            <span className="font-medium">Solar Irradiance</span>
          </div>
          <span className="text-lg font-semibold">{weatherData.solarIrradiance} W/m²</span>
        </div>
        {/* Cloud Cover */}
        <div className="flex items-center justify-between bg-gray-100 rounded-lg p-4">
          <div className="flex items-center">
            <FaCloud className="text-gray-500 mr-2" />
            <span className="font-medium">Cloud Cover</span>
          </div>
          <span className="text-lg font-semibold">{weatherData.cloudCover}%</span>
        </div>
        {/* Wind Speed */}
        <div className="flex items-center justify-between bg-blue-100 rounded-lg p-4">
          <div className="flex items-center">
            <FaWind className="text-blue-500 mr-2" />
            <span className="font-medium">Wind Speed</span>
          </div>
          <span className="text-lg font-semibold">{weatherData.windSpeed} km/h</span>
        </div>
      </div>
    </div>
  );
}