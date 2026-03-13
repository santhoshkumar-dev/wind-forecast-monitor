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
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// Bug 3 fix: use UTC getters so the label is timezone-safe (e.g. IST = UTC+5:30
// would shift a midnight-UTC date back one calendar day with local getters)
function fmt(d: Date) {
  return `${String(d.getUTCDate()).padStart(2, "0")} ${
    MONTHS[d.getUTCMonth()]
  } ${d.getUTCFullYear()}`;
}

// Bug 4 fix: react-day-picker returns picked dates at midnight UTC.
// Push `to` to 23:30 UTC so the full day's settlement periods are included.
function toEndOfDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 30, 0));
}

// Bug 5: Valid data range — Elexon BMRS dataset covers 2024 only
const DATA_START = new Date(Date.UTC(2024, 0, 1));
const DATA_END   = new Date(Date.UTC(2024, 11, 31, 23, 30, 0));

interface DateRangePickerProps {
  dateRange?: { from: Date; to: Date };
  onChange: (range: { from: Date; to: Date }) => void;
}

export function DateRangePicker({ dateRange, onChange }: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Bug 1 fix: initialise draft from prop so calendar opens pre-highlighted
  const [draft, setDraft] = React.useState<DateRange | undefined>(
    dateRange ? { from: dateRange.from, to: dateRange.to } : undefined
  );

  // Bug 1 fix (cont): keep draft in sync if parent changes dateRange externally
  React.useEffect(() => {
    if (dateRange) {
      setDraft({ from: dateRange.from, to: dateRange.to });
    }
  }, [dateRange]);

  // Bug 2 fix: when popover closes without a completed selection, reset draft
  // back to the confirmed dateRange so next open doesn't show a stale partial pick
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && dateRange) {
      setDraft({ from: dateRange.from, to: dateRange.to });
    }
    setOpen(nextOpen);
  };

  const handleSelect = (range: DateRange | undefined) => {
    setDraft(range);

    if (range?.from && range?.to) {
      // Bug 4 fix: normalise `to` to end-of-day so the last selected day is
      // fully included in the API fetch (react-day-picker returns midnight UTC)
      onChange({ from: range.from, to: toEndOfDay(range.to) });
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
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
          // Bug 5 fix: disable dates outside the valid dataset window
          disabled={{ before: DATA_START, after: DATA_END }}
          defaultMonth={DATA_START}
        />
      </PopoverContent>
    </Popover>
  );
}
