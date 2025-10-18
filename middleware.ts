import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rotas que não precisam de autenticação
const publicRoutes = ['/login', '/register', '/unauthorized', '/']

// Rotas que são apenas para usuários não autenticados
const authRoutes = ['/login', '/register']

/**
 * Middleware para proteger rotas e garantir autenticação
 * - Rota raiz (/) redireciona para login se não autenticado
 * - Rotas públicas: /login, /register, /unauthorized, /
 * - Rotas autenticadas: dashboard, produtos, movimentacoes, etc.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('token')?.value

  // Se é rota pública, permite acesso
  if (publicRoutes.includes(pathname)) {
    // Se é rota de auth e tem token, redireciona para dashboard
    if (authRoutes.includes(pathname) && token) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // Se não tem token e não é rota pública, redireciona para login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Token existe, permite acesso
  return NextResponse.next()
}

// Configure em quais rotas o middleware deve executar
export const config = {
  matcher: [
    // Executa em todas as rotas exceto as estáticas
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
