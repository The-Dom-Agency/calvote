import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

// GET — list all promo codes
export async function GET() {
  const snap = await adminDb.collection('promoCodes').orderBy('createdAt', 'desc').get()
  const promos = snap.docs.map(d => {
    const data = d.data()
    return {
      id: d.id,
      code: data.code,
      plan: data.plan,
      isActive: data.isActive ?? true,
      maxUses: data.maxUses ?? 1,
      usedCount: data.usedCount ?? (Array.isArray(data.usedBy) ? data.usedBy.length : (data.usedBy ? 1 : 0)),
      usedBy: Array.isArray(data.usedBy) ? data.usedBy : (data.usedBy ? [data.usedBy] : []),
      notes: data.notes ?? '',
      createdAt: data.createdAt ? { seconds: data.createdAt._seconds ?? data.createdAt.seconds } : null,
    }
  })
  return NextResponse.json({ promos })
}

// POST — create a new promo code
export async function POST(req: NextRequest) {
  const { code, plan, maxUses, notes, createdBy } = await req.json()
  if (!code || !plan) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  await adminDb.collection('promoCodes').doc(code).set({
    code,
    plan,
    isActive: true,
    maxUses: maxUses ?? 1,
    usedCount: 0,
    usedBy: [],
    notes: notes ?? '',
    createdBy: createdBy ?? '',
    createdAt: FieldValue.serverTimestamp(),
  })

  return NextResponse.json({ success: true })
}

// PATCH — toggle active
export async function PATCH(req: NextRequest) {
  const { id, isActive } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  await adminDb.collection('promoCodes').doc(id).update({ isActive })
  return NextResponse.json({ success: true })
}

// DELETE — remove a promo code
export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  await adminDb.collection('promoCodes').doc(id).delete()
  return NextResponse.json({ success: true })
}
