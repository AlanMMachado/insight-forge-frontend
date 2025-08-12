import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rotas que não precisam de autenticação
const publicRoutes = ['/login', '/register', '/unauthorized']

// Rotas que são apenas para usuários não autenticados
const authRoutes = ['/login', '/register']

// Rotas que precisam de roles específicos
const roleBasedRoutes: Record<string, string[]> = {
  '/admin': ['ADMIN'],
  // Adicione mais rotas conforme necessário
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('token')?.value

  // Se for uma rota pública, permite acesso
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Se não tem token e não é rota pública, redireciona para login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Se tem token e está tentando acessar rotas de auth, redireciona para dashboard
  if (authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // TODO: Aqui você pode decodificar o JWT para verificar roles
  // Por enquanto, permite acesso a todas as rotas autenticadas
  
  return NextResponse.next()
}

// Configure em quais rotas o middleware deve executar
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
