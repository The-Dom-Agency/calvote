import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  const { meetingId } = await params
  if (!meetingId) return NextResponse.json({ error: 'Missing meetingId' }, { status: 400 })

  const snap = await adminDb.collection('publicMeetings').doc(meetingId).get()
  if (!snap.exists) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })

  return NextResponse.json({ id: snap.id, ...snap.data() })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  const { meetingId } = await params
  const { attendeeName, selectedSlots } = await req.json()

  if (!meetingId || !attendeeName || !selectedSlots) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  await adminDb.collection('publicMeetings').doc(meetingId).collection('responses').add({
    attendeeName,
    selectedSlots,
    submittedAt: new Date().toISOString(),
  })

  return NextResponse.json({ success: true })
}
