'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signOut, type User } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
// AdminData type and seedAdminIfNeeded moved to AdminAuthContext
import { auth, db } from '@/lib/firebase'
import { useRouter, usePathname } from 'next/navigation'
export type Plan = 'free' | 'starter' | 'growth' | 'scale'

export const PLAN_LABELS: Record<Plan, string> = {
  free: 'No Plan',
  starter: 'Starter — up to 500 meetings/mo',
  growth: 'Growth — up to 1,000 meetings/mo',
  scale: 'Scale — up to 2,000 meetings/mo',
}

export const PLAN_LIMITS: Record<Plan, number> = {
  free: 0,
  starter: 500,
  growth: 1000,
  scale: 2000,
}

export type UserData = {
  uid: string
  email: string
  displayName: string
  plan: Plan
  meetingsUsed: number
  promoUsed?: string
  googleCalendar?: { connected: boolean; email?: string }
}

type AuthContextType = {
  user: User | null
  userData: UserData | null
  loading: boolean
  refreshUserData: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

const ALWAYS_ALLOWED = (path: string) =>
  path === '/' || path === '/login' || path === '/privacy' || path === '/terms' ||
  path.startsWith('/admin') || path.startsWith('/availability')


async function fetchOrCreateUser(user: User): Promise<UserData> {
  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)

  if (!snap.exists()) {
    const fresh: Omit<UserData, 'uid'> = {
      email: user.email ?? '',
      displayName: user.displayName ?? '',
      plan: 'free',
      meetingsUsed: 0,
    }
    await setDoc(ref, { ...fresh, createdAt: serverTimestamp() })
    return { uid: user.uid, ...fresh }
  }

  return { uid: user.uid, ...(snap.data() as Omit<UserData, 'uid'>) }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const refreshUserData = async () => {
    if (!user) return
    const data = await fetchOrCreateUser(user)
    setUserData(data)
  }

  const logout = async () => {
    await signOut(auth)
    setUser(null)
    setUserData(null)
    router.replace('/login')
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        const data = await fetchOrCreateUser(firebaseUser)
        setUserData(data)

        // After login on public pages, redirect to the app
        if (pathname === '/login' || pathname === '/') {
          router.replace(data.plan === 'free' ? '/activate' : '/dashboard')
        } else if (!ALWAYS_ALLOWED(pathname)) {
          if (data.plan === 'free' && pathname !== '/activate') {
            router.replace('/activate')
          } else if (data.plan !== 'free' && pathname === '/activate') {
            router.replace('/dashboard')
          }
        }
      } else {
        setUser(null)
        setUserData(null)
        if (!ALWAYS_ALLOWED(pathname)) {
          router.replace('/login')
        }
      }

      setLoading(false)
    })

    return unsub
  }, [pathname])

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        refreshUserData,
        logout,
      }}
    >
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#1A5C52] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#6B7280]">Loading calvote...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
