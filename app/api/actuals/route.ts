import { NextRequest, NextResponse } from "next/server"

// Elexon field names observed in FUELHH stream response
interface ElexonFuelHHRecord {
  startTime?: string
  settlementDate?: string
  settlementPeriod?: number
  fuelType?: string
  generation?: number
  [key: string]: unknown
}

function toElexonDate(iso: string): string {
  // Elexon expects: 2024-01-01T00:00:00Z (no ms)
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
    const url = new URL("https://data.elexon.co.uk/bmrs/api/v1/datasets/FUELHH/stream")
    url.searchParams.set("from", toElexonDate(from))
    url.searchParams.set("to", toElexonDate(to))

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
      .filter((r) => r.fuelType === "WIND")
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
