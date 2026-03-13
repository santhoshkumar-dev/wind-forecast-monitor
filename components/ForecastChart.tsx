"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts"
import { ChartDataPoint } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ForecastChartProps {
  data: ChartDataPoint[]
  loading: boolean
}

export function ForecastChart({ data, loading }: ForecastChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[400px] text-muted-foreground">
          No data available for the selected range.
        </CardContent>
      </Card>
    )
  }

  // Sample every Nth point to keep chart readable for large date ranges
  const step = Math.max(1, Math.floor(data.length / 200))
  const sampled = data.filter((_, i) => i % step === 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Generation (MW)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={sampled} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 11 }}
              interval={Math.max(0, Math.floor(sampled.length / 8) - 1)}
              angle={-30}
              textAnchor="end"
              height={50}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `${v.toLocaleString()}`}
              width={70}
            />
            <Tooltip
              formatter={(value: number | null, name: string) => [
                value !== null ? `${value.toLocaleString()} MW` : "—",
                name === "actual" ? "Actual" : "Forecast",
              ]}
              labelFormatter={(label) => `Time: ${label}`}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
                fontSize: "12px",
              }}
            />
            <Legend
              formatter={(value) => (value === "actual" ? "Actual" : "Forecast")}
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              connectNulls={false}
              name="actual"
            />
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#22c55e"
              strokeWidth={2}
              strokeDasharray="4 2"
              dot={false}
              connectNulls={false}
              name="forecast"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
