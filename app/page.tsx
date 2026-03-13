"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { ActualRecord, ForecastRecord, ChartDataPoint } from "@/lib/types"
import { mergeData, computeStats } from "@/lib/dataUtils"
import { ForecastChart } from "@/components/ForecastChart"
import { DateRangePicker } from "@/components/DateRangePicker"
import { HorizonSlider } from "@/components/HorizonSlider"
import { StatsBar } from "@/components/StatsBar"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

// Force UTC midnight so dates are always 2024-01-xx
function utcDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month, day, 0, 0, 0, 0))
}

const DEFAULT_FROM = utcDate(2024, 0, 1)   // 2024-01-01T00:00:00Z
const DEFAULT_TO   = utcDate(2024, 0, 7)   // 2024-01-07T00:00:00Z (1 week default for speed)

export default function HomePage() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: DEFAULT_FROM,
    to: DEFAULT_TO,
  })
  const [horizonHours, setHorizonHours] = useState(4)
  const [actuals, setActuals] = useState<ActualRecord[]>([])
  const [forecasts, setForecasts] = useState<ForecastRecord[]>([])
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Track last fetched range to avoid redundant fetches
  const lastFetched = useRef<string>("")

  const fetchData = useCallback(async () => {
    const from = dateRange.from.toISOString()
    const to = dateRange.to.toISOString()
    const key = `${from}|${to}`
    if (key === lastFetched.current) return
    lastFetched.current = key

    setLoading(true)
    setError(null)

    try {
      const [actualsRes, forecastsRes] = await Promise.all([
        fetch(`/api/actuals?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),
        fetch(`/api/forecasts?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),
      ])

      if (!actualsRes.ok || !forecastsRes.ok) {
        throw new Error("Failed to fetch data from the Elexon API")
      }

      const [actualsData, forecastsData]: [ActualRecord[], ForecastRecord[]] =
        await Promise.all([actualsRes.json(), forecastsRes.json()])

      setActuals(actualsData)
      setForecasts(forecastsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }, [dateRange])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Re-merge whenever raw data or horizon changes — no extra fetch needed
  useEffect(() => {
    if (actuals.length > 0) {
      setChartData(mergeData(actuals, forecasts, horizonHours))
    } else {
      setChartData([])
    }
  }, [actuals, forecasts, horizonHours])

  const stats = computeStats(chartData)

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            🌬️ Wind Forecast Monitor
          </h1>
          <p className="mt-1 text-muted-foreground text-sm">
            UK national wind power generation — actual vs forecast (Elexon BMRS)
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-end">
          <DateRangePicker dateRange={dateRange} onChange={setDateRange} />
          <HorizonSlider value={horizonHours} onChange={setHorizonHours} />
        </div>

        {/* Error */}
        {error && (
          <Card className="mb-6 border-destructive bg-destructive/10">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <StatsBar stats={stats} loading={loading} />

        {/* Chart */}
        <div className="mt-6">
          <ForecastChart data={chartData} loading={loading} />
        </div>
      </div>
    </main>
  )
}
