import React, { useState } from 'react';

const ApplianceControl = () => {
  const [appliances, setAppliances] = useState([
    { id: 1, name: 'Air Conditioner', status: false, consumption: 1.5 },
    { id: 2, name: 'Washing Machine', status: false, consumption: 0.5 },
    { id: 3, name: 'Refrigerator', status: true, consumption: 0.1 },
    { id: 4, name: 'TV', status: false, consumption: 0.1 },
  ]);

  const toggleAppliance = (id) => {
    setAppliances(appliances.map(appliance =>
      appliance.id === id ? { ...appliance, status: !appliance.status } : appliance
    ));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Appliance Control</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {appliances.map(appliance => (
          <div key={appliance.id} className="border p-4 rounded-lg">
            <h3 className="text-lg font-semibold">{appliance.name}</h3>
            <p>Status: {appliance.status ? 'On' : 'Off'}</p>
            <p>Consumption: {appliance.consumption} kWh/h</p>
            <button
              onClick={() => toggleAppliance(appliance.id)}
              className={`mt-2 py-1 px-3 rounded ${
                appliance.status
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {appliance.status ? 'Turn Off' : 'Turn On'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApplianceControl;

