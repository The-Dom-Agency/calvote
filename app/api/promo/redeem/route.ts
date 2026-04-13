import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export async function POST(req: NextRequest) {
  try {
    const { code, uid } = await req.json()

    if (!code || !uid) {
      return NextResponse.json({ error: 'Missing code or uid' }, { status: 400 })
    }

    const normalizedCode = code.trim().toUpperCase()
    const promoRef = adminDb.collection('promoCodes').doc(normalizedCode)
    const userRef = adminDb.collection('users').doc(uid)

    // Use a transaction to prevent race conditions
    const result = await adminDb.runTransaction(async (tx) => {
      const promoSnap = await tx.get(promoRef)

      if (!promoSnap.exists) {
        return { error: 'Invalid promo code. Please check and try again.' }
      }

      const promo = promoSnap.data()!

      if (!promo.isActive) {
        return { error: 'This promo code has been deactivated.' }
      }

      const usedBy: string[] = Array.isArray(promo.usedBy) ? promo.usedBy : (promo.usedBy ? [promo.usedBy] : [])
      const usedCount: number = promo.usedCount ?? usedBy.length
      const maxUses: number = promo.maxUses ?? 1

      // Check if user already used this code
      if (usedBy.includes(uid)) {
        return { error: 'You have already used this promo code.' }
      }

      // Check if code has hit its usage limit
      if (maxUses !== -1 && usedCount >= maxUses) {
        return { error: 'This promo code has reached its usage limit.' }
      }

      const newUsedCount = usedCount + 1
      const nowExhausted = maxUses !== -1 && newUsedCount >= maxUses

      // Update promo: increment count, add uid to usedBy array, deactivate if exhausted
      tx.update(promoRef, {
        usedBy: FieldValue.arrayUnion(uid),
        usedCount: FieldValue.increment(1),
        ...(nowExhausted ? { isActive: false } : {}),
      })

      // Update user's plan
      tx.update(userRef, {
        plan: promo.plan,
        promoUsed: normalizedCode,
        activatedAt: FieldValue.serverTimestamp(),
      })

      return { success: true, plan: promo.plan }
    })

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true, plan: result.plan })
  } catch (err) {
    console.error('Promo redeem error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
