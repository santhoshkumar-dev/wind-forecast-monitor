export interface ActualRecord {
  startTime: string       // ISO datetime, 30-min resolution
  generation: number      // MW
}

export interface ForecastRecord {
  startTime: string       // target time
  publishTime: string     // when forecast was created
  generation: number      // MW
}

export interface ChartDataPoint {
  time: string            // formatted label for X axis
  actual: number | null
  forecast: number | null
}

export interface Stats {
  mae: number
  rmse: number
  coverage: number
}
