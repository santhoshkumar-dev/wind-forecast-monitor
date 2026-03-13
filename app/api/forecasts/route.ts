import { NextRequest, NextResponse } from "next/server"

// Elexon WINDFOR stream field names
interface ElexonWindForRecord {
  startTime?: string
  publishTime?: string
  // Some versions use these alternative names
  targetTime?: string
  createdDateTime?: string
  generationMW?: number
  generation?: number
  quantity?: number
  [key: string]: unknown
}

function toElexonDate(iso: string): string {
  return new Date(iso).toISOString().replace(/\.\d{3}Z$/, "Z")
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
    url.searchParams.set("from", toElexonDate(from))
    url.searchParams.set("to", toElexonDate(to))

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
      .map((r) => {
        // Normalise field names — Elexon uses different names across versions
        const startTime = r.startTime ?? r.targetTime ?? ""
        const publishTime = r.publishTime ?? r.createdDateTime ?? ""
        const generation =
          typeof r.generation === "number"
            ? r.generation
            : typeof r.generationMW === "number"
            ? r.generationMW
            : typeof r.quantity === "number"
            ? r.quantity
            : null

        return { startTime, publishTime, generation }
      })
      .filter((r) => {
        if (!r.startTime || !r.publishTime || r.generation === null) return false
        const start = new Date(r.startTime).getTime()
        const publish = new Date(r.publishTime).getTime()
        const horizonHours = (start - publish) / (1000 * 60 * 60)
        return horizonHours >= 0 && horizonHours <= 48
      })

    return NextResponse.json(filtered)
  } catch (err) {
    console.error("forecasts route error", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
