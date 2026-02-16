// app/api/predict/route.ts
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const base = process.env.API_BASE_URL
    if (!base) {
      return NextResponse.json(
        { error: "Missing API_BASE_URL env var on Vercel" },
        { status: 500 }
      )
    }

    const r = await fetch(`${base}/predict_launch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const text = await r.text()
    // Pass through whatever the backend returns (JSON most likely)
    return new NextResponse(text, {
      status: r.status,
      headers: { "Content-Type": r.headers.get("content-type") ?? "application/json" },
    })
  } catch (err) {
    return NextResponse.json({ error: "Proxy failed", details: String(err) }, { status: 500 })
  }
}
