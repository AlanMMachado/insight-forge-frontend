"use client"

import { Badge } from "@/components/ui/badge"
import { BarChart3 } from "lucide-react"

export function DashboardHeader() {
  return (
    <div className="bg-gradient-to-r from-white to-[#FFFDF0] p-4 sm:p-6 rounded-2xl border border-[#FFD300]/20 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <div className="p-3 bg-gradient-to-br from-[#FFD300] to-[#E6BD00] rounded-xl shadow-md">
          <BarChart3 className="h-8 w-8 text-[#0C0C0C]" />
        </div>
        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0C0C0C]">Dashboard</h1>
            <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-sm">
              <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
              Ao Vivo
            </Badge>
          </div>
          <p className="text-gray-600 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#FFD300] rounded-full"></span>
            Visão geral do seu negócio
          </p>
        </div>
      </div>
    </div>
  )
}
