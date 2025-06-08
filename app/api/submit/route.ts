// app/api/submit/route.ts
import { NextResponse } from 'next/server'

// 👇 swap in your real Apps Script exec URL
const GAS_URL =
  'https://script.google.com/macros/s/AKfycbwGt6CF6ludvrozBeoISWqxTeyTjDVA-IOq9LVPqarxclIsnd_tBehA0QS-aaaSRUlVbw/exec'

export async function POST(request: Request) {
  try {
    const payload = await request.json()

    // forward to GAS
    const res = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const json = await res.json()
    return NextResponse.json(json, { status: res.status })
  } catch (err: unknown) {
    console.error('[/api/submit] error:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
