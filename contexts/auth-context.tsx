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
  const router = useRouter()

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

  // Verificar se há token salvo ao carregar a aplicação
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (savedToken && savedUser) {
      setToken(savedToken)
      // Salvar token no cookie também para o middleware
      document.cookie = `token=${savedToken}; path=/; max-age=${7 * 24 * 60 * 60}` // 7 dias
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      }
    }
    setIsLoading(false)
  }, [])

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
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
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
      const { token } = data

      // Decodificar token para extrair dados do usuário
      const userData = decodeToken(token)
      if (!userData) {
        throw new Error('Token inválido')
      }

      // Salvar no estado e localStorage
      setToken(token)
      setUser(userData)
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      // Salvar token no cookie também para o middleware
      document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}` // 7 dias

      router.push('/dashboard')
    } catch (error) {
      console.error('Erro no login:', error)
      throw error
    }
  }

  const register = async (
    nome: string, 
    email: string, 
    password: string, 
    role: string = 'USER'
  ): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/usuarios/registrarUser`, {
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

      // Após registro bem-sucedido, redireciona para login
      router.push('/login')
    } catch (error) {
      console.error('Erro no cadastro:', error)
      throw error
    }
  }

  const logout = (): void => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    // Remove token do cookie
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
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
