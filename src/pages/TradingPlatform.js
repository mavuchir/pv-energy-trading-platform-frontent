import { useState, useEffect } from "react"
import TradingPlatformComponent from "../components/TradingPlatform/TradingPlatform"
import { Card, CardContent } from "../components/ui/Card"
import { FaExclamationTriangle } from "react-icons/fa"
import api from "../config/axios"
import { useAuth } from "../contexts/AuthContext"

const TradingPlatform = () => {
  const { user } = useAuth()
  const [marketData, setMarketData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoading(true)
        const response = await api.get("/trade/market-data")
        setMarketData(response.data)
        setError(null)
      } catch (err) {
        console.error("Error fetching market data:", err)
        setError(err.response ? err.response.data.msg : "Failed to fetch market data")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchMarketData()
      const interval = setInterval(fetchMarketData, 60000)
      return () => clearInterval(interval)
    }
  }, [user])

  if (!user) {
    return (
      <div className="p-4">
        <Card className="bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center text-yellow-600">
              <FaExclamationTriangle className="mr-2" />
              <p>Please log in to access the trading platform</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading && !marketData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div>
      {error && (
        <Card className="bg-red-50 m-4">
          <CardContent className="pt-6">
            <div className="flex items-center text-red-600">
              <FaExclamationTriangle className="mr-2" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <TradingPlatformComponent marketData={marketData} />
    </div>
  )
}

export default TradingPlatform