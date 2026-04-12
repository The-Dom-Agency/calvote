import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
)

export async function POST(req: NextRequest) {
  try {
    const { to, message } = await req.json()

    if (!to || !message) {
      return NextResponse.json({ error: 'Missing to or message' }, { status: 400 })
    }

    // Normalize phone number
    const phone = to.startsWith('+') ? to : `+1${to.replace(/\D/g, '')}`

    const result = await client.messages.create({
      to: phone,
      from: process.env.TWILIO_PHONE_NUMBER,
      body: message,
    })

    return NextResponse.json({ success: true, sid: result.sid })
  } catch (err: unknown) {
    console.error('Twilio error:', err)
    const message = err instanceof Error ? err.message : 'SMS failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
