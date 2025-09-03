"use client"

import { useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useLoading } from '@/contexts/loading-context'

export function usePageLoading() {
  const { showLoading, hideLoading } = useLoading()
  const router = useRouter()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Função para navegar com loading
  const navigateWithLoading = useCallback((
    path: string, 
    message = 'Carregando página...'
  ) => {
    showLoading(message)
    
    // Timeout de segurança reduzido para versão discreta
    timeoutRef.current = setTimeout(() => {
      hideLoading()
    }, 3000)
    
    router.push(path)
  }, [router, showLoading, hideLoading])

  // Função para executar operação com loading
  const withLoading = useCallback(async <T>(
    operation: () => Promise<T>,
    message = 'Processando...'
  ): Promise<T> => {
    showLoading(message)
    
    try {
      const result = await operation()
      return result
    } finally {
      hideLoading()
    }
  }, [showLoading, hideLoading])

  // Limpar timeout ao desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Esconder loading quando a página carregar
  useEffect(() => {
    const handleRouteComplete = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      hideLoading()
    }

    // Esconder loading após um delay menor para versão discreta
    const hideLoadingTimeout = setTimeout(handleRouteComplete, 50)

    return () => {
      clearTimeout(hideLoadingTimeout)
    }
  }, [hideLoading])

  return {
    navigateWithLoading,
    withLoading,
    showLoading,
    hideLoading,
  }
}
