"use client"
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card"

const MarketOverview = () => {
  // This would typically come from an API or real-time data source
  const marketData = [
    { id: 1, type: "Buy", amount: 100, price: 0.15 },
    { id: 2, type: "Sell", amount: 50, price: 0.18 },
    { id: 3, type: "Buy", amount: 75, price: 0.14 },
    { id: 4, type: "Sell", amount: 120, price: 0.17 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Amount (kWh)</th>
                <th className="px-4 py-2 text-left">Price ($/kWh)</th>
              </tr>
            </thead>
            <tbody>
              {marketData.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="px-4 py-2">{item.type}</td>
                  <td className="px-4 py-2">{item.amount}</td>
                  <td className="px-4 py-2">${item.price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

export default MarketOverview

