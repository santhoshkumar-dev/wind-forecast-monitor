"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

// Constrain to Jan 2024 only
const JAN_MIN = new Date(Date.UTC(2024, 0, 1))
const JAN_MAX = new Date(Date.UTC(2024, 0, 31))

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun",
                "Jul","Aug","Sep","Oct","Nov","Dec"]

function fmt(d: Date) {
  return `${String(d.getUTCDate()).padStart(2, "0")} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

interface DateRangePickerProps {
  dateRange: { from: Date; to: Date }
  onChange: (range: { from: Date; to: Date }) => void
}

export function DateRangePicker({ dateRange, onChange }: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)
  // local draft while user is picking
  const [draft, setDraft] = React.useState<DateRange>({
    from: dateRange.from,
    to: dateRange.to,
  })

  const handleSelect = (range: DateRange | undefined) => {
    if (!range) return
    setDraft(range)
    if (range.from && range.to) {
      // Force UTC midnight on whatever the calendar returns
      const from = new Date(Date.UTC(
        range.from.getFullYear(),
        range.from.getMonth(),
        range.from.getDate()
      ))
      const to = new Date(Date.UTC(
        range.to.getFullYear(),
        range.to.getMonth(),
        range.to.getDate(),
        23, 30, 0   // end of last settlement period of the day
      ))
      onChange({ from, to })
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full sm:w-auto justify-start gap-2 text-sm font-normal min-w-[220px]"
        >
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          {fmt(dateRange.from)} – {fmt(dateRange.to)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={draft}
          onSelect={handleSelect}
          defaultMonth={JAN_MIN}
          fromDate={JAN_MIN}
          toDate={JAN_MAX}
          numberOfMonths={1}
        />
      </PopoverContent>
    </Popover>
  )
}
