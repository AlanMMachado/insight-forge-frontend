"use client"

import React from 'react'
import { useLoading } from '@/contexts/loading-context'
import { Loader2 } from 'lucide-react'

export function MinimalLoadingIndicator() {
  const { isLoading } = useLoading()

  if (!isLoading) return null

  return (
    <>
      {/* Apenas uma barra fina no topo */}
      <div className="fixed top-0 left-0 right-0 z-[9999] h-0.5 bg-[#FFD300] animate-pulse">
        <div 
          className="h-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
          style={{
            animation: 'loading-slide 1s ease-in-out infinite'
          }}
        />
      </div>

      {/* Pequeno spinner no canto superior direito */}
      <div className="fixed top-4 right-4 z-[9999]">
        <Loader2 className="w-5 h-5 text-[#FFD300] animate-spin opacity-80" />
      </div>

      <style jsx>{`
        @keyframes loading-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </>
  )
}
