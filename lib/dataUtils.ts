import { ActualRecord, ForecastRecord, ChartDataPoint, Stats } from "./types"

/**
 * For each actual settlement period, find the best matching forecast:
 * - The forecast must have been published AT LEAST horizonHours before the actual's startTime
 * - Among qualifying forecasts, prefer the one whose startTime is closest to the actual's startTime
 *   (WINDFOR is hourly, FUELHH is 30-min, so we round to the nearest hour)
 * - Among forecasts with the same startTime match, pick the most recently published
 */
export function filterLatestForecast(
  forecasts: ForecastRecord[],
  actualStartTime: string,
  horizonHours: number
): ForecastRecord | null {
  const targetMs = new Date(actualStartTime).getTime()
  const horizonMs = horizonHours * 60 * 60 * 1000
  const publishCutoff = targetMs - horizonMs

  // Round the actual's startTime to the nearest hour to match WINDFOR hourly steps
  const roundedMs = Math.round(targetMs / (60 * 60 * 1000)) * (60 * 60 * 1000)

  // Only keep forecasts that were published early enough, and whose startTime rounds to the same hour
  const valid = forecasts.filter((f) => {
    const publishMs = new Date(f.publishTime).getTime()
    const forecastMs = new Date(f.startTime).getTime()
    return publishMs <= publishCutoff && forecastMs === roundedMs
  })

  if (valid.length === 0) return null

  // Pick the most recently published among matching forecasts
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
