/**
 * Debug route — call /api/debug to inspect raw Elexon API responses.
 * Remove before deploying to production.
 */
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const dataset = searchParams.get("dataset") ?? "WINDFOR"
  const from = searchParams.get("from") ?? "2024-01-01T00:00:00Z"
  const to   = searchParams.get("to")   ?? "2024-01-01T06:00:00Z"

  const url = new URL(`https://data.elexon.co.uk/bmrs/api/v1/datasets/${dataset}/stream`)
  url.searchParams.set("from", from)
  url.searchParams.set("to", to)

  const res = await fetch(url.toString(), { headers: { Accept: "application/json" }, cache: "no-store" })
  const raw = await res.json()
  const sample = Array.isArray(raw) ? raw.slice(0, 3) : raw

  return NextResponse.json({
    status: res.status,
    url: url.toString(),
    totalRecords: Array.isArray(raw) ? raw.length : "N/A",
    sampleFields: sample,
  })
}
