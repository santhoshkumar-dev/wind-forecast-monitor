import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  if (!from || !to) {
    return NextResponse.json({ error: "Missing from/to params" }, { status: 400 })
  }

  try {
    const url = new URL("https://data.elexon.co.uk/bmrs/api/v1/datasets/WINDFOR/stream")
    url.searchParams.set("from", from)
    url.searchParams.set("to", to)

    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: `Elexon API error: ${res.status}` },
        { status: res.status }
      )
    }

    const raw = await res.json()
    const data = Array.isArray(raw) ? raw : raw.data ?? []

    const filtered = data
      .filter((r: Record<string, unknown>) => {
        const start = new Date(r.startTime as string).getTime()
        const publish = new Date(r.publishTime as string).getTime()
        const horizonHours = (start - publish) / (1000 * 60 * 60)
        return horizonHours >= 0 && horizonHours <= 48
      })
      .map((r: Record<string, unknown>) => ({
        startTime: r.startTime,
        publishTime: r.publishTime,
        generation: r.generation,
      }))

    return NextResponse.json(filtered)
  } catch (err) {
    console.error("forecasts route error", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
