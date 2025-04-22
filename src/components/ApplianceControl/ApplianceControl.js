"use client"

import { useState, useEffect } from "react"
import {
  FaPlug,
  FaToggleOn,
  FaToggleOff,
  FaTrash,
  FaEdit,
  FaPlus,
  FaSync,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCheckCircle,
  FaChartLine,
} from "react-icons/fa"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import applianceService from "../../services/ApplianceService"
import socketService from "../../services/socketService"

const ApplianceControl = () => {
  const [appliances, setAppliances] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedAppliance, setSelectedAppliance] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    type: "refrigerator",
    brand: "",
    model: "",
    power_rating: "",
    energy_efficiency: "A",
    is_smart: false,
    is_controllable: false,
  })
  const [consumptionData, setConsumptionData] = useState({})
  const [selectedApplianceForStats, setSelectedApplianceForStats] = useState(null)

  useEffect(() => {
    fetchAppliances()

    // Connect to WebSocket for real-time updates
    socketService.connect()

    const applianceUpdatedUnsubscribe = socketService.subscribe("appliance_updated", (data) => {
      console.log("Real-time appliance update:", data)
      fetchAppliances()
    })

    return () => {
      applianceUpdatedUnsubscribe()
      socketService.disconnect()
    }
  }, [])

  const fetchAppliances = async () => {
    setLoading(true)
    try {
      const response = await applianceService.getAppliances()
      if (response.success && response.appliances) {
        setAppliances(response.appliances)
        setError(null)
      } else {
        setError(response.error || "Failed to fetch appliances")
      }
    } catch (err) {
      console.error("Error fetching appliances:", err)
      setError("An error occurred while fetching appliances")
    } finally {
      setLoading(false)
    }
  }

  const fetchApplianceConsumption = async (applianceId) => {
    try {
      // Get today and 7 days ago
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 7)

      const response = await applianceService.getApplianceConsumption(applianceId, startDate, endDate)
      if (response.success && response.data) {
        // Process data for chart
        const processedData = processConsumptionData(response.data)
        setConsumptionData({
          ...consumptionData,
          [applianceId]: processedData,
        })
      } else {
        console.error("Failed to fetch appliance consumption:", response.error)
      }
    } catch (err) {
      console.error("Error fetching appliance consumption:", err)
    }
  }

  const processConsumptionData = (data) => {
    // Group by day
    const groupedByDay = {}

    data.forEach((record) => {
      const date = new Date(record.timestamp)
      const dayKey = date.toLocaleDateString()

      if (!groupedByDay[dayKey]) {
        groupedByDay[dayKey] = 0
      }

      groupedByDay[dayKey] += record.amount
    })

    // Convert to chart data format
    return Object.entries(groupedByDay).map(([day, amount]) => ({
      day,
      consumption: Number.parseFloat(amount.toFixed(2)),
    }))
  }

  const toggleApplianceStatus = async (appliance) => {
    try {
      const newStatus = appliance.status === "on" ? "off" : "on"
      const response = await applianceService.updateApplianceStatus(appliance.id, newStatus === "on")

      if (response.success) {
        setSuccess(`${appliance.name} turned ${newStatus}`)

        // Update local state
        setAppliances((prev) => prev.map((app) => (app.id === appliance.id ? { ...app, status: newStatus } : app)))

        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(response.error || `Failed to update ${appliance.name} status`)
        setTimeout(() => setError(null), 3000)
      }
    } catch (err) {
      console.error(`Error toggling appliance status:`, err)
      setError(`An error occurred while toggling ${appliance.name}`)
      setTimeout(() => setError(null), 3000)
    }
  }

  const handleAddAppliance = async () => {
    try {
      const response = await applianceService.createAppliance(formData)
      if (response.success) {
        setAppliances([...appliances, response.appliance])
        setIsAddModalOpen(false)
        setSuccess(`${formData.name} added successfully`)
        resetForm()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(response.error || "Failed to add appliance")
        setTimeout(() => setError(null), 3000)
      }
    } catch (err) {
      console.error("Error adding appliance:", err)
      setError("An error occurred while adding the appliance")
      setTimeout(() => setError(null), 3000)
    }
  }

  const handleEditAppliance = async () => {
    try {
      const response = await applianceService.updateAppliance(selectedAppliance.id, formData)
      if (response.success) {
        setAppliances(appliances.map((app) => (app.id === selectedAppliance.id ? response.appliance : app)))
        setIsEditModalOpen(false)
        setSuccess(`${formData.name} updated successfully`)
        resetForm()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(response.error || "Failed to update appliance")
        setTimeout(() => setError(null), 3000)
      }
    } catch (err) {
      console.error("Error updating appliance:", err)
      setError("An error occurred while updating the appliance")
      setTimeout(() => setError(null), 3000)
    }
  }

  const handleDeleteAppliance = async (appliance) => {
    if (window.confirm(`Are you sure you want to delete ${appliance.name}?`)) {
      try {
        const response = await applianceService.deleteAppliance(appliance.id)
        if (response.success) {
          setAppliances(appliances.filter((app) => app.id !== appliance.id))
          setSuccess(`${appliance.name} deleted successfully`)
          setTimeout(() => setSuccess(null), 3000)
        } else {
          setError(response.error || "Failed to delete appliance")
          setTimeout(() => setError(null), 3000)
        }
      } catch (err) {
        console.error("Error deleting appliance:", err)
        setError("An error occurred while deleting the appliance")
        setTimeout(() => setError(null), 3000)
      }
    }
  }

  const openEditModal = (appliance) => {
    setSelectedAppliance(appliance)
    setFormData({
      name: appliance.name,
      type: appliance.type,
      brand: appliance.brand || "",
      model: appliance.model || "",
      power_rating: appliance.power_rating || "",
      energy_efficiency: appliance.energy_efficiency || "A",
      is_smart: appliance.is_smart || false,
      is_controllable: appliance.is_controllable || false,
    })
    setIsEditModalOpen(true)
  }

  const handleViewStats = (appliance) => {
    setSelectedApplianceForStats(appliance)
    fetchApplianceConsumption(appliance.id)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      type: "refrigerator",
      brand: "",
      model: "",
      power_rating: "",
      energy_efficiency: "A",
      is_smart: false,
      is_controllable: false,
    })
  }

  const appliance_types = [
    { value: "refrigerator", label: "Refrigerator" },
    { value: "washing_machine", label: "Washing Machine" },
    { value: "dishwasher", label: "Dishwasher" },
    { value: "air_conditioner", label: "Air Conditioner" },
    { value: "heater", label: "Heater" },
    { value: "water_heater", label: "Water Heater" },
    { value: "oven", label: "Oven" },
    { value: "microwave", label: "Microwave" },
    { value: "tv", label: "TV" },
    { value: "computer", label: "Computer" },
    { value: "lighting", label: "Lighting" },
    { value: "ev_charger", label: "EV Charger" },
    { value: "other", label: "Other" },
  ]

  const efficiency_ratings = ["A+++", "A++", "A+", "A", "B", "C", "D", "E", "F", "G"]

  if (loading && appliances.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  const getApplianceTypeLabel = (type) => {
    const applianceType = appliance_types.find((t) => t.value === type)
    return applianceType ? applianceType.label : type
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-orange-600">Appliance Control</h1>
          <p className="text-gray-600">Manage and monitor your appliances</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => fetchAppliances()}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md flex items-center"
          >
            <FaSync className={loading ? "mr-2 animate-spin" : "mr-2"} />
            Refresh
          </button>
          <button
            onClick={() => {
              resetForm()
              setIsAddModalOpen(true)
            }}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md flex items-center"
          >
            <FaPlus className="mr-2" />
            Add Appliance
          </button>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 p-4 rounded-md border border-green-200 mb-6">
          <div className="flex items-center text-green-600">
            <FaCheckCircle className="mr-2" />
            <p>{success}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 p-4 rounded-md border border-red-200 mb-6">
          <div className="flex items-center text-red-600">
            <FaExclamationTriangle className="mr-2" />
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Appliance Statistics */}
      {selectedApplianceForStats && consumptionData[selectedApplianceForStats.id] && (
        <div className="bg-white rounded-lg shadow-md mb-6 p-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                {selectedApplianceForStats.name} - Energy Consumption
              </h2>
              <p className="text-sm text-gray-600">Last 7 days</p>
            </div>
            <button onClick={() => setSelectedApplianceForStats(null)} className="text-gray-500 hover:text-gray-700">
              Close
            </button>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consumptionData[selectedApplianceForStats.id]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" />
                <YAxis unit=" kWh" />
                <Tooltip formatter={(value) => [`${value} kWh`, "Consumption"]} />
                <Legend />
                <Bar dataKey="consumption" fill="#F97316" name="Energy Consumption" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Appliances Grid */}
      {appliances.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {appliances.map((appliance) => (
            <div key={appliance.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-full mr-3">
                    <FaPlug className="text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{appliance.name}</h3>
                    <p className="text-sm text-gray-600">{getApplianceTypeLabel(appliance.type)}</p>
                  </div>
                </div>
                <div>
                  {appliance.status === "on" ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Inactive
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {appliance.brand && (
                    <div>
                      <p className="text-xs text-gray-500">Brand</p>
                      <p className="text-sm">{appliance.brand}</p>
                    </div>
                  )}
                  {appliance.model && (
                    <div>
                      <p className="text-xs text-gray-500">Model</p>
                      <p className="text-sm">{appliance.model}</p>
                    </div>
                  )}
                  {appliance.power_rating && (
                    <div>
                      <p className="text-xs text-gray-500">Power</p>
                      <p className="text-sm">{appliance.power_rating} W</p>
                    </div>
                  )}
                  {appliance.energy_efficiency && (
                    <div>
                      <p className="text-xs text-gray-500">Efficiency</p>
                      <p className="text-sm">{appliance.energy_efficiency}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => toggleApplianceStatus(appliance)}
                    className={`flex items-center justify-center px-4 py-2 rounded-md ${
                      appliance.status === "on"
                        ? "bg-red-100 text-red-700 hover:bg-red-200"
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                    }`}
                  >
                    {appliance.status === "on" ? (
                      <>
                        <FaToggleOff className="mr-2" />
                        Turn Off
                      </>
                    ) : (
                      <>
                        <FaToggleOn className="mr-2" />
                        Turn On
                      </>
                    )}
                  </button>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewStats(appliance)}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                    >
                      <FaChartLine className="mr-2" />
                      Stats
                    </button>
                    <button
                      onClick={() => openEditModal(appliance)}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      <FaEdit className="mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAppliance(appliance)}
                      className="flex items-center justify-center px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 text-center">
          <FaInfoCircle className="mx-auto mb-2 text-blue-600" size={24} />
          <h3 className="font-semibold text-lg text-blue-800">No Appliances Found</h3>
          <p className="text-blue-700 mb-4">You don't have any appliances set up yet.</p>
          <button
            onClick={() => {
              resetForm()
              setIsAddModalOpen(true)
            }}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md inline-flex items-center"
          >
            <FaPlus className="mr-2" />
            Add Your First Appliance
          </button>
        </div>
      )}

      {/* Add Appliance Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Appliance</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Kitchen Refrigerator"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  {appliance_types.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Power Rating (W)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.power_rating}
                    onChange={(e) => setFormData({ ...formData, power_rating: e.target.value })}
                    placeholder="e.g. 1500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Energy Efficiency</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.energy_efficiency}
                    onChange={(e) => setFormData({ ...formData, energy_efficiency: e.target.value })}
                  >
                    {efficiency_ratings.map((rating) => (
                      <option key={rating} value={rating}>
                        {rating}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_smart"
                    className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    checked={formData.is_smart}
                    onChange={(e) => setFormData({ ...formData, is_smart: e.target.checked })}
                  />
                  <label htmlFor="is_smart" className="ml-2 block text-sm text-gray-700">
                    Smart Device
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_controllable"
                    className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    checked={formData.is_controllable}
                    onChange={(e) => setFormData({ ...formData, is_controllable: e.target.checked })}
                  />
                  <label htmlFor="is_controllable" className="ml-2 block text-sm text-gray-700">
                    Remotely Controllable
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAppliance}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
              >
                Add Appliance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Appliance Modal */}
      {isEditModalOpen && selectedAppliance && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Edit {selectedAppliance.name}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  {appliance_types.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Power Rating (W)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.power_rating}
                    onChange={(e) => setFormData({ ...formData, power_rating: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Energy Efficiency</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.energy_efficiency}
                    onChange={(e) => setFormData({ ...formData, energy_efficiency: e.target.value })}
                  >
                    {efficiency_ratings.map((rating) => (
                      <option key={rating} value={rating}>
                        {rating}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="edit_is_smart"
                    className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    checked={formData.is_smart}
                    onChange={(e) => setFormData({ ...formData, is_smart: e.target.checked })}
                  />
                  <label htmlFor="edit_is_smart" className="ml-2 block text-sm text-gray-700">
                    Smart Device
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="edit_is_controllable"
                    className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    checked={formData.is_controllable}
                    onChange={(e) => setFormData({ ...formData, is_controllable: e.target.checked })}
                  />
                  <label htmlFor="edit_is_controllable" className="ml-2 block text-sm text-gray-700">
                    Remotely Controllable
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEditAppliance}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
              >
                Update Appliance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ApplianceControl
