"use client"
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts"

export const ChartContainer = ({ children, className }) => {
  return (
    <div className={`w-full h-full min-h-[180px] ${className || ""}`}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  )
}

export const ChartTooltip = ({ active, payload, label, formatter }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-md shadow-sm p-2 text-sm">
        <p className="font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color }}>
            {entry.name}: {formatter ? formatter(entry.value) : entry.value}
          </p>
        ))}
      </div>
    )
  }

  return null
}

export const LineChart = ({
  data,
  index,
  categories,
  colors,
  valueFormatter,
  showLegend = true,
  showXAxis = true,
  showYAxis = true,
  yAxisWidth = 40,
}) => {
  return (
    <RechartsLineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
      {showXAxis && <XAxis dataKey={index} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />}
      {showYAxis && (
        <YAxis
          width={yAxisWidth}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={valueFormatter}
        />
      )}
      <Tooltip content={<ChartTooltip formatter={valueFormatter} />} />
      {showLegend && <Legend />}
      {categories.map((category, i) => (
        <Line
          key={category}
          type="monotone"
          dataKey={category}
          stroke={colors[i % colors.length]}
          strokeWidth={2}
          dot={{ r: 0 }}
          activeDot={{ r: 6 }}
        />
      ))}
    </RechartsLineChart>
  )
}

export const BarChart = ({
  data,
  index,
  categories,
  colors,
  valueFormatter,
  showLegend = true,
  showXAxis = true,
  showYAxis = true,
  yAxisWidth = 40,
  layout = "vertical",
  stack = false,
}) => {
  return (
    <RechartsBarChart data={data} layout={layout} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
      {showXAxis && (
        <XAxis
          dataKey={layout === "vertical" ? null : index}
          type={layout === "vertical" ? "number" : "category"}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={layout === "vertical" ? valueFormatter : null}
        />
      )}
      {showYAxis && (
        <YAxis
          width={yAxisWidth}
          dataKey={layout === "vertical" ? index : null}
          type={layout === "vertical" ? "category" : "number"}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={layout === "vertical" ? null : valueFormatter}
        />
      )}
      <Tooltip content={<ChartTooltip formatter={valueFormatter} />} />
      {showLegend && <Legend />}
      {categories.map((category, i) => (
        <Bar key={category} dataKey={category} fill={colors[i % colors.length]} stackId={stack ? "stack" : null} />
      ))}
    </RechartsBarChart>
  )
}

export const PieChart = ({ data, index, categories, colors, valueFormatter, showLegend = true }) => {
  return (
    <RechartsPieChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
      <Tooltip content={<ChartTooltip formatter={valueFormatter} />} />
      {showLegend && <Legend />}
      <Pie
        data={data}
        nameKey={index}
        dataKey={categories[0]}
        cx="50%"
        cy="50%"
        outerRadius="80%"
        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
      >
        {data.map((entry, i) => (
          <Cell key={`cell-${i}`} fill={colors[i % colors.length]} />
        ))}
      </Pie>
    </RechartsPieChart>
  )
}

