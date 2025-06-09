// app/api/submit/route.ts
import { NextResponse } from 'next/server'

// 👇 replace with your real Apps Script exec URL
const GAS_URL =
  'https://script.google.com/macros/s/AKfycbwGt6CF6ludvrozBeoISWqxTeyTjDVA-IOq9LVPqarxclIsnd_tBehA0QS-aaaSRUlVbw/exec'

export async function POST(request: Request) {
  try {
    const payload = await request.json()

    // forward to Google Apps Script
    const res = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const json = await res.json()
    return NextResponse.json(json, { status: res.status })
  } catch (err: any) {
    console.error('[/api/submit] error:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Unknown error' },
      { status: 500 }
    )
  }
}
