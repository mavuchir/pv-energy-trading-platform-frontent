"use client"

import { useState, useEffect, useCallback } from "react"
import * as energyService from "../services/energyService"

// Hook for energy overview data
export const useEnergyOverview = (period = "day", refreshInterval = 60000) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const result = await energyService.getEnergyOverview(period)
      setData(result)
      setError(null)
    } catch (err) {
      setError(err.message || "Failed to fetch energy overview")
      console.error("Error in useEnergyOverview:", err)
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    fetchData()

    // Set up interval for refreshing data
    if (refreshInterval > 0) {
      const intervalId = setInterval(fetchData, refreshInterval)
      return () => clearInterval(intervalId)
    }
  }, [fetchData, refreshInterval])

  return { data, loading, error, refetch: fetchData }
}

// Hook for real-time energy data
export const useRealTimeData = (refreshInterval = 15000) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const result = await energyService.getRealTimeData()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err.message || "Failed to fetch real-time data")
      console.error("Error in useRealTimeData:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()

    // Set up interval for refreshing data
    if (refreshInterval > 0) {
      const intervalId = setInterval(fetchData, refreshInterval)
      return () => clearInterval(intervalId)
    }
  }, [fetchData, refreshInterval])

  return { data, loading, error, refetch: fetchData }
}

// Hook for generation data
export const useGenerationData = (period = "day", interval = "hour") => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const result = await energyService.getGenerationData(period, interval)
      setData(result)
      setError(null)
    } catch (err) {
      setError(err.message || "Failed to fetch generation data")
      console.error("Error in useGenerationData:", err)
    } finally {
      setLoading(false)
    }
  }, [period, interval])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

// Hook for consumption data
export const useConsumptionData = (period = "day", interval = "hour", byAppliance = false) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const result = await energyService.getConsumptionData(period, interval, byAppliance)
      setData(result)
      setError(null)
    } catch (err) {
      setError(err.message || "Failed to fetch consumption data")
      console.error("Error in useConsumptionData:", err)
    } finally {
      setLoading(false)
    }
  }, [period, interval, byAppliance])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

// Hook for weather data
export const useWeatherData = (refreshInterval = 300000) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const result = await energyService.getWeatherData()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err.message || "Failed to fetch weather data")
      console.error("Error in useWeatherData:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()

    // Set up interval for refreshing data
    if (refreshInterval > 0) {
      const intervalId = setInterval(fetchData, refreshInterval)
      return () => clearInterval(intervalId)
    }
  }, [fetchData, refreshInterval])

  return { data, loading, error, refetch: fetchData }
}

// Hook for market prices
export const useMarketPrices = (refreshInterval = 300000) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const result = await energyService.getMarketPrices()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err.message || "Failed to fetch market prices")
      console.error("Error in useMarketPrices:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()

    // Set up interval for refreshing data
    if (refreshInterval > 0) {
      const intervalId = setInterval(fetchData, refreshInterval)
      return () => clearInterval(intervalId)
    }
  }, [fetchData, refreshInterval])

  return { data, loading, error, refetch: fetchData }
}

