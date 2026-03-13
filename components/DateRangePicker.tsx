"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function fmt(d: Date) {
  return `${String(d.getDate()).padStart(2, "0")} ${
    MONTHS[d.getMonth()]
  } ${d.getFullYear()}`;
}

interface DateRangePickerProps {
  dateRange?: { from: Date; to: Date };
  onChange: (range: { from: Date; to: Date }) => void;
}

export function DateRangePicker({ dateRange, onChange }: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<DateRange | undefined>();

  const handleSelect = (range: DateRange | undefined) => {
    setDraft(range);

    if (
      range?.from &&
      range?.to &&
      range.from.getTime() !== range.to.getTime()
    ) {
      onChange({ from: range.from, to: range.to });
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full sm:w-auto justify-start gap-2 text-sm font-normal min-w-[220px]"
        >
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />

          {dateRange
            ? `${fmt(dateRange.from)} – ${fmt(dateRange.to)}`
            : "Select date range"}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={draft}
          onSelect={handleSelect}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
