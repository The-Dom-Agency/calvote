import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { google } from 'googleapis'

function randomToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(24)))
    .map(b => b.toString(36).padStart(2, '0'))
    .join('')
    .slice(0, 32)
}

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
)

function buildInviteEmail({
  contactName,
  ownerEmail,
  link,
}: {
  contactName: string
  ownerEmail: string
  link: string
}) {
  return `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#fff;border:1px solid #E5E7EB;border-radius:12px;overflow:hidden;">
      <div style="background:#1A5C52;padding:24px 32px;">
        <p style="color:#fff;font-weight:800;font-size:18px;margin:0;">calvote</p>
        <p style="color:rgba(255,255,255,0.7);font-size:13px;margin:4px 0 0;">Calendar Connection Invite</p>
      </div>
      <div style="padding:32px;">
        <p style="color:#1C2B3A;font-size:15px;margin:0 0 8px;">Hi ${contactName},</p>
        <p style="color:#6B7280;font-size:14px;margin:0 0 24px;">
          <strong style="color:#1C2B3A;">${ownerEmail}</strong> has invited you to connect your Google Calendar.
          This allows them to schedule meetings around your availability — without accessing your calendar directly.
        </p>
        <p style="color:#6B7280;font-size:13px;margin:0 0 20px;">Click the button below to connect your calendar. It only takes a moment.</p>
        <a href="${link}" style="display:inline-block;background:#1A5C52;color:#fff;font-weight:700;font-size:14px;padding:12px 28px;border-radius:8px;text-decoration:none;">
          Connect My Calendar
        </a>
      </div>
      <div style="padding:16px 32px;border-top:1px solid #E5E7EB;background:#F9FAFB;">
        <p style="color:#9CA3AF;font-size:11px;margin:0;">We only read your availability. We never send emails or modify your calendar events.</p>
      </div>
    </div>
  `
}

export async function POST(req: NextRequest) {
  const { ownerUid, contactId, contactEmail, contactName } = await req.json()
  if (!ownerUid || !contactId) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }

  const token = randomToken()

  await adminDb.collection('invites').doc(token).set({
    ownerUid,
    contactId,
    contactEmail: contactEmail ?? '',
    createdAt: new Date().toISOString(),
    used: false,
  })

  const link = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`

  // Send email if contact has an email and owner has Gmail connected
  if (contactEmail) {
    try {
      const userSnap = await adminDb.collection('users').doc(ownerUid).get()
      const userData = userSnap.data()
      const gc = userData?.googleCalendar

      if (gc?.connected && gc?.accessToken) {
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
            await adminDb.collection('users').doc(ownerUid).update(update)
          }
        })

        const gmail = google.gmail({ version: 'v1', auth: oauth2Client })
        const html = buildInviteEmail({
          contactName: contactName || contactEmail,
          ownerEmail: gc.email,
          link,
        })

        const inviteSubject = `=?UTF-8?B?${Buffer.from("You've been invited to connect your calendar", 'utf-8').toString('base64')}?=`
        const lines = [
          `From: ${gc.email}`,
          `To: ${contactEmail}`,
          `Subject: ${inviteSubject}`,
          'MIME-Version: 1.0',
          'Content-Type: text/html; charset=UTF-8',
          '',
          html,
        ]
        const raw = Buffer.from(lines.join('\r\n'))
          .toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '')

        await gmail.users.messages.send({
          userId: 'me',
          requestBody: { raw },
        })
      }
    } catch (err) {
      console.error('Failed to send invite email:', err)
      // Don't fail the whole request — still return the link
    }
  }

  return NextResponse.json({ link, emailSent: !!contactEmail })
}
