"use client"

import { PageHeader } from "@/components/page-header"
import { BarChart3 } from "lucide-react"

export function DashboardHeader() {
  return (
    <PageHeader
      icon={<BarChart3 className="h-8 w-8 text-[#0C0C0C]" />}
      title="Dashboard"
      description="Visão geral do seu negócio"
      badge={{
        label: "Ao Vivo",
        variant: "live"
      }}
    />
  )
}
