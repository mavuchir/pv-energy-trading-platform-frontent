"use client"

import { useState } from "react"
import { FaMoneyBillWave, FaEdit } from "react-icons/fa"
import AdminService from "../../services/AdminService"

const AdminMarketPriceWidget = ({ currentPrice }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [newPrice, setNewPrice] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleSetPrice = async (e) => {
    e.preventDefault()

    if (!newPrice || isNaN(newPrice) || Number.parseFloat(newPrice) <= 0) {
      setError("Please enter a valid positive price")
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      await AdminService.setMarketPrice(Number.parseFloat(newPrice))

      setSuccess("Market price updated successfully")
      setIsEditing(false)
      setNewPrice("")
    } catch (err) {
      console.error("Error setting market price:", err)
      setError(err.response?.data?.msg || "Failed to update market price")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Market Price</h2>
        <button onClick={() => setIsEditing(!isEditing)} className="text-teal-600 hover:text-teal-800">
          <FaEdit />
        </button>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-center mb-4">
          <div className="p-4 rounded-full bg-yellow-100 mr-4">
            <FaMoneyBillWave className="text-yellow-500 text-2xl" />
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Current Market Price</p>
            <p className="text-3xl font-bold text-gray-800">${currentPrice ? currentPrice.toFixed(4) : "0.0000"}</p>
            <p className="text-xs text-gray-500">per kWh</p>
          </div>
        </div>

        {isEditing && (
          <form onSubmit={handleSetPrice} className="mt-4">
            <div className="mb-4">
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                New Market Price ($ per kWh)
              </label>
              <input
                type="number"
                id="price"
                step="0.0001"
                min="0.0001"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter new price"
                required
              />
            </div>

            {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

            {success && <div className="mb-4 text-sm text-green-600">{success}</div>}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="mr-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                {loading ? "Updating..." : "Update Price"}
              </button>
            </div>
          </form>
        )}

        <div className="mt-4">
          <h3 className="text-md font-medium text-gray-700 mb-2">Price Information</h3>
          <p className="text-sm text-gray-600">
            The market price affects all energy trading transactions in the system. Changes to the market price will be
            logged and visible to all users.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminMarketPriceWidget
