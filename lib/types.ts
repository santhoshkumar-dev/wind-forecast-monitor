export interface ActualRecord {
  startTime: string
  generation: number
}

export interface ForecastRecord {
  startTime: string
  publishTime: string
  generation: number
}

export interface ChartDataPoint {
  time: string
  actual: number | null
  forecast: number | null
}

export interface Stats {
  mae: number
  rmse: number
  coverage: number
}
