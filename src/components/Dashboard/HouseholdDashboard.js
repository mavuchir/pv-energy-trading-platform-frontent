import React, { useState, useEffect } from 'react';
import { energyService } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const HouseholdDashboard = () => {
    const [overview, setOverview] = useState(null);
    const [realTimeData, setRealTimeData] = useState(null);
    const [simulationData, setSimulationData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [overviewRes, realTimeRes, simulationRes] = await Promise.all([
                    energyService.getOverview(),
                    energyService.getRealTimeData(),
                    energyService.getSimulationData()
                ]);
                
                setOverview(overviewRes.data);
                setRealTimeData(realTimeRes.data);
                setSimulationData(simulationRes.data);
                setError(null);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 60000); // Update every minute

        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4">
                <Card className="bg-red-50">
                    <CardContent>
                        <p className="text-red-600">{error}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const energyBalance = overview ? overview.dailyGeneration - overview.dailyConsumption : 0;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Household Dashboard</h1>
            
            {/* Current Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Current Generation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{realTimeData?.current.generation.toFixed(2)} kW</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Current Consumption</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{realTimeData?.current.consumption.toFixed(2)} kW</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Battery Level</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{realTimeData?.current.batteryLevel.toFixed(2)}%</p>
                    </CardContent>
                </Card>
            </div>

            {/* Daily Overview */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Daily Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <p className="font-semibold">Total Generation</p>
                            <p className="text-xl">{overview?.dailyGeneration.toFixed(2)} kWh</p>
                        </div>
                        <div>
                            <p className="font-semibold">Total Consumption</p>
                            <p className="text-xl">{overview?.dailyConsumption.toFixed(2)} kWh</p>
                        </div>
                        <div>
                            <p className="font-semibold">Energy Balance</p>
                            <p className={`text-xl ${energyBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {energyBalance.toFixed(2)} kWh
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Simulation Chart */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>24-Hour Simulation</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={simulationData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="generation" stroke="#8884d8" name="Generation" />
                            <Line type="monotone" dataKey="consumption" stroke="#82ca9d" name="Consumption" />
                            <Line type="monotone" dataKey="batterylevel" stroke="#ffc658" name="Battery Level" />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Energy Trading Insights */}
            <Card>
                <CardHeader>
                    <CardTitle>Energy Trading Insights</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="mb-4">Based on your current energy balance:</p>
                    {energyBalance >= 0 ? (
                        <p className="text-green-600 mb-4">
                            You have excess energy. Consider selling to the grid or neighbors for profit.
                        </p>
                    ) : (
                        <p className="text-red-600 mb-4">
                            You have an energy deficit. Consider purchasing from the grid or optimizing consumption.
                        </p>
                    )}
                    <Button>View Trading Options</Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default HouseholdDashboard;