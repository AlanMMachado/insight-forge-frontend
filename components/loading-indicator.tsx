"use client"

import React from 'react'
import { useLoading } from '@/contexts/loading-context'
import { Loader2 } from 'lucide-react'

export function LoadingIndicator() {
  const { isLoading, loadingMessage } = useLoading()

  if (!isLoading) return null

  return (
    <>
      {/* Versão discreta - barra no topo */}
      <div className="fixed top-0 left-0 right-0 z-[9999]">
        {/* Barra de progresso animada */}
        <div className="h-1 bg-gradient-to-r from-[#FFD300] to-[#E6BD00] animate-pulse">
          <div 
            className="h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"
            style={{
              animation: 'loading-shimmer 1.5s ease-in-out infinite'
            }}
          />
        </div>
      </div>

      {/* Indicador sutil no canto inferior direito */}
      <div className="fixed bottom-6 right-6 z-[9999]">
        <div className="flex items-center gap-3 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-gray-200/50">
          <Loader2 className="w-4 h-4 text-[#FFD300] animate-spin" />
          <span className="text-sm font-medium text-gray-700">
            {loadingMessage}
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes loading-shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </>
  )
}
