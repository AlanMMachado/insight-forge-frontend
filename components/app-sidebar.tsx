"use client"

import { BarChart3, MoveHorizontal, Home, Package, Users, Upload } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Produtos",
    url: "/produtos",
    icon: Package,
  },
  {
    title: "Movimentações",
    url: "/movimentacoes",
    icon: MoveHorizontal,
  },
  {
    title: "Importar Dados",
    url: "/importar-dados",
    icon: Upload,
  },
  {
    title: "Usuários",
    url: "/usuarios",
    icon: Users,
    adminOnly: true, // Apenas administradores podem ver este item
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  // Filtrar itens do menu baseado na role do usuário
  const filteredMenuItems = menuItems.filter(item => {
    if (item.adminOnly) {
      return user?.role === 'ADMIN'
    }
    return true
  })

  return (
  <Sidebar collapsible="icon" className="bg-sidebar border-r-0 transition-all duration-200">
      <SidebarHeader className="p-8 group-data-[collapsible=icon]:p-6">
        <div className="flex items-center gap-4 group-data-[collapsible=icon]:justify-center">
          <div className="flex items-center justify-center w-12 h-12 bg-amber-400 rounded flex-shrink-0 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10">
            <BarChart3 className="w-8 h-8 text-gray-900 group-data-[collapsible=icon]:w-6 group-data-[collapsible=icon]:h-6" />
          </div>
          <span className="text-white font-bold text-xl group-data-[collapsible=icon]:hidden">InsightForge</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-6 group-data-[collapsible=icon]:px-3 flex flex-col">
        <SidebarMenu className="flex-1 flex flex-col justify-start gap-3 mt-4">
          {filteredMenuItems.map((item) => (
            <SidebarMenuItem key={item.title} className="px-0 py-1">
              <SidebarMenuButton
                asChild
                isActive={pathname === item.url}
                tooltip={item.title}
                className="text-white hover:bg-sidebar-accent hover:text-amber-400 data-[active=true]:bg-amber-400 data-[active=true]:text-gray-900 data-[active=true]:font-medium transition-colors duration-200 py-4 px-4 group-data-[collapsible=icon]:px-3 rounded-lg min-h-[3rem] group-data-[collapsible=icon]:justify-center"
              >
                <Link href={item.url} className="flex items-center gap-4 w-full">
                  <item.icon className="w-6 h-6 flex-shrink-0 group-data-[collapsible=icon]:w-6 group-data-[collapsible=icon]:h-6" />
                  <span className="text-base font-medium group-data-[collapsible=icon]:sr-only">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
