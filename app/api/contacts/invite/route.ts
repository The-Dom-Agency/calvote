import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

function randomToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(24)))
    .map(b => b.toString(36).padStart(2, '0'))
    .join('')
    .slice(0, 32)
}

export async function POST(req: NextRequest) {
  const { ownerUid, contactId, contactEmail } = await req.json()
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
  return NextResponse.json({ link })
}
