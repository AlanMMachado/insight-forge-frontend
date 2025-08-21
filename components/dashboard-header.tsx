"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Download, Filter, BarChart3 } from "lucide-react"
import { useState } from "react"

export function DashboardHeader() {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 2000)
  }

  return (
    <div className="bg-gradient-to-r from-white to-[#FFFDF0] p-6 rounded-2xl border border-[#FFD300]/20 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-[#FFD300] to-[#E6BD00] rounded-xl shadow-md">
            <BarChart3 className="h-8 w-8 text-[#0C0C0C]" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-[#0C0C0C]">Dashboard</h1>
              <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-sm">
                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                Ao Vivo
              </Badge>
            </div>
            <p className="text-gray-600 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#FFD300] rounded-full"></span>
              Visão geral do seu negócio • Última atualização: há 5 minutos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="border-[#FFD300]/50 hover:border-[#FFD300] hover:bg-[#FFFDF0] transition-all duration-200 shadow-sm hover:shadow-md flex-1 sm:flex-none rounded-xl"
          >
            <RefreshCw className={`w-4 h-4 mr-2 text-[#0C0C0C] ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? 'Atualizando...' : 'Atualizar'}
          </Button>

          <Button
            variant="outline"
            className="border-[#FFD300]/50 hover:border-[#FFD300] hover:bg-[#FFFDF0] transition-all duration-200 shadow-sm hover:shadow-md flex-1 sm:flex-none rounded-xl"
          >
            <Filter className="w-4 h-4 mr-2 text-[#0C0C0C]" />
            Filtros
          </Button>

          <Button 
            className="bg-gradient-to-r from-[#FFD300] to-[#E6BD00] text-[#0C0C0C] hover:from-[#E6BD00] hover:to-[#FFD300] shadow-md hover:shadow-lg transition-all duration-200 font-medium flex-1 sm:flex-none rounded-xl"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>
    </div>
  )
}
