import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'

const EnergyUsageSummary = ({ appliances }) => {
  const totalConsumption = appliances.reduce((total, appliance) => {
    return total + (appliance.power * appliance.usage) / 1000 // Convert to kWh
  }, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Energy Usage Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{totalConsumption.toFixed(2)} kWh/day</p>
        <p className="text-sm text-gray-600">Total energy consumption</p>
      </CardContent>
    </Card>
  )
}

export default EnergyUsageSummary
