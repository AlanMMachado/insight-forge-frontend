'use client'

import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface RequireAuthProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export default function RequireAuth({ children, allowedRoles }: RequireAuthProps) {
  const { isAuthenticated, user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
      return
    }

    if (!isLoading && isAuthenticated && allowedRoles && user) {
      const hasPermission = allowedRoles.includes(user.role)
      if (!hasPermission) {
        router.push('/unauthorized')
        return
      }
    }
  }, [isAuthenticated, user, isLoading, allowedRoles, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null
  }

  return <>{children}</>
}
