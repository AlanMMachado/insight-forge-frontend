"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Download, Filter } from "lucide-react"
import { useState } from "react"

export function DashboardHeader() {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 2000)
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#000000]">Dashboard</h1>
          <Badge variant="secondary" className="bg-[#FFD300] text-[#0C0C0C] hover:bg-[#E6BD00]">
            Ao Vivo
          </Badge>
        </div>
        <p className="text-sm text-[#9A9A9A]">Visão geral do seu negócio • Última atualização: há 5 minutos</p>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="border-[#CFCFCF] text-[#9A9A9A] hover:bg-[#F8F8F8] flex-1 sm:flex-none bg-transparent"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Atualizar
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="border-[#CFCFCF] text-[#9A9A9A] hover:bg-[#F8F8F8] flex-1 sm:flex-none bg-transparent"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filtros
        </Button>

        <Button size="sm" className="bg-[#FFD300] text-[#0C0C0C] hover:bg-[#E6BD00] font-medium flex-1 sm:flex-none">
          <Download className="w-4 h-4 mr-2" />
          Exportar
        </Button>
      </div>
    </div>
  )
}
