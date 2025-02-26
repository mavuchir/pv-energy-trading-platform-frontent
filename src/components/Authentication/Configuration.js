"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSolarPanel, FaBolt, FaHome, FaBatteryFull } from 'react-icons/fa';
import { Button } from '../ui/button';
import { Input } from '../ui/Input';
import { Label } from '../ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const Configuration = () => {
  const [step, setStep] = useState(1);
  const [location, setLocation] = useState({ latitude: '', longitude: '' });
  const [solarSpecs, setSolarSpecs] = useState({
    capacity: '',
    panelType: '',
    numberOfPanels: '',
    tiltAngle: '',
    orientation: '',
    efficiencyRating: ''
  });
  const [environmentalConditions, setEnvironmentalConditions] = useState({
    solarIrradiance: '',
    temperature: ''
  });
  const [batteryStorage, setBatteryStorage] = useState({
    capacity: '',
    depthOfDischarge: '',
    chargeRate: '',
    dischargeRate: ''
  });
  const [systemLosses, setSystemLosses] = useState({
    inverterEfficiency: '',
    wiringLosses: '',
    otherLosses: ''
  });
  const [appliances, setAppliances] = useState([{ power: '', type: '', usage: '' }]);

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const checkUserAuthentication = async () => {
      const token = localStorage.getItem("token");
      if (!user && token) {
        try {
          const response = await axios.get('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch (error) {
          console.error("User authentication check failed:", error);
          navigate('/login');
        }
      } else if (!user) {
        navigate('/login');
      }
    };

    checkUserAuthentication();

    // Get user's geolocation
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          fetchWeatherData(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Error Code = " + error.code + " - " + error.message);
        }
      );
    }
  }, [user, navigate]);

  const fetchWeatherData = async (lat, lon) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/api/weather?lat=${lat}&lon=${lon}`);
      setEnvironmentalConditions(response.data);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      alert("Failed to fetch weather data. Please check your internet connection or try again later.");
      setEnvironmentalConditions({ solarIrradiance: '', temperature: '' });
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 4) {
      setStep(step + 1);
    } else {
      const configData = {
        location,
        solarSpecs,
        environmentalConditions,
        appliances,
        systemLosses,
        batteryStorage
      };

      try {
        const response = await axios.post("http://localhost:5000/api/configuration", configData, {
          headers: {
            "Content-Type": "application/json"
          }
        });

        if (response.status === 200) {
          console.log("Configuration saved successfully");
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error saving configuration:", error);
        alert("Failed to save configuration. Please try again.");
      }
    }
  };

  const addAppliance = () => {
    setAppliances([...appliances, { power: '', type: '', usage: '' }]);
  };

  const updateAppliance = (index, field, value) => {
    const newAppliances = [...appliances];
    newAppliances[index][field] = value;
    setAppliances(newAppliances);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Location and Environmental Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="0.000001"
                    value={location.latitude}
                    onChange={(e) => setLocation({ ...location, latitude: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="0.000001"
                    value={location.longitude}
                    onChange={(e) => setLocation({ ...location, longitude: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="mt-4">
                <h4 className="text-md font-medium mb-2">Environmental Conditions</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="solarIrradiance">Solar Irradiance (W/m²)</Label>
                    <Input
                      id="solarIrradiance"
                      type="number"
                      value={environmentalConditions.solarIrradiance}
                      readOnly
                    />
                  </div>
                  <div>
                    <Label htmlFor="temperature">Average Temperature (°C)</Label>
                    <Input
                      id="temperature"
                      type="number"
                      value={environmentalConditions.temperature}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Solar System Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="capacity">System Capacity (kW)</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={solarSpecs.capacity}
                    onChange={(e) => setSolarSpecs({ ...solarSpecs, capacity: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="panelType">Panel Type</Label>
                  <select
                    id="panelType"
                    value={solarSpecs.panelType}
                    onChange={(e) => setSolarSpecs({ ...solarSpecs, panelType: e.target.value })}
                    required
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="">Select panel type</option>
                    <option value="monocrystalline">Monocrystalline</option>
                    <option value="polycrystalline">Polycrystalline</option>
                    <option value="thinFilm">Thin Film</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="numberOfPanels">Number of Panels</Label>
                  <Input
                    id="numberOfPanels"
                    type="number"
                    value={solarSpecs.numberOfPanels}
                    onChange={(e) => setSolarSpecs({ ...solarSpecs, numberOfPanels: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tiltAngle">Tilt Angle (degrees)</Label>
                  <Input
                    id="tiltAngle"
                    type="number"
                    value={solarSpecs.tiltAngle}
                    onChange={(e) => setSolarSpecs({ ...solarSpecs, tiltAngle: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="orientation">Orientation</Label>
                  <select
                    id="orientation"
                    value={solarSpecs.orientation}
                    onChange={(e) => setSolarSpecs({ ...solarSpecs, orientation: e.target.value })}
                    required
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="">Select orientation</option>
                    <option value="north">North</option>
                    <option value="south">South</option>
                    <option value="east">East</option>
                    <option value="west">West</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="efficiencyRating">Efficiency Rating (%)</Label>
                  <Input
                    id="efficiencyRating"
                    type="number"
                    value={solarSpecs.efficiencyRating}
                    onChange={(e) => setSolarSpecs({ ...solarSpecs, efficiencyRating: e.target.value })}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Appliance Configurations</CardTitle>
            </CardHeader>
            <CardContent>
              {appliances.map((appliance, index) => (
                <div key={index} className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <Label htmlFor={`applianceType-${index}`}>Appliance Type</Label>
                    <Input
                      id={`applianceType-${index}`}
                      value={appliance.type}
                      onChange={(e) => updateAppliance(index, 'type', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`appliancePower-${index}`}>Power (Watts)</Label>
                    <Input
                      id={`appliancePower-${index}`}
                      type="number"
                      value={appliance.power}
                      onChange={(e) => updateAppliance(index, 'power', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`applianceUsage-${index}`}>Daily Usage (Hours)</Label>
                    <Input
                      id={`applianceUsage-${index}`}
                      type="number"
                      value={appliance.usage}
                      onChange={(e) => updateAppliance(index, 'usage', e.target.value)}
                      required
                    />
                  </div>
                </div>
              ))}
              <Button onClick={addAppliance} className="mt-4">Add Appliance</Button>
            </CardContent>
          </Card>
        );
      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle>System Losses and Battery Storage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="inverterEfficiency">Inverter Efficiency (%)</Label>
                  <Input
                    id="inverterEfficiency"
                    type="number"
                    value={systemLosses.inverterEfficiency}
                    onChange={(e) => setSystemLosses({ ...systemLosses, inverterEfficiency: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="wiringLosses">Wiring Losses (%)</Label>
                  <Input
                    id="wiringLosses"
                    type="number"
                    value={systemLosses.wiringLosses}
                    onChange={(e) => setSystemLosses({ ...systemLosses, wiringLosses: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="otherLosses">Other Losses (%)</Label>
                  <Input
                    id="otherLosses"
                    type="number"
                    value={systemLosses.otherLosses}
                    onChange={(e) => setSystemLosses({ ...systemLosses, otherLosses: e.target.value })}
                    required
                  />
                </div>
              </div>
              <h4 className="text-md font-medium mt-6 mb-2">Battery Storage</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="batteryCapacity">Battery Capacity (kWh)</Label>
                  <Input
                    id="batteryCapacity"
                    type="number"
                    value={batteryStorage.capacity}
                    onChange={(e) => setBatteryStorage({ ...batteryStorage, capacity: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="depthOfDischarge">Depth of Discharge (%)</Label>
                  <Input
                    id="depthOfDischarge"
                    type="number"
                    value={batteryStorage.depthOfDischarge}
                    onChange={(e) => setBatteryStorage({ ...batteryStorage, depthOfDischarge: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="chargeRate">Charge Rate (kW)</Label>
                  <Input
                    id="chargeRate"
                    type="number"
                    value={batteryStorage.chargeRate}
                    onChange={(e) => setBatteryStorage({ ...batteryStorage, chargeRate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dischargeRate">Discharge Rate (kW)</Label>
                  <Input
                    id="dischargeRate"
                    type="number"
                    value={batteryStorage.dischargeRate}
                    onChange={(e) => setBatteryStorage({ ...batteryStorage, dischargeRate: e.target.value })}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-2xl w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center">
          {step === 1 && <FaHome className="mx-auto h-12 w-12 text-teal-600" />}
          {step === 2 && <FaSolarPanel className="mx-auto h-12 w-12 text-teal-600" />}
          {step === 3 && <FaBolt className="mx-auto h-12 w-12 text-teal-600" />}
          {step === 4 && <FaBatteryFull className="mx-auto h-12 w-12 text-teal-600" />}
          <h2 className="mt-6 text-3xl font-bold text-teal-600">System Configuration</h2>
          <p className="mt-2 text-sm text-gray-600">Step {step} of 4</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {renderStep()}
          <div className="flex justify-between">
            {step > 1 && (
              <Button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-teal-700 bg-teal-100 hover:bg-teal-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                Previous
              </Button>
            )}
            <Button
              type="submit"
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              {step === 4 ? 'Submit' : 'Next'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Configuration;