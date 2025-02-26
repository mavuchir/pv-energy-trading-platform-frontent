"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/Card"
import { Button } from "../components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/Tabs"
import { Switch } from "../components/ui/switch"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const SolarSimulationPage = () => {
  const [solarSystemConfig, setSolarSystemConfig] = useState(null)
  const [isConfigComplete, setIsConfigComplete] = useState(false)
  const [simulationData, setSimulationData] = useState(null)
  const [appliances, setAppliances] = useState([])

  useEffect(() => {
    // Fetch solar system configuration
    // This is a mock implementation. Replace with actual API call.
    const fetchedConfig = {
      location: { latitude: 40.7128, longitude: -74.006 },
      panelSpecs: { type: "Monocrystalline", capacity: 5000 },
      batteryCapacity: 10000,
      environmentalConditions: { avgSolarIrradiance: 4.5 },
    }
    setSolarSystemConfig(fetchedConfig)
    setIsConfigComplete(true)

    // Fetch appliances
    // This is a mock implementation. Replace with actual API call.
    const fetchedAppliances = [
      { id: 1, name: "Refrigerator", consumption: 150, isOn: true },
      { id: 2, name: "Air Conditioner", consumption: 1000, isOn: false },
      { id: 3, name: "Washing Machine", consumption: 500, isOn: false },
    ]
    setAppliances(fetchedAppliances)

    // Generate mock simulation data
    const mockSimulationData = generateMockSimulationData()
    setSimulationData(mockSimulationData)
  }, [])

  const generateMockSimulationData = () => {
    const data = []
    for (let i = 0; i < 24; i++) {
      data.push({
        time: `${i}:00`,
        generation: Math.random() * 500,
        consumption: Math.random() * 400,
        batterylevel: Math.random() * 100,
      })
    }
    return data
  }

  const handleEditConfig = () => {
    // Implement edit configuration logic
    console.log("Edit configuration")
  }

  const handleApplianceToggle = (id) => {
    setAppliances(appliances.map((app) => (app.id === id ? { ...app, isOn: !app.isOn } : app)))
  }

  const calculateEnergyBalance = () => {
    const totalGeneration = simulationData.reduce((sum, data) => sum + data.generation, 0)
    const totalConsumption = simulationData.reduce((sum, data) => sum + data.consumption, 0)
    return totalGeneration - totalConsumption
  }

  if (!solarSystemConfig || !simulationData) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">
      {/* Top Summary Bar */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Solar Simulation Dashboard</h2>
              <p className="text-gray-600">Energy Balance: {calculateEnergyBalance().toFixed(2)} kWh</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">Solar Efficiency: 85%</p>
              <p className="font-semibold">Battery Charge: 75%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Status Panel */}
      {!isConfigComplete && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Configuration Incomplete</CardTitle>
            <CardDescription>Please complete your solar system setup to enable full simulation.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => setIsConfigComplete(true)}>Complete Setup</Button>
          </CardFooter>
        </Card>
      )}

      {/* Main Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* System Overview */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="generation">
              <TabsList>
                <TabsTrigger value="generation">Generation</TabsTrigger>
                <TabsTrigger value="consumption">Consumption</TabsTrigger>
                <TabsTrigger value="battery">Battery</TabsTrigger>
              </TabsList>
              <TabsContent value="generation">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={simulationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="generation" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
              <TabsContent value="consumption">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={simulationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="consumption" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
              <TabsContent value="battery">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={simulationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="batterylevel" stroke="#ffc658" />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* System Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>System Configuration</CardTitle>
            <CardDescription>Current solar system setup</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div>
                <dt className="font-semibold">Location</dt>
                <dd>
                  {solarSystemConfig.location.latitude}, {solarSystemConfig.location.longitude}
                </dd>
              </div>
              <div>
                <dt className="font-semibold">Panel Type</dt>
                <dd>{solarSystemConfig.panelSpecs.type}</dd>
              </div>
              <div>
                <dt className="font-semibold">System Capacity</dt>
                <dd>{solarSystemConfig.panelSpecs.capacity} W</dd>
              </div>
              <div>
                <dt className="font-semibold">Battery Capacity</dt>
                <dd>{solarSystemConfig.batteryCapacity} Wh</dd>
              </div>
              <div>
                <dt className="font-semibold">Avg. Solar Irradiance</dt>
                <dd>{solarSystemConfig.environmentalConditions.avgSolarIrradiance} kWh/m²/day</dd>
              </div>
            </dl>
          </CardContent>
          <CardFooter>
            <Button onClick={handleEditConfig}>Edit Configuration</Button>
          </CardFooter>
        </Card>

        {/* Appliance Control */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Appliance Control</CardTitle>
            <CardDescription>Manage your appliances and see their impact on energy consumption</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {appliances.map((appliance) => (
                <li key={appliance.id} className="flex items-center justify-between">
                  <span>
                    {appliance.name} ({appliance.consumption} W)
                  </span>
                  <Switch checked={appliance.isOn} onCheckedChange={() => handleApplianceToggle(appliance.id)} />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Trading & Optimization Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Energy Trading Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Based on your current energy balance:</p>
            {calculateEnergyBalance() > 0 ? (
              <p className="text-green-600">
                You have excess energy. Consider selling to the grid or neighbors for profit.
              </p>
            ) : (
              <p className="text-red-600">
                You have an energy deficit. Consider purchasing from the grid or optimizing consumption.
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button>View Trading Options</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default SolarSimulationPage

