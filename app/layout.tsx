import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { LoadingProvider } from "@/contexts/loading-context"
import { LoadingIndicator } from "@/components/loading-indicator"
import { ApiLoadingSetup } from "@/components/api-loading-setup"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Insight Forge - Dashboard de Análise de Estoque",
  description: "Sistema de apoio à decisão para análise de estoque e projeções de vendas",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <LoadingProvider>
          <ApiLoadingSetup />
          <AuthProvider>
            {children}
            <LoadingIndicator />
            <Toaster />
          </AuthProvider>
        </LoadingProvider>
      </body>
    </html>
  )
}
