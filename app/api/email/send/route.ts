import { google } from 'googleapis'
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
)

function buildRawEmail({
  from,
  to,
  subject,
  html,
}: {
  from: string
  to: string
  subject: string
  html: string
}) {
  const lines = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    '',
    html,
  ]
  return Buffer.from(lines.join('\r\n'))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export async function POST(req: NextRequest) {
  try {
    const { uid, to, subject, html } = await req.json()

    if (!uid || !to || !subject || !html) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Fetch user's stored tokens
    const userSnap = await adminDb.collection('users').doc(uid).get()
    if (!userSnap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userData = userSnap.data()!
    const gc = userData.googleCalendar
    if (!gc?.connected || !gc?.accessToken) {
      return NextResponse.json({ error: 'Gmail not connected' }, { status: 400 })
    }

    oauth2Client.setCredentials({
      access_token: gc.accessToken,
      refresh_token: gc.refreshToken,
      expiry_date: gc.expiryDate,
    })

    // Auto-refresh token if expired
    oauth2Client.on('tokens', async (tokens) => {
      const update: Record<string, unknown> = {}
      if (tokens.access_token) update['googleCalendar.accessToken'] = tokens.access_token
      if (tokens.refresh_token) update['googleCalendar.refreshToken'] = tokens.refresh_token
      if (tokens.expiry_date) update['googleCalendar.expiryDate'] = tokens.expiry_date
      if (Object.keys(update).length > 0) {
        await adminDb.collection('users').doc(uid).update(update)
      }
    })

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client })
    const raw = buildRawEmail({ from: gc.email, to, subject, html })

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Email send error:', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
