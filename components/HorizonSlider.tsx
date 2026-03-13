"use client"

import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"

interface HorizonSliderProps {
  value: number
  onChange: (val: number) => void
}

export function HorizonSlider({ value, onChange }: HorizonSliderProps) {
  const label = value === 0 ? "All" : `${value}h`

  return (
    <div className="flex flex-col gap-2 w-full sm:w-72">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Forecast Horizon</span>
        <Badge variant="secondary">{label}</Badge>
      </div>
      <Slider
        min={0}
        max={48}
        step={1}
        value={[value]}
        onValueChange={(vals) => onChange(vals[0])}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>All</span>
        <span>48h ahead</span>
      </div>
      <p className="text-xs text-muted-foreground leading-tight">
        {value === 0
          ? "Showing latest available forecast for each period"
          : `Only forecasts published ≥ ${value}h before settlement`}
      </p>
    </div>
  )
}
