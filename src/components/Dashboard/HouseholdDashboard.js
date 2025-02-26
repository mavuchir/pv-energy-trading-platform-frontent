"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";

const HouseholdDashboard = () => {
  const { user } = useAuth();
  const [energyData, setEnergyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEnergyData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found.");
        setError("Unauthorized access. Please log in.");
        setLoading(false);
        return;
      }

      console.log("JWT Token:", token); // Debugging purpose

      try {
        const response = await fetch("http://127.0.0.1:5000/api/energy-overview", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Response status:", response.status); // Debugging

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error fetching energy data:", errorText);
          throw new Error(errorText || "Failed to fetch data.");
        }

        const data = await response.json();
        console.log("Fetched energy data:", data);
        setEnergyData(data);
      } catch (error) {
        console.error("Fetch error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEnergyData();
  }, []);

  // Loading state
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Error state
  if (error) {
    return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;
  }

  // No data state
  if (!energyData) {
    return <div className="flex items-center justify-center h-screen">No data available.</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Welcome, {user?.name || "Guest"}!</h1>

      {/* Energy Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Energy Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{energyData?.balance?.toFixed(3) ?? "N/A"} kWh</div>
            <p className="text-xs text-muted-foreground">Current Balance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Energy Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{energyData?.generation?.toFixed(3) ?? "N/A"} kWh</div>
            <p className="text-xs text-muted-foreground">Total Generation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Energy Consumed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{energyData?.consumption?.toFixed(3) ?? "N/A"} kWh</div>
            <p className="text-xs text-muted-foreground">Total Consumption</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trading Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{energyData?.trading?.toFixed(3) ?? "N/A"} kWh</div>
            <p className="text-xs text-muted-foreground">Current Trading</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HouseholdDashboard;
