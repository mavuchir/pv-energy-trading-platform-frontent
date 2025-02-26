'use client';

import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/Input'
import { Label } from '../ui/label'

const ApplianceList = () => {
  const [appliances, setAppliances] = useState([
    { id: 1, name: 'Air Conditioner', power: 1500, usage: 5 },
    { id: 2, name: 'Refrigerator', power: 150, usage: 24 },
    { id: 3, name: 'Washing Machine', power: 500, usage: 1 },
  ])

  const [newAppliance, setNewAppliance] = useState({ name: '', power: '', usage: '' })

  const handleAddAppliance = (e) => {
    e.preventDefault()
    if (newAppliance.name && newAppliance.power && newAppliance.usage) {
      setAppliances([...appliances, { ...newAppliance, id: Date.now() }])
      setNewAppliance({ name: '', power: '', usage: '' })
    }
  }

  const handleRemoveAppliance = (id) => {
    setAppliances(appliances.filter(appliance => appliance.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {appliances.map(appliance => (
          <div key={appliance.id} className="flex items-center justify-between p-4 bg-gray-100 rounded-md">
            <div>
              <h3 className="font-semibold">{appliance.name}</h3>
              <p className="text-sm text-gray-600">Power: {appliance.power}W, Usage: {appliance.usage} hours/day</p>
            </div>
            <Button variant="destructive" onClick={() => handleRemoveAppliance(appliance.id)}>Remove</Button>
          </div>
        ))}
      </div>
      <form onSubmit={handleAddAppliance} className="space-y-4">
        <div>
          <Label htmlFor="name">Appliance Name</Label>
          <Input
            id="name"
            value={newAppliance.name}
            onChange={(e) => setNewAppliance({...newAppliance, name: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="power">Power Consumption (Watts)</Label>
          <Input
            id="power"
            type="number"
            value={newAppliance.power}
            onChange={(e) => setNewAppliance({...newAppliance, power: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="usage">Daily Usage (Hours)</Label>
          <Input
            id="usage"
            type="number"
            value={newAppliance.usage}
            onChange={(e) => setNewAppliance({...newAppliance, usage: e.target.value})}
            required
          />
        </div>
        <Button type="submit">Add Appliance</Button>
      </form>
    </div>
  )
}

export default ApplianceList
