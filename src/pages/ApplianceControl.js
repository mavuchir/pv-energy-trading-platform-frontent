import React from 'react'
import ApplianceList from '../components/ApplianceControl/ApplianceList'
import EnergyUsageSummary from '../components/ApplianceControl/EnergyUsageSummary'
import ScheduleOptimizer from '../components/ApplianceControl/ScheduleOptimizer'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'

const ApplianceControl = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Appliance Control</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Appliances</CardTitle>
            </CardHeader>
            <CardContent>
              <ApplianceList />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Energy Usage Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <EnergyUsageSummary />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Schedule Optimizer</CardTitle>
            </CardHeader>
            <CardContent>
              <ScheduleOptimizer />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ApplianceControl