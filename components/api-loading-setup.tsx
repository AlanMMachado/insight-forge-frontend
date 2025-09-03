"use client"

import { useEffect } from 'react'
import { useLoading } from '@/contexts/loading-context'
import { setLoadingFunctions } from '@/lib/api'

export function ApiLoadingSetup() {
  const { showLoading, hideLoading } = useLoading()

  useEffect(() => {
    // Configurar as funções de loading na API
    setLoadingFunctions(showLoading, hideLoading)
  }, [showLoading, hideLoading])

  return null
}
