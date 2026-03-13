import { NextRequest, NextResponse } from "next/server"

// Elexon WINDFOR stream field names
interface ElexonWindForRecord {
  startTime?: string
  publishTime?: string
  generation?: number
  [key: string]: unknown
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  if (!from || !to) {
    return NextResponse.json({ error: "Missing from/to params" }, { status: 400 })
  }

  try {
    const url = new URL("https://data.elexon.co.uk/bmrs/api/v1/datasets/WINDFOR/stream")
    // Elexon WINDFOR stream uses publishDateTimeFrom/To to filter by when the forecast was published.
    // We use the selected date range as the publish window to get forecasts for that period.
    url.searchParams.set("publishDateTimeFrom", from.replace(/\.\d{3}Z$/, "Z"))
    url.searchParams.set("publishDateTimeTo", to.replace(/\.\d{3}Z$/, "Z"))

    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      cache: "no-store",
    })

    if (!res.ok) {
      const text = await res.text()
      console.error("WINDFOR error:", res.status, text)
      return NextResponse.json(
        { error: `Elexon API error: ${res.status}` },
        { status: res.status }
      )
    }

    const raw: ElexonWindForRecord[] = await res.json()
    const data = Array.isArray(raw) ? raw : []

    const filtered = data
      .map((r) => ({
        startTime: r.startTime ?? "",
        publishTime: r.publishTime ?? "",
        generation: typeof r.generation === "number" ? r.generation : null,
      }))
      .filter((r) => {
        if (!r.startTime || !r.publishTime || r.generation === null) return false
        const start = new Date(r.startTime).getTime()
        const publish = new Date(r.publishTime).getTime()
        const horizonHours = (start - publish) / (1000 * 60 * 60)
        // Keep only forward-looking forecasts up to 48h ahead
        return horizonHours >= 0 && horizonHours <= 48
      })

    return NextResponse.json(filtered)
  } catch (err) {
    console.error("forecasts route error", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
