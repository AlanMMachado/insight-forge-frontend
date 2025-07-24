"use client"

import { BarChart3, Settings, TrendingUp, FileText, Home, Package } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
    title: "Relatórios",
    url: "/relatorios",
    icon: FileText,
  },
  {
    title: "Projeções",
    url: "/projecoes",
    icon: TrendingUp,
  },
  {
    title: "Configurações",
    url: "/configuracoes",
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" className="bg-[#0C0C0C] border-r-0">
      <SidebarHeader className="p-6 group-data-[collapsible=icon]:p-4">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <div className="flex items-center justify-center w-8 h-8 bg-[#FFD300] rounded flex-shrink-0">
            <BarChart3 className="w-5 h-5 text-[#0C0C0C]" />
          </div>
          <span className="text-white font-bold text-lg group-data-[collapsible=icon]:hidden">InsightForge</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-4 group-data-[collapsible=icon]:px-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.url}
                tooltip={item.title}
                className="text-white hover:bg-[#1A1A1A] hover:text-[#FFD300] data-[active=true]:bg-[#FFD300] data-[active=true]:text-[#0C0C0C] data-[active=true]:font-medium transition-colors duration-200"
              >
                <Link href={item.url}>
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="group-data-[collapsible=icon]:sr-only">{item.title}</span>
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
