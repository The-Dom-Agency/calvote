import { google } from 'googleapis'
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
)

const APP_URL = process.env.NEXT_PUBLIC_APP_URL

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state') ?? ''

  if (!code) {
    return NextResponse.redirect(`${APP_URL}/dashboard?error=calendar_auth_failed`)
  }

  try {
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
    const { data: profile } = await oauth2.userinfo.get()

    // --- Contact invite flow ---
    if (state.startsWith('invite:')) {
      const token = state.replace('invite:', '')
      const inviteSnap = await adminDb.collection('invites').doc(token).get()

      if (!inviteSnap.exists || inviteSnap.data()?.used) {
        return NextResponse.redirect(`${APP_URL}/invite/${token}?error=expired`)
      }

      const { ownerUid, contactId } = inviteSnap.data()!

      // Save tokens to the contact document
      await adminDb
        .collection('users').doc(ownerUid)
        .collection('contacts').doc(contactId)
        .update({
          calendarLinked: true,
          calendarEmail: profile.email,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiryDate: tokens.expiry_date,
          connectedAt: new Date().toISOString(),
        })

      // Mark invite as used
      await adminDb.collection('invites').doc(token).update({ used: true })

      return NextResponse.redirect(`${APP_URL}/invite/${token}?success=1`)
    }

    // --- Regular user flow ---
    const uid = state
    if (!uid) {
      return NextResponse.redirect(`${APP_URL}/dashboard?error=calendar_auth_failed`)
    }

    await adminDb.collection('users').doc(uid).update({
      googleCalendar: {
        connected: true,
        email: profile.email,
        hd: profile.hd ?? null,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: tokens.expiry_date,
        connectedAt: new Date().toISOString(),
      },
    })

    return NextResponse.redirect(`${APP_URL}/dashboard?calendar=connected`)
  } catch (err) {
    console.error('Google Calendar OAuth error:', err)
    return NextResponse.redirect(`${APP_URL}/dashboard?error=calendar_token_failed`)
  }
}
