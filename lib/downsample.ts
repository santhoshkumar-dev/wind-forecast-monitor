import { ChartDataPoint } from "@/lib/types"

/**
 * LTTB-style min/max bucket downsampling.
 * Preserves visual peaks and dips instead of naively skipping points.
 * @param data - Full dataset
 * @param maxPoints - Target output size (default 400)
 */
export function downsample(data: ChartDataPoint[], maxPoints = 400): ChartDataPoint[] {
  if (data.length <= maxPoints) return data

  const bucketSize = Math.floor(data.length / maxPoints)
  const result: ChartDataPoint[] = []

  for (let i = 0; i < data.length; i += bucketSize) {
    const bucket = data.slice(i, i + bucketSize)
    let max = bucket[0]
    let min = bucket[0]

    for (const p of bucket) {
      if ((p.actual ?? 0) > (max.actual ?? 0)) max = p
      if ((p.actual ?? 0) < (min.actual ?? 0)) min = p
    }

    if (min === max) {
      result.push(min)
    } else {
      // Push in temporal order to keep X axis consistent
      result.push(min.time < max.time ? min : max)
      result.push(min.time < max.time ? max : min)
    }
  }

  return result
}
