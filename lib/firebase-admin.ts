import { initializeApp, getApps, cert, type App } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Lazily initialized — only runs in API routes, never at build time
let adminApp: App | null = null

function getAdminApp(): App {
  if (adminApp) return adminApp

  const existing = getApps().find(a => a.name === 'admin')
  if (existing) {
    adminApp = existing
    return adminApp
  }

  const serviceAccount = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT
  if (!serviceAccount) {
    throw new Error('FIREBASE_ADMIN_SERVICE_ACCOUNT env var is not set.')
  }

  adminApp = initializeApp(
    { credential: cert(JSON.parse(serviceAccount)) },
    'admin',
  )
  return adminApp
}

export const adminDb = {
  collection: (path: string) => getFirestore(getAdminApp()).collection(path),
}
