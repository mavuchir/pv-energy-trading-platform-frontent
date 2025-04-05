"use client"

import React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "../../lib/utils"

const Slider = React.forwardRef(
  (
    {
      className,
      min = 0,
      max = 100,
      step = 1,
      defaultValue,
      value,
      onValueChange,
      disabled,
      orientation = "horizontal",
      ...props
    },
    ref,
  ) => {
    const isControlled = value !== undefined
    const sliderValue = isControlled ? value : defaultValue || [min]

    return (
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex touch-none select-none items-center",
          orientation === "vertical" ? "h-full flex-col" : "w-full",
          className,
        )}
        min={min}
        max={max}
        step={step}
        value={sliderValue}
        onValueChange={onValueChange}
        disabled={disabled}
        orientation={orientation}
        {...props}
      >
        <SliderPrimitive.Track
          className={cn(
            "relative grow rounded-full bg-gray-200 dark:bg-gray-800",
            orientation === "vertical" ? "w-2" : "h-2",
          )}
        >
          <SliderPrimitive.Range className="absolute rounded-full bg-teal-600 dark:bg-teal-500" />
        </SliderPrimitive.Track>
        {sliderValue.map((_, i) => (
          <SliderPrimitive.Thumb
            key={i}
            className="block h-5 w-5 rounded-full border-2 border-teal-600 bg-white ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:border-teal-500 dark:bg-gray-950 dark:ring-offset-gray-950 dark:focus-visible:ring-teal-500"
          />
        ))}
      </SliderPrimitive.Root>
    )
  },
)

Slider.displayName = "Slider"

export { Slider }

