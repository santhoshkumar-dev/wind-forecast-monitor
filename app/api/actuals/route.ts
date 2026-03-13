import { NextRequest, NextResponse } from "next/server"

// Elexon FUELHH field names
interface ElexonFuelHHRecord {
  startTime?: string
  publishTime?: string
  settlementDate?: string
  settlementPeriod?: number
  fuelType?: string
  generation?: number
  [key: string]: unknown
}

/**
 * FUELHH stream filters by publishTime, not startTime.
 * publishTime is ~30 min ahead of startTime (data is finalized after the period ends).
 * So to get actuals for startTime in [from, to], query publishTime in [from+30m, to+30m].
 */
function addMinutes(iso: string, minutes: number): string {
  const ms = new Date(iso).getTime() + minutes * 60 * 1000
  return new Date(ms).toISOString().replace(/\.\d{3}Z$/, "Z")
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  if (!from || !to) {
    return NextResponse.json({ error: "Missing from/to params" }, { status: 400 })
  }

  try {
    const url = new URL("https://data.elexon.co.uk/bmrs/api/v1/datasets/FUELHH/stream")
    // Elexon FUELHH uses publishDateTimeFrom/To, not from/to.
    // publishTime lags startTime by ~30min, so offset accordingly.
    url.searchParams.set("publishDateTimeFrom", addMinutes(from, 30))
    url.searchParams.set("publishDateTimeTo", addMinutes(to, 30))
    url.searchParams.set("fuelType", "WIND")

    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      cache: "no-store",
    })

    if (!res.ok) {
      const text = await res.text()
      console.error("FUELHH error:", res.status, text)
      return NextResponse.json(
        { error: `Elexon API error: ${res.status}` },
        { status: res.status }
      )
    }

    const raw: ElexonFuelHHRecord[] = await res.json()
    const data = Array.isArray(raw) ? raw : []

    const filtered = data
      .map((r) => ({
        startTime: r.startTime ?? "",
        generation: typeof r.generation === "number" ? r.generation : 0,
      }))
      .filter((r) => r.startTime !== "")

    return NextResponse.json(filtered)
  } catch (err) {
    console.error("actuals route error", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
