"use client";

import React, { useState, useEffect } from "react";
import {
  FaPlug,
  FaSync,
  FaExclamationTriangle,
  FaCheckCircle,
  FaPowerOff,
  FaEdit,
  FaTrash,
  FaPlus,
  FaClock,
  FaBolt,
  FaSearch,
} from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import applianceService from "../services/ApplianceService"; // Import the service

const ApplianceControl = () => {
  const [appliances, setAppliances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentAppliance, setCurrentAppliance] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    type: "lighting",
    power_rating: "",
    is_smart: false,
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchAppliances();
  }, []);

  const fetchAppliances = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await applianceService.getAppliances(); // Use the service
      if (response.success) {
        setAppliances(response.appliances);
        setSuccess("Appliances loaded successfully");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.error || "Failed to fetch appliances.");
      }
    } catch (err) {
      console.error("Error fetching appliances:", err);
      setError("Failed to fetch appliances. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleApplianceStatus = async (id, currentStatus) => {
    try {
      // Find the appliance
      const appliance = appliances.find((a) => a.id === id);
      if (!appliance) return;

      const newStatus = currentStatus === "on" ? "off" : "on";

      // Optimistically update UI
      setAppliances(
        appliances.map((a) =>
          a.id === id ? { ...a, status: newStatus } : a
        )
      );

      const response = await applianceService.updateApplianceStatus(
        id,
        newStatus
      ); // Use the service, send "on" or "off"

      if (response.success) {
        setSuccess(
          `${appliance.name} turned ${newStatus} successfully`
        );
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.error || "Failed to toggle appliance.");
        // Revert UI state on error
        setAppliances(
          appliances.map((a) =>
            a.id === id ? { ...a, status: currentStatus } : a
          )
        );
      }
    } catch (err) {
      console.error("Error toggling appliance:", err);
      setError("Failed to toggle appliance. Please try again.");
      // Revert UI state on error
      setAppliances(
        appliances.map((a) =>
          a.id === id ? { ...a, status: currentStatus } : a
        )
      );
    }
  };

  const handleAddAppliance = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await applianceService.createAppliance(formData); // Use the service
      if (response.success) {
        setAppliances([...appliances, response.appliance]);
        setSuccess("Appliance added successfully");
        setTimeout(() => setSuccess(null), 3000);
        setShowAddModal(false);
        setFormData({
          name: "",
          location: "",
          type: "lighting",
          power_rating: "",
          is_smart: false,
        });
      } else {
        setError(response.error || "Failed to add appliance.");
      }
    } catch (err) {
      console.error("Error adding appliance:", err);
      setError("Failed to add appliance. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditAppliance = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await applianceService.updateAppliance(
        currentAppliance.id,
        formData
      ); // Use the service
      if (response.success) {
        setAppliances(
          appliances.map((a) =>
            a.id === currentAppliance.id ? { ...a, ...formData } : a
          )
        );
        setSuccess("Appliance updated successfully");
        setTimeout(() => setSuccess(null), 3000);
        setShowEditModal(false);
        setCurrentAppliance(null);
      } else {
        setError(response.error || "Failed to update appliance.");
      }
    } catch (err) {
      console.error("Error updating appliance:", err);
      setError("Failed to update appliance. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAppliance = async (id) => {
    if (!window.confirm("Are you sure you want to delete this appliance?"))
      return;

    try {
      setLoading(true);
      setError(null);

      const response = await applianceService.deleteAppliance(id); // Use the service
      if (response.success) {
        setAppliances(appliances.filter((a) => a.id !== id));
        setSuccess("Appliance deleted successfully");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.error || "Failed to delete appliance.");
      }
    } catch (err) {
      console.error("Error deleting appliance:", err);
      setError("Failed to delete appliance. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (appliance) => {
    setCurrentAppliance(appliance);
    setFormData({
      name: appliance.name,
      location: appliance.location || "",
      type: appliance.type,
      power_rating: appliance.power_rating.toString(),
      is_smart: appliance.is_smart,
    });
    setShowEditModal(true);
  };

  const getApplianceTypeIcon = (type) => {
    switch (type) {
      case "lighting":
        return "💡";
      case "hvac":
        return "❄️";
      case "appliance":
        return "🔌";
      case "entertainment":
        return "📺";
      case "electronics":
        return "💻";
      case "water_heating":
        return "🚿";
      default:
        return "🔌";
    }
  };

  const calculateEnergyUsage = (appliance) => {
    // Calculate daily energy usage based on power rating and estimated usage hours
    const usageHours =
      appliance.type === "refrigerator"
        ? 24
        : appliance.type === "lighting"
        ? 6
        : appliance.type === "hvac"
        ? 8
        : 4;

    return ((appliance.power_rating / 1000) * usageHours).toFixed(2);
  };

  const filteredAppliances = appliances.filter((appliance) =>
    appliance.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (appliance.location &&
      appliance.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
    appliance.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && appliances.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-orange-600">
              Appliance Control
            </h1>
            <p className="text-gray-600">
              Manage and control your household appliances
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search appliances..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={() => fetchAppliances()}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <FaSync className={loading ? "mr-2 animate-spin" : "mr-2"} />
              Refresh
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700"
            >
              <FaPlus className="mr-2" />
              Add Appliance
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center text-red-600">
              <FaExclamationTriangle className="mr-2" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center text-green-600">
              <FaCheckCircle className="mr-2" />
              <p>{success}</p>
            </div>
          </div>
        )}

        {/* Appliance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-lg p-4 shadow-sm">
            <div className="flex items-start">
              <div className="mr-2 p-2 bg-orange-100 rounded-full">
                <FaPlug className="text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Appliances</p>
                <p className="text-2xl font-bold text-orange-700">
                  {appliances.length}
                </p>
                <p className="text-xs text-gray-600">
                  {appliances.filter((a) => a.is_smart).length} smart devices
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-lg p-4 shadow-sm">
            <div className="flex items-start">
              <div className="mr-2 p-2 bg-green-100 rounded-full">
                <FaPowerOff className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Appliances</p>
                <p className="text-2xl font-bold text-green-700">
                  {appliances.filter((a) => a.status === "on").length}
                </p>
                <p className="text-xs text-gray-600">
                  {(
                    (appliances.filter((a) => a.status === "on").length /
                      appliances.length) *
                    100
                  ).toFixed(0)}
                  % of total
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-100 rounded-lg p-4 shadow-sm">
            <div className="flex items-start">
              <div className="mr-2 p-2 bg-blue-100 rounded-full">
                <FaBolt className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Usage</p>
                <p className="text-2xl font-bold text-blue-700">
                  {appliances
                    .filter((a) => a.status === "on")
                    .reduce((sum, a) => sum + a.power_rating / 1000, 0)
                    .toFixed(2)}{" "}
                  kW
                </p>
                <p className="text-xs text-gray-600">
                  Total capacity:{" "}
                  {appliances
                    .reduce((sum, a) => sum + a.power_rating / 1000, 0)
                    .toFixed(2)}{" "}
                  kW
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-lg p-4 shadow-sm">
            <div className="flex items-start">
              <div className="mr-2 p-2 bg-purple-100 rounded-full">
                <FaClock className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Smart Devices</p>
                <p className="text-2xl font-bold text-purple-700">
                  {appliances.filter((a) => a.is_smart).length}
                </p>
                <p className="text-xs text-gray-600">
                  Automated energy management
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Appliance List */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Your Appliances
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Appliance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Power
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Energy Usage
                  </th>
                  <th className="px-6 py-4 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppliances.length > 0 ? (
                  filteredAppliances.map((appliance) => (
                    <tr key={appliance.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-xl mr-2">
                            {getApplianceTypeIcon(appliance.type)}
                          </span>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {appliance.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {appliance.is_smart
                                ? "Smart Device"
                                : "Standard Device"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {appliance.location || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {appliance.power_rating} W
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {calculateEnergyUsage(appliance)} kWh/day
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            appliance.status === "on"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {appliance.status === "on" ? "On" : "Off"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              toggleApplianceStatus(
                                appliance.id,
                                appliance.status
                              )
                            }
                            className={`p-1 rounded ${
                              appliance.status === "on"
                                ? "text-red-600 hover:bg-red-100"
                                : "text-green-600 hover:bg-green-100"
                            }`}
                            title={
                              appliance.status === "on"
                                ? "Turn Off"
                                : "Turn On"
                            }
                          >
                            <FaPowerOff />
                          </button>
                          <button
                            onClick={() => openEditModal(appliance)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteAppliance(appliance.id)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No appliances found. Add your first appliance to get
                      started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Appliance Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Add New Appliance
              </h3>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Appliance Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g., Living Room Lights"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g., Living Room"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="lighting">Lighting</option>
                    <option value="hvac">HVAC</option>
                    <option value="appliance">Appliance</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="electronics">Electronics</option>
                    <option value="water_heating">Water Heating</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Power Rating (Watts)
                  </label>
                  <input
                    type="number"
                    value={formData.power_rating}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        power_rating: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g., 100"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_smart"
                    checked={formData.is_smart}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_smart: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="is_smart"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Smart Device
                  </label>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end space-x-2">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleEditAppliance}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Appliance"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ApplianceControl
