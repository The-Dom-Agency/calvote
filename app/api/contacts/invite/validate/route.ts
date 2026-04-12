import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ valid: false })

  const snap = await adminDb.collection('invites').doc(token).get()
  if (!snap.exists || snap.data()?.used) {
    return NextResponse.json({ valid: false })
  }
  return NextResponse.json({ valid: true })
}
