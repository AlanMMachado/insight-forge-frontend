'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Se ainda está carregando, não fazer nada
    if (isLoading) {
      return
    }

    // Se autenticado, ir para dashboard
    if (isAuthenticated) {
      router.push('/dashboard')
    } else {
      // Se não autenticado, ir para login
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  // Sempre mostrar loading enquanto verifica autenticação
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#FFD300]/10 to-[#FFD300]/5">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FFD300]/30 border-t-[#FFD300]"></div>
        <p className="text-sm text-gray-600">Carregando...</p>
      </div>
    </div>
  )
}

