import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { token } = await req.json()
    const secretKey = process.env.TURNSTILE_SECRET_KEY

    if (!secretKey) {
      return NextResponse.json({ success: false, error: 'Turnstile secret key not configured' }, { status: 500 })
    }

    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${secretKey}&response=${token}`,
    })

    const data = await verifyRes.json()

    if (!data.success) {
      return NextResponse.json({ success: false, error: 'Turnstile check failed' }, { status: 403 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
