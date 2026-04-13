import { google } from 'googleapis'
import { NextResponse } from 'next/server'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI, // e.g. https://calvote.ai/api/google-calendar/callback
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const state = searchParams.get('state') ?? ''

  const scopes = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events.readonly',
    'https://www.googleapis.com/auth/directory.readonly', // org contacts
    'https://www.googleapis.com/auth/gmail.send',
    'openid',
    'email',
    'profile',
  ]

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent', // force refresh token
    state, // pass uid back through OAuth flow
  })

  return NextResponse.redirect(url)
}
