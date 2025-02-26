import React from 'react'
import EnergyAnalytics from '../components/Analytics/EnergyAnalytics'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'

const Analytics = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Analytics</h1>
      <Card>
        <CardHeader>
          <CardTitle>Energy Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <EnergyAnalytics />
        </CardContent>
      </Card>
    </div>
  )
}

export default Analytics