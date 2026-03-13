import { ActualRecord, ForecastRecord, ChartDataPoint, Stats } from "./types"

export function filterLatestForecast(
  forecasts: ForecastRecord[],
  targetTime: string,
  horizonHours: number
): ForecastRecord | null {
  const targetMs = new Date(targetTime).getTime()
  const horizonMs = horizonHours * 60 * 60 * 1000
  const cutoff = targetMs - horizonMs

  const valid = forecasts.filter((f) => {
    const publishMs = new Date(f.publishTime).getTime()
    return publishMs <= cutoff
  })

  if (valid.length === 0) return null

  return valid.reduce((latest, f) =>
    new Date(f.publishTime) > new Date(latest.publishTime) ? f : latest
  )
}

export function mergeData(
  actuals: ActualRecord[],
  forecasts: ForecastRecord[],
  horizonHours: number
): ChartDataPoint[] {
  const sorted = [...actuals].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  )

  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

  return sorted.map((actual) => {
    const matched = filterLatestForecast(forecasts, actual.startTime, horizonHours)
    const d = new Date(actual.startTime)
    const label = `${String(d.getUTCDate()).padStart(2, "0")} ${
      MONTHS[d.getUTCMonth()]
    } ${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`

    return {
      time: label,
      actual: actual.generation,
      forecast: matched ? matched.generation : null,
    }
  })
}

export function computeStats(data: ChartDataPoint[]): Stats {
  const paired = data.filter((d) => d.actual !== null && d.forecast !== null)
  const total = data.filter((d) => d.actual !== null).length

  if (paired.length === 0) {
    return { mae: 0, rmse: 0, coverage: 0 }
  }

  const mae =
    paired.reduce((sum, d) => sum + Math.abs(d.actual! - d.forecast!), 0) /
    paired.length

  const rmse = Math.sqrt(
    paired.reduce((sum, d) => sum + Math.pow(d.actual! - d.forecast!, 2), 0) /
      paired.length
  )

  const coverage = total > 0 ? (paired.length / total) * 100 : 0

  return {
    mae: Math.round(mae),
    rmse: Math.round(rmse),
    coverage: Math.round(coverage),
  }
}
