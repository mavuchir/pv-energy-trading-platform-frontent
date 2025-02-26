import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const data = [
  { name: 'Jan', generation: 4000, consumption: 2400 },
  { name: 'Feb', generation: 3000, consumption: 1398 },
  { name: 'Mar', generation: 2000, consumption: 9800 },
  { name: 'Apr', generation: 2780, consumption: 3908 },
  { name: 'May', generation: 1890, consumption: 4800 },
  { name: 'Jun', generation: 2390, consumption: 3800 },
]

const EnergyAnalytics = () => {
  return (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="generation" stroke="#8884d8" />
          <Line type="monotone" dataKey="consumption" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default EnergyAnalytics