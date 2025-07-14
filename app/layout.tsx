import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"

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
        <SidebarProvider defaultOpen={true}>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b border-[#CFCFCF] px-4 bg-white">
              <SidebarTrigger className="-ml-1 text-[#000000] hover:bg-[#F8F8F8]" />
              <div className="h-4 w-px bg-[#CFCFCF]" />
              <h2 className="text-lg font-semibold text-[#000000]">Insight Forge</h2>
            </header>
            <main className="flex-1 bg-[#F8F8F8] min-h-screen overflow-auto">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  )
}
