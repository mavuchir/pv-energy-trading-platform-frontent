'use client';

import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Select } from '../ui/select'
import { Label } from '../ui/label'
import { Input } from '../ui/Input'

const ScheduleOptimizer = ({ appliances }) => {
  const [selectedAppliance, setSelectedAppliance] = useState('')
  const [startTime, setStartTime] = useState('')
  const [duration, setDuration] = useState('')

  const handleOptimize = (e) => {
    e.preventDefault()
    // Here you would typically call an API or run an optimization algorithm
    console.log('Optimizing schedule for:', { selectedAppliance, startTime, duration })
  }

  return (
    <form onSubmit={handleOptimize} className="space-y-4">
      <div>
        <Label htmlFor="appliance">Select Appliance</Label>
        <Select
          id="appliance"
          value={selectedAppliance}
          onChange={(e) => setSelectedAppliance(e.target.value)}
          required
        >
          <option value="">Choose an appliance</option>
          {appliances.map(appliance => (
            <option key={appliance.id} value={appliance.id}>{appliance.name}</option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="startTime">Preferred Start Time</Label>
        <Input
          id="startTime"
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="duration">Duration (hours)</Label>
        <Input
          id="duration"
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          required
        />
      </div>
      <Button type="submit">Optimize Schedule</Button>
    </form>
  )
}

export default ScheduleOptimizer
