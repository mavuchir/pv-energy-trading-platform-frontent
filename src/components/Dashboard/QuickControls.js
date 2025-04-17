import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaLightbulb, FaTv, FaWater, FaSnowflake } from 'react-icons/fa';

const QuickControls = () => {
  const [devices, setDevices] = useState({
    lighting: false,
    tv: false,
    waterHeater: false,
    refrigerator: true
  });

  const toggleDevice = (device) => {
    setDevices(prev => ({
      ...prev,
      [device]: !prev[device]
    }));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => toggleDevice('lighting')}
          className={`flex items-center justify-center p-2 rounded-md ${
            devices.lighting 
              ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' 
              : 'bg-gray-100 text-gray-800 border border-gray-200'
          }`}
        >
          <FaLightbulb className="mr-2" />
          Lighting
        </button>
        
        <button
          onClick={() => toggleDevice('tv')}
          className={`flex items-center justify-center p-2 rounded-md ${
            devices.tv 
              ? 'bg-blue-100 text-blue-800 border border-blue-300' 
              : 'bg-gray-100 text-gray-800 border border-gray-200'
          }`}
        >
          <FaTv className="mr-2" />
          TV
        </button>
        
        <button
          onClick={() => toggleDevice('waterHeater')}
          className={`flex items-center justify-center p-2 rounded-md ${
            devices.waterHeater 
              ? 'bg-red-100 text-red-800 border border-red-300' 
              : 'bg-gray-100 text-gray-800 border border-gray-200'
          }`}
        >
          <FaWater className="mr-2" />
          Water Heater
        </button>
        
        <button
          onClick={() => toggleDevice('refrigerator')}
          className={`flex items-center justify-center p-2 rounded-md ${
            devices.refrigerator 
              ? 'bg-green-100 text-green-800 border border-green-300' 
              : 'bg-gray-100 text-gray-800 border border-gray-200'
          }`}
        >
          <FaSnowflake className="mr-2" />
          Refrigerator
        </button>
      </div>
      
      <Link
        to="/appliance-control"
        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
      >
        Manage Appliances
      </Link>
    </div>
  );
};

export default QuickControls;