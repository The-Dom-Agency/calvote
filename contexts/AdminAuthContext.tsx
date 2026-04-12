'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signOut, type User } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { useRouter, usePathname } from 'next/navigation'
import { SEEDED_ADMINS, type AdminRole } from '@/lib/admin-config'

export type AdminData = {
  uid: string
  email: string
  displayName: string
  role: AdminRole
  invitedBy?: string
  joinedAt?: string
}

type AdminAuthContextType = {
  user: User | null
  adminData: AdminData | null
  loading: boolean
  logout: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthContextType>({} as AdminAuthContextType)

const ADMIN_PUBLIC = (path: string) =>
  path === '/admin/login' || path.startsWith('/admin/join')

async function seedAdminIfNeeded(user: User): Promise<AdminData | null> {
  const email = user.email ?? ''
  const seededRole = SEEDED_ADMINS[email]
  const ref = doc(db, 'adminTeam', user.uid)
  const snap = await getDoc(ref)

  if (snap.exists()) {
    return { uid: user.uid, ...(snap.data() as Omit<AdminData, 'uid'>) }
  }

  if (seededRole) {
    const record: Omit<AdminData, 'uid'> = {
      email,
      displayName: user.displayName ?? '',
      role: seededRole,
      joinedAt: new Date().toISOString(),
    }
    await setDoc(ref, { ...record, seeded: true, createdAt: serverTimestamp() })
    return { uid: user.uid, ...record }
  }

  return null
}

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]           = useState<User | null>(null)
  const [adminData, setAdminData] = useState<AdminData | null>(null)
  const [loading, setLoading]     = useState(true)
  const router   = useRouter()
  const pathname = usePathname()

  const logout = async () => {
    await signOut(auth)
    setUser(null)
    setAdminData(null)
    router.replace('/admin/login')
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const admin = await seedAdminIfNeeded(firebaseUser)
        if (admin) {
          setUser(firebaseUser)
          setAdminData(admin)
          if (ADMIN_PUBLIC(pathname)) {
            router.replace('/admin')
          }
        } else {
          // Signed in but not an admin — boot back to admin login
          await signOut(auth)
          setUser(null)
          setAdminData(null)
          if (!ADMIN_PUBLIC(pathname)) {
            router.replace('/admin/login')
          }
        }
      } else {
        setUser(null)
        setAdminData(null)
        if (!ADMIN_PUBLIC(pathname)) {
          router.replace('/admin/login')
        }
      }

      setLoading(false)
    })

    return unsub
  }, [pathname])

  return (
    <AdminAuthContext.Provider value={{ user, adminData, loading, logout }}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-[#1C2B3A]">
          <div className="w-8 h-8 border-2 border-[#1A5C52] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        children
      )}
    </AdminAuthContext.Provider>
  )
}

export const useAdminAuth = () => useContext(AdminAuthContext)
