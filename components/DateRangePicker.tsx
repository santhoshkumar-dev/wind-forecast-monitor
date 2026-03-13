"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

const JAN_2024_FROM = new Date("2024-01-01")
const JAN_2024_TO = new Date("2024-01-31")

function formatDate(d: Date) {
  return `${String(d.getDate()).padStart(2, "0")} Jan 2024`
}

interface DateRangePickerProps {
  dateRange: { from: Date; to: Date }
  onChange: (range: { from: Date; to: Date }) => void
}

export function DateRangePicker({ dateRange, onChange }: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      onChange({ from: range.from, to: range.to })
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full sm:w-auto justify-start gap-2 text-sm font-normal"
        >
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          {formatDate(dateRange.from)} – {formatDate(dateRange.to)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={{ from: dateRange.from, to: dateRange.to }}
          onSelect={handleSelect}
          defaultMonth={JAN_2024_FROM}
          fromDate={JAN_2024_FROM}
          toDate={JAN_2024_TO}
          numberOfMonths={1}
        />
      </PopoverContent>
    </Popover>
  )
}
