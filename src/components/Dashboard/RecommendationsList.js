import React from 'react';
import { FaLightbulb, FaBatteryHalf, FaExchangeAlt, FaSun, FaCloudSun } from 'react-icons/fa';

const getIconForRecommendation = (type) => {
  switch (type) {
    case 'surplus':
    case 'deficit':
      return <FaExchangeAlt className="text-blue-500" />;
    case 'best_hours':
    case 'worst_hours':
      return <FaCloudSun className="text-yellow-500" />;
    case 'battery_low':
    case 'battery_high':
      return <FaBatteryHalf className="text-green-500" />;
    case 'sell':
    case 'buy':
      return <FaExchangeAlt className="text-purple-500" />;
    default:
      return <FaLightbulb className="text-yellow-500" />;
  }
};

const RecommendationsList = ({ recommendations = [] }) => {
  // If no recommendations provided, show default ones
  const defaultRecommendations = [
    {
      type: 'best_hours',
      message: 'Best hours to use energy: 10:00, 11:00, 12:00, 13:00, 14:00',
      action: 'Schedule energy-intensive tasks during these hours to maximize self-consumption.'
    },
    {
      type: 'battery_low',
      message: 'Your battery is low at 1.0%.',
      action: 'Consider charging your battery during upcoming surplus hours.'
    },
    {
      type: 'sell',
      message: 'You could earn approximately $0.15 by selling your surplus energy at the current market price ($0.15/kWh).',
      action: 'Consider setting up energy trades to sell your excess production.'
    }
  ];

  const displayRecommendations = recommendations.length > 0 ? recommendations : defaultRecommendations;

  return (
    <div className="space-y-4">
      {displayRecommendations.map((recommendation, index) => (
        <div key={index} className="bg-gray-50 rounded-lg p-4 flex">
          <div className="flex-shrink-0 mr-4 mt-0.5">
            <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center">
              {getIconForRecommendation(recommendation.type)}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">{recommendation.message}</h4>
            <p className="mt-1 text-sm text-gray-500">{recommendation.action}</p>
          </div>
        </div>
      ))}
      
      {displayRecommendations.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No recommendations available at this time.
        </div>
      )}
    </div>
  );
};

export default RecommendationsList;