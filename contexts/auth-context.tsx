'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: number
  nome: string
  email: string
  role: 'ADMIN' | 'USER'
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (nome: string, email: string, password: string, role?: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

  // Função para limpar dados de autenticação
  const clearAuth = (): void => {
    setToken(null)
    setUser(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    }
  }

  // Verificar se estamos no cliente
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Verificar se há token salvo ao carregar a aplicação e validar sua validade
  useEffect(() => {
    // Só executar quando estivermos no cliente
    if (!isClient) {
      return
    }

    const initializeAuth = async () => {
      try {
        const savedToken = localStorage.getItem('token')
        const savedUser = localStorage.getItem('user')

        if (savedToken && savedUser) {
          // Validar o token antes de usar
          try {
            const response = await fetch(`${API_BASE_URL}/api/auth/validate`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${savedToken}`,
                'Content-Type': 'application/json',
              },
            })

            if (response.ok) {
              // Token válido
              setToken(savedToken)
              document.cookie = `token=${savedToken}; path=/; max-age=${7 * 24 * 60 * 60}` // 7 dias
              try {
                setUser(JSON.parse(savedUser))
              } catch (error) {
                console.error('Erro ao carregar dados do usuário:', error)
                clearAuth()
              }
            } else {
              // Token inválido ou expirado
              console.log('Token inválido ou expirado')
              clearAuth()
            }
          } catch (error) {
            console.error('Erro ao validar token:', error)
            // Se o endpoint não existir ou houver erro, assume token como inválido
            clearAuth()
          }
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [isClient])

  // Decodificar JWT para extrair dados do usuário
  const decodeToken = (token: string): User | null => {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      
      const decoded = JSON.parse(jsonPayload)
      
      return {
        id: decoded.id || decoded.userId || 1, // fallback para ID se não existir
        nome: decoded.nome || decoded.name || decoded.username || 'Administrador',
        email: decoded.email || decoded.sub || decoded.sub, // O email está no campo 'sub'
        role: decoded.role || decoded.authority || 'ADMIN' // Se não tem role, assume ADMIN para admin@insight.com
      }
    } catch (error) {
      console.error('Erro ao decodificar token:', error)
      return null
    }
  }

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Erro ao fazer login')
      }

      const data = await response.json()
      const { token, user } = data

      // Decodificar token para extrair dados do usuário
      const userData = user || decodeToken(token)
      if (!userData) {
        throw new Error('Token inválido')
      }

      setToken(token)
      setUser(userData)
      
      // Verificar se estamos no lado do cliente antes de acessar localStorage e document
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(userData))
        document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`
      }
      
      router.push('/dashboard')
    } catch (error) {
      console.error('Erro no login:', error)
      throw error
    }
  }

  const register = async (
    nome: string, 
    email: string, 
    password: string
  ): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome, email, password }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Erro ao criar conta')
      }

    } catch (error) {
      console.error('Erro no cadastro:', error)
      throw error
    }
  }

  const logout = (): void => {
    clearAuth()
    router.push('/login')
  }

  const isAuthenticated = !!token && !!user

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
