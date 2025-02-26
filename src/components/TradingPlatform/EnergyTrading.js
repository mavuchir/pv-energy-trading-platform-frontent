import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/Input'

const EnergyTrading = () => {
  const [amount, setAmount] = useState('')
  const [price, setPrice] = useState('')

  const handleTrade = (type) => {
    console.log(`${type} ${amount} kWh at $${price} per kWh`)
    // Implement trade logic here
  }

  return (
    <div className="space-y-4">
      <Input
        type="number"
        placeholder="Amount (kWh)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <Input
        type="number"
        placeholder="Price per kWh"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <div className="flex space-x-2">
        <Button onClick={() => handleTrade('Buy')} className="w-full">Buy</Button>
        <Button onClick={() => handleTrade('Sell')} className="w-full">Sell</Button>
      </div>
    </div>
  )
}

export default EnergyTrading