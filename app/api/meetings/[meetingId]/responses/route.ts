import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  const { meetingId } = await params
  if (!meetingId) return NextResponse.json({ error: 'Missing meetingId' }, { status: 400 })

  const snap = await adminDb
    .collection('publicMeetings')
    .doc(meetingId)
    .collection('responses')
    .orderBy('submittedAt', 'asc')
    .get()

  const responses = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  return NextResponse.json({ responses })
}
