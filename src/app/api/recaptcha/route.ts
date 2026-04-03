import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { token } = await req.json()
    const secretKey = process.env.RECAPTCHA_SECRET_KEY

    if (!secretKey) {
      return NextResponse.json({ success: false, error: 'reCAPTCHA secret key not configured' }, { status: 500 })
    }

    const verifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${secretKey}&response=${token}`,
    })

    const data = await verifyRes.json()

    // Require score >= 0.5 as recommended by Google docs
    if (!data.success || data.score < 0.5) {
      return NextResponse.json({ success: false, score: data.score, error: 'reCAPTCHA score too low' }, { status: 403 })
    }

    return NextResponse.json({ success: true, score: data.score })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
