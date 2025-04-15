"use client"

import { useState, useEffect } from "react"
import { FaLightbulb, FaCheck, FaTimes } from "react-icons/fa"
import api from "../../services/api" // Assuming your axios instance is in "@/api/index.js" or a similar path

const RecommendationWidget = () => {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dismissedIds, setDismissedIds] = useState([])

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true)
        const response = await api.get("/ml/recommendations") // Use the api instance
        setRecommendations(response.data.recommendations)
        setError(null)
      } catch (err) {
        console.error("Error fetching recommendations:", err)
        setError("Failed to fetch recommendations")

        // Optionally, remove the mock data fallback if you want to strictly rely on the API
        // setRecommendations([
        //   {
        //     id: 1,
        //     type: "energy_saving",
        //     title: "Reduce AC Usage",
        //     description: "Reducing AC temperature by 2°C can save up to 10% energy.",
        //     potential_saving: 1.2,
        //     priority: "high",
        //   },
        //   {
        //     id: 2,
        //     type: "trading",
        //     title: "Sell Excess Energy",
        //     description: "Current market prices are high. Consider selling your excess energy.",
        //     potential_profit: 2.5,
        //     priority: "medium",
        //   },
        //   {
        //     id: 3,
        //     type: "maintenance",
        //     title: "Clean Solar Panels",
        //     description: "Your solar panels may need cleaning to improve efficiency.",
        //     potential_improvement: 15,
        //     priority: "low",
        //   },
        // ])
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()

    // Refresh recommendations every hour
    const interval = setInterval(fetchRecommendations, 60 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  const dismissRecommendation = (id) => {
    setDismissedIds((prev) => [...prev, id])
  }

  const applyRecommendation = async (id) => {
    try {
      await api.post(`/ml/recommendations/${id}/apply`) // Use the api instance
      // Remove from list after applying
      dismissRecommendation(id)
    } catch (err) {
      console.error("Error applying recommendation:", err)
      // Still dismiss it from UI even if API call fails
      dismissRecommendation(id)
    }
  }

  const filteredRecommendations = recommendations.filter((rec) => !dismissedIds.includes(rec.id))

  if (loading && recommendations.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 h-full flex items-center justify-center">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-200 h-12 w-12"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error && recommendations.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 h-full">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Smart Recommendations</h2>
      </div>

      <div className="p-4">
        {filteredRecommendations.length > 0 ? (
          <div className="space-y-3">
            {filteredRecommendations.map((recommendation) => (
              <div
                key={recommendation.id}
                className={`border rounded-lg p-3 ${
                  recommendation.priority === "high"
                    ? "border-red-200 bg-red-50"
                    : recommendation.priority === "medium"
                      ? "border-yellow-200 bg-yellow-50"
                      : "border-blue-200 bg-blue-50"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start">
                    <div
                      className={`p-2 rounded-full mr-3 ${
                        recommendation.priority === "high"
                          ? "bg-red-100"
                          : recommendation.priority === "medium"
                            ? "bg-yellow-100"
                            : "bg-blue-100"
                      }`}
                    >
                      <FaLightbulb
                        className={`${
                          recommendation.priority === "high"
                            ? "text-red-600"
                            : recommendation.priority === "medium"
                              ? "text-yellow-600"
                              : "text-blue-600"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="font-medium">{recommendation.title}</p>
                      <p className="text-sm text-gray-600">{recommendation.description}</p>

                      {recommendation.potential_saving && (
                        <p className="text-sm font-medium text-green-600 mt-1">
                          Potential Saving: {recommendation.potential_saving} kWh
                        </p>
                      )}

                      {recommendation.potential_profit && (
                        <p className="text-sm font-medium text-green-600 mt-1">
                          Potential Profit: ${recommendation.potential_profit.toFixed(2)}
                        </p>
                      )}

                      {recommendation.potential_improvement && (
                        <p className="text-sm font-medium text-blue-600 mt-1">
                          Potential Improvement: {recommendation.potential_improvement}%
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-1">
                    <button
                      onClick={() => applyRecommendation(recommendation.id)}
                      className="p-1.5 rounded-full bg-green-100 text-green-600 hover:bg-green-200"
                      title="Apply"
                    >
                      <FaCheck />
                    </button>
                    <button
                      onClick={() => dismissRecommendation(recommendation.id)}
                      className="p-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                      title="Dismiss"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <FaLightbulb className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-gray-500">No recommendations at this time</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default RecommendationWidget