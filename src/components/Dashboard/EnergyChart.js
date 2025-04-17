import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const EnergyChart = ({ productionData, consumptionData, forecastProduction, forecastConsumption }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');

    // Prepare data
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    const productionValues = hours.map(hour => {
      const dataPoint = productionData.find(d => d.hour === hour);
      return dataPoint ? dataPoint.amount : 0;
    });
    
    const consumptionValues = hours.map(hour => {
      const dataPoint = consumptionData.find(d => d.hour === hour);
      return dataPoint ? dataPoint.amount : 0;
    });

    // Get current hour to separate actual data from forecast
    const currentHour = new Date().getHours();
    
    // Create datasets
    const datasets = [
      {
        label: 'Production',
        data: productionValues.slice(0, currentHour + 1),
        borderColor: 'rgba(116, 185, 49, 1)',
        backgroundColor: 'rgba(116, 185, 49, 0.2)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Consumption',
        data: consumptionValues.slice(0, currentHour + 1),
        borderColor: 'rgba(239, 68, 68, 1)',
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        fill: true,
        tension: 0.4
      }
    ];
    
    // Add forecast data if available
    if (forecastProduction && forecastProduction.length > 0) {
      datasets.push({
        label: 'Production Forecast',
        data: [...Array(currentHour + 1).fill(null), ...productionValues.slice(currentHour + 1)],
        borderColor: 'rgba(116, 185, 49, 0.7)',
        backgroundColor: 'rgba(116, 185, 49, 0.1)',
        borderDash: [5, 5],
        fill: true,
        tension: 0.4
      });
    }
    
    if (forecastConsumption && forecastConsumption.length > 0) {
      datasets.push({
        label: 'Consumption Forecast',
        data: [...Array(currentHour + 1).fill(null), ...consumptionValues.slice(currentHour + 1)],
        borderColor: 'rgba(239, 68, 68, 0.7)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderDash: [5, 5],
        fill: true,
        tension: 0.4
      });
    }

    // Create chart
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: hours.map(h => `${h}:00`),
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            mode: 'index',
            intersect: false
          },
          legend: {
            position: 'top',
          },
          title: {
            display: false
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Hour of Day'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Energy (kWh)'
            },
            beginAtZero: true
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [productionData, consumptionData, forecastProduction, forecastConsumption]);

  return (
    <canvas ref={chartRef}></canvas>
  );
};

export default EnergyChart;