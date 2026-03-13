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

const MAX_RANGE_DAYS = 30;

function fmt(d: Date) {
  return `${String(d.getDate()).padStart(2, "0")} ${
    MONTHS[d.getMonth()]
  } ${d.getFullYear()}`;
}

interface DateRangePickerProps {
  dateRange?: { from: Date; to: Date };
  onChange: (range: { from: Date; to: Date }) => void;
}

function diffDays(a: Date, b: Date) {
  const ms = Math.abs(b.getTime() - a.getTime());
  return ms / (1000 * 60 * 60 * 24);
}

export function DateRangePicker({ dateRange, onChange }: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<DateRange | undefined>(dateRange);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  React.useEffect(() => {
    if (dateRange) setDraft(dateRange);
  }, [dateRange]);

  const handleSelect = (range: DateRange | undefined) => {
    if (!range) return;

    // only start date selected
    if (range.from && !range.to) {
      setDraft(range);
      return;
    }

    if (range.from && range.to) {
      // clicking same day should just set start date
      if (range.from.getTime() === range.to.getTime()) {
        setDraft({ from: range.from, to: undefined });
        return;
      }

      const days = diffDays(range.from, range.to);

      if (days > MAX_RANGE_DAYS) {
        setDraft({ from: range.to, to: undefined });
        return;
      }

      setDraft(range);
      onChange({ from: range.from, to: range.to });
      setOpen(false);
    }
  };

  const clear = () => {
    setDraft(undefined);
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
        <div className="p-3 border-b flex justify-end">
          <Button variant="ghost" size="sm" onClick={clear}>
            Clear
          </Button>
        </div>

        <Calendar
          mode="range"
          selected={draft}
          onSelect={handleSelect}
          numberOfMonths={2}
          disabled={{ after: today }}
        />
      </PopoverContent>
    </Popover>
  );
}
