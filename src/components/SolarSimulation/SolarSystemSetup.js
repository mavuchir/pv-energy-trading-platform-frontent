"use client"

import { useState } from "react"
import { Sun, MapPin, Thermometer, SunIcon as Solar, Compass } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../ui/Card"
import { Input } from "../../ui/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { Button } from "../../ui/button"
import { Progress } from "../../ui/progress"

const SolarSystemSetup = () => {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // Location and Environmental Conditions
    latitude: "",
    longitude: "",
    solarIrradiance: "",
    averageTemperature: "",

    // Solar System Specifications
    systemCapacity: "",
    panelType: "",
    numberOfPanels: "",
    tiltAngle: "",
    orientation: "",
    efficiencyRating: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleNext = () => {
    setStep((prev) => prev + 1)
  }

  const handlePrevious = () => {
    setStep((prev) => prev - 1)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission
    console.log("Form submitted:", formData)
    // Here you would typically send the data to your backend
  }

  const renderStepIcon = (currentStep) => {
    switch (currentStep) {
      case 1:
        return <MapPin className="h-6 w-6 text-primary" />
      case 2:
        return <Solar className="h-6 w-6 text-primary" />
      default:
        return null
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-center mb-4">
          <Sun className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold text-center">Solar System Setup</CardTitle>
        <CardDescription className="text-center">Configure your solar energy system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Progress value={(step / 2) * 100} className="w-full" />
          <div className="flex justify-between mt-2">
            <span className="text-sm font-medium">Step {step} of 2</span>
            <span className="text-sm font-medium">{step === 1 ? "Location" : "System Specs"}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 ? (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                {renderStepIcon(step)}
                <h3 className="text-lg font-medium">Location and Environmental Conditions</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                  <Input
                    type="number"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    placeholder="Enter latitude"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                  <Input
                    type="number"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    placeholder="Enter longitude"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center space-x-1">
                      <Sun className="h-4 w-4" />
                      <span>Solar Irradiance (kWh/m²/day)</span>
                    </div>
                  </label>
                  <Input
                    type="number"
                    name="solarIrradiance"
                    value={formData.solarIrradiance}
                    onChange={handleChange}
                    placeholder="Enter solar irradiance"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center space-x-1">
                      <Thermometer className="h-4 w-4" />
                      <span>Average Temperature (°C)</span>
                    </div>
                  </label>
                  <Input
                    type="number"
                    name="averageTemperature"
                    value={formData.averageTemperature}
                    onChange={handleChange}
                    placeholder="Enter average temperature"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                {renderStepIcon(step)}
                <h3 className="text-lg font-medium">Solar System Specifications</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">System Capacity (kW)</label>
                  <Input
                    type="number"
                    name="systemCapacity"
                    value={formData.systemCapacity}
                    onChange={handleChange}
                    placeholder="Enter system capacity"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Panel Type</label>
                  <Select
                    name="panelType"
                    value={formData.panelType}
                    onValueChange={(value) => handleSelectChange("panelType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select panel type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monocrystalline">Monocrystalline</SelectItem>
                      <SelectItem value="polycrystalline">Polycrystalline</SelectItem>
                      <SelectItem value="thinFilm">Thin Film</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Panels</label>
                  <Input
                    type="number"
                    name="numberOfPanels"
                    value={formData.numberOfPanels}
                    onChange={handleChange}
                    placeholder="Enter number of panels"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tilt Angle (degrees)</label>
                  <Input
                    type="number"
                    name="tiltAngle"
                    value={formData.tiltAngle}
                    onChange={handleChange}
                    placeholder="Enter tilt angle"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center space-x-1">
                      <Compass className="h-4 w-4" />
                      <span>Orientation</span>
                    </div>
                  </label>
                  <Select
                    name="orientation"
                    value={formData.orientation}
                    onValueChange={(value) => handleSelectChange("orientation", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select orientation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="north">North</SelectItem>
                      <SelectItem value="south">South</SelectItem>
                      <SelectItem value="east">East</SelectItem>
                      <SelectItem value="west">West</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Efficiency Rating (%)</label>
                  <Input
                    type="number"
                    name="efficiencyRating"
                    value={formData.efficiencyRating}
                    onChange={handleChange}
                    placeholder="Enter efficiency rating"
                  />
                </div>
              </div>
            </div>
          )}
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        {step > 1 && (
          <Button variant="outline" onClick={handlePrevious}>
            Previous
          </Button>
        )}

        {step < 2 ? (
          <Button onClick={handleNext} className="ml-auto">
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmit} className="ml-auto">
            Complete Setup
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

export default SolarSystemSetup

