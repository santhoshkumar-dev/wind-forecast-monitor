"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

import {
  ValueType,
  NameType,
} from "recharts/types/component/DefaultTooltipContent";

import { ChartDataPoint } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { downsample } from "@/lib/downsample";

interface ForecastChartProps {
  data: ChartDataPoint[];
  loading: boolean;
}

export function ForecastChart({ data, loading }: ForecastChartProps) {
  // Memoized downsample
  const sampled = React.useMemo(() => downsample(data ?? [], 400), [data]);

  // Correctly typed tooltip formatter
  const tooltipFormatter = React.useCallback(
    (value: ValueType, name: NameType) => [
      value != null ? `${Number(value).toLocaleString()} MW` : "—",
      name === "actual" ? "Actual" : "Forecast",
    ],
    [],
  );

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
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[400px] text-muted-foreground">
          No data available for the selected range.
        </CardContent>
      </Card>
    );
  }

  const coveragePct =
    sampled.length > 0
      ? Math.round(
          (sampled.filter((d) => d.forecast !== null).length / sampled.length) *
            100,
        )
      : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Generation (MW)
          {coveragePct > 0 && (
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              — forecast matched {coveragePct}% of points
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={sampled}
            syncId="forecast"
            margin={{ top: 4, right: 16, left: 0, bottom: 24 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />

            <XAxis
              dataKey="time"
              tick={{ fontSize: 10 }}
              interval={Math.max(0, Math.floor(sampled.length / 8) - 1)}
              angle={-30}
              textAnchor="end"
              height={55}
            />

            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => Number(v).toLocaleString()}
              width={72}
              domain={["auto", "auto"]}
            />

            <Tooltip
              formatter={tooltipFormatter}
              labelFormatter={(label) => `🕐 ${label}`}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
                fontSize: "12px",
              }}
            />

            <Legend
              formatter={(value) =>
                value === "actual" ? "Actual" : "Forecast"
              }
            />

            <Line
              type="monotone"
              dataKey="actual"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              connectNulls={false}
              isAnimationActive={false}
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
              isAnimationActive={false}
              name="forecast"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
