"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../components/ui/Card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/Tabs";
import { useAuth } from "../contexts/AuthContext";
import api from "../config/axios";
import { FaExclamationTriangle, FaUser, FaSolarPanel } from "react-icons/fa";

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [profileSettings, setProfileSettings] = useState({
    full_name: "",
    email: "",
    phone: "",
    location: "",
  });

  const [systemSettings, setSystemSettings] = useState({
    solar_capacity: 0,
    panel_efficiency: 0.85,
    battery_capacity: 0,
    battery_efficiency: 0.9,
    grid_connection: true,
    latitude: 0,
    longitude: 0,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    energy_alerts: true,
    price_alerts: true,
    system_updates: true,
  });

  useEffect(() => {
    if (user) {
      setProfileSettings({
        full_name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        location: user.location || "",
      });

      setSystemSettings({
        solar_capacity: user.solar_capacity || 0,
        panel_efficiency: user.panel_efficiency || 0.85,
        battery_capacity: user.battery_capacity || 0,
        battery_efficiency: user.battery_efficiency || 0.9,
        grid_connection: user.grid_connection !== undefined ? user.grid_connection : true,
        latitude: user.latitude || 0,
        longitude: user.longitude || 0,
      });

      fetchNotificationSettings();
    }
  }, [user]);

  const fetchNotificationSettings = async () => {
    try {
      const response = await api.get("/household/configuration");
      setNotificationSettings({
        email_notifications: response.data.email_notifications ?? true,
        energy_alerts: response.data.energy_alerts ?? true,
        price_alerts: response.data.price_alerts ?? true,
        system_updates: response.data.system_updates ?? true,
      });
    } catch (err) {
      console.error("Error fetching notification settings:", err);
      setNotificationSettings({
        email_notifications: true,
        energy_alerts: true,
        price_alerts: true,
        system_updates: true,
      });
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.put("/auth/update-profile", profileSettings);
      updateUser(response.data);
      setSuccess("Profile updated successfully");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.msg || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSystemUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.put("/household/configuration", systemSettings);
      updateUser(response.data.user);
      setSuccess("System settings updated successfully");
    } catch (err) {
      console.error("Error updating system settings:", err);
      setError(err.response?.data?.msg || "Failed to update system settings");
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await api.post("/household/configuration", {
        ...systemSettings,
        email_notifications: notificationSettings.email_notifications,
        energy_alerts: notificationSettings.energy_alerts,
        price_alerts: notificationSettings.price_alerts,
        system_updates: notificationSettings.system_updates,
      });
      setSuccess("Notification settings updated successfully");
    } catch (err) {
      console.error("Error updating notification settings:", err);
      setError(err.response?.data?.msg || "Failed to update notification settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-green-800">Settings</h1>

      {error && (
        <Card className="bg-red-50 mb-6 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center text-red-600">
              <FaExclamationTriangle className="mr-2" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="bg-green-50 mb-6 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center text-green-600">
              <p>{success}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="system">System Configuration</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FaUser className="mr-2 text-green-600" />
                Profile Settings
              </CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                {["full_name", "email", "phone", "location"].map((field) => (
                  <div className="space-y-2" key={field}>
                    <Label htmlFor={field}>{field.replace("_", " ").toUpperCase()}</Label>
                    <Input
                      id={field}
                      value={profileSettings[field]}
                      onChange={(e) => setProfileSettings({ ...profileSettings, [field]: e.target.value })}
                      placeholder={`Enter your ${field.replace("_", " ")}`}
                      className="rounded-md border-gray-300 focus:ring focus:ring-green-500"
                    />
                  </div>
                ))}
                <Button type="submit" disabled={loading} className="bg-green-600 text-white rounded-md hover:bg-green-700">
                  {loading ? "Updating..." : "Update Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FaSolarPanel className="mr-2 text-green-600" />
                System Configuration
              </CardTitle>
              <CardDescription>Update your energy system settings</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSystemUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Solar Capacity (kW)", field: "solar_capacity", type: "number" },
                    { label: "Panel Efficiency (0-1)", field: "panel_efficiency", type: "number", step: "0.01", min: 0, max: 1 },
                    { label: "Battery Capacity (kWh)", field: "battery_capacity", type: "number" },
                    { label: "Battery Efficiency (0-1)", field: "battery_efficiency", type: "number", step: "0.01", min: 0, max: 1 },
                    { label: "Latitude", field: "latitude", type: "number" },
                    { label: "Longitude", field: "longitude", type: "number" },
                  ].map(({ label, field, ...inputProps }) => (
                    <div className="space-y-2" key={field}>
                      <Label htmlFor={field}>{label}</Label>
                      <Input
                        id={field}
                        {...inputProps}
                        value={systemSettings[field]}
                        onChange={(e) => setSystemSettings({ ...systemSettings, [field]: Number.parseFloat(e.target.value) })}
                        placeholder={`Enter ${label.toLowerCase()}`}
                        className="rounded-md border-gray-300 focus:ring focus:ring-green-500"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="grid_connection"
                    checked={systemSettings.grid_connection}
                    onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, grid_connection: checked })}
                    className="rounded-full"
                  />
                  <Label htmlFor="grid_connection">Grid Connection</Label>
                </div>

                <Button type="submit" disabled={loading} className="bg-green-600 text-white rounded-md hover:bg-green-700">
                  {loading ? "Updating..." : "Update System Configuration"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleNotificationUpdate} className="space-y-4">
                {[
                  { label: "Email Notifications", field: "email_notifications" },
                  { label: "Energy Alerts", field: "energy_alerts" },
                  { label: "Price Alerts", field: "price_alerts" },
                  { label: "System Updates", field: "system_updates" },
                ].map(({ label, field }) => (
                  <div className="flex items-center space-x-2" key={field}>
                    <Switch
                      id={field}
                      checked={notificationSettings[field]}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, [field]: checked })
                      }
                      className="rounded-full"
                    />
                    <Label htmlFor={field}>{label}</Label>
                  </div>
                ))}
                <Button type="submit" disabled={loading} className="bg-green-600 text-white rounded-md hover:bg-green-700">
                  {loading ? "Updating..." : "Update Notification Settings"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;