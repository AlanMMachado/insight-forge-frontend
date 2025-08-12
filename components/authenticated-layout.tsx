'use client'

import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import RequireAuth from "@/components/require-auth"
import { LogOut, User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AuthenticatedLayoutProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export default function AuthenticatedLayout({ children, allowedRoles }: AuthenticatedLayoutProps) {
  const { user, logout } = useAuth()

  return (
    <RequireAuth allowedRoles={allowedRoles}>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-[#CFCFCF] px-4 bg-white">
            <SidebarTrigger className="-ml-1 text-[#000000] hover:bg-[#F8F8F8]" />
            <div className="h-4 w-px bg-[#CFCFCF]" />
            <h2 className="text-lg font-semibold text-[#000000]">Insight Forge</h2>
            
            <div className="ml-auto flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.nome}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        Role: {user?.role}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 bg-[#F8F8F8] min-h-screen overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </RequireAuth>
  )
}
