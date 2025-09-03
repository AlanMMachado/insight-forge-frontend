"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface LoadingContextType {
  isLoading: boolean
  loadingMessage: string
  showLoading: (message?: string) => void
  hideLoading: () => void
  setLoadingMessage: (message: string) => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function useLoading() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}

interface LoadingProviderProps {
  children: ReactNode
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('Carregando...')

  const showLoading = useCallback((message = 'Carregando...') => {
    setLoadingMessage(message)
    setIsLoading(true)
  }, [])

  const hideLoading = useCallback(() => {
    setIsLoading(false)
  }, [])

  const updateLoadingMessage = useCallback((message: string) => {
    setLoadingMessage(message)
  }, [])

  const value: LoadingContextType = {
    isLoading,
    loadingMessage,
    showLoading,
    hideLoading,
    setLoadingMessage: updateLoadingMessage,
  }

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  )
}
