// app/api/submit/route.ts
import { NextResponse } from 'next/server'

// Replace this with your deployed Apps-Script exec URL:
const GAS_URL =
  'https://script.google.com/macros/s/AKfycbwGt6CF6ludvrozBeoISWqxTeyTjDVA-IOq9LVPqarxclIsnd_tBehA0QS-aaaSRUlVbw/exec'

export async function POST(request: Request) {
  try {
    const payload = await request.json()

    // Forward to Google Apps Script
    const res = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    // Proxy back the JSON result and status
    const result = await res.json()
    return NextResponse.json(result, { status: res.status })
  } catch (err: any) {
    console.error('API /submit error:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Unknown error' },
      { status: 500 }
    )
  }
}
