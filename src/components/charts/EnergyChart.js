"use client"

import { useEffect, useRef } from "react"
import Chart from "chart.js/auto"

const EnergyChart = ({ data, period }) => {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  useEffect(() => {
    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    if (!chartRef.current || !data) return

    const ctx = chartRef.current.getContext("2d")

    // Format labels based on period
    const formatLabels = () => {
      if (period === "day") {
        return Array.from({ length: 24 }, (_, i) => `${i}:00`)
      } else if (period === "week") {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        return days
      } else if (period === "month") {
        return Array.from({ length: 31 }, (_, i) => `${i + 1}`)
      }
      return []
    }

    // Prepare data
    const labels = formatLabels()
    const generationData = data.generation || []
    const consumptionData = data.consumption || []

    // Create chart
    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Generation (kW)",
            data: generationData.map((item) => item.value),
            borderColor: "rgba(250, 204, 21, 1)",
            backgroundColor: "rgba(250, 204, 21, 0.1)",
            borderWidth: 2,
            fill: true,
            tension: 0.4,
          },
          {
            label: "Consumption (kW)",
            data: consumptionData.map((item) => item.value),
            borderColor: "rgba(59, 130, 246, 1)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            borderWidth: 2,
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
          },
          tooltip: {
            mode: "index",
            intersect: false,
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Energy (kW)",
            },
          },
        },
        interaction: {
          mode: "nearest",
          axis: "x",
          intersect: false,
        },
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data, period])

  return (
    <div className="h-[250px]">
      <canvas ref={chartRef}></canvas>
    </div>
  )
}

export default EnergyChart
