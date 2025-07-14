"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Package, DollarSign } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { memo } from "react"

const metrics = [
  {
    title: "Vendas Mês",
    value: "R$ 45.2K",
    change: "+12%",
    trend: "up" as const,
    icon: DollarSign,
    description: "Receita total do mês atual",
  },
  {
    title: "Produtos Ativos",
    value: "1,247",
    change: "+5%",
    trend: "up" as const,
    icon: Package,
    description: "Produtos disponíveis no estoque",
  },
  {
    title: "Margem Lucro",
    value: "23.5%",
    change: "-2%",
    trend: "down" as const,
    icon: TrendingUp,
    description: "Margem de lucro média",
  },
  {
    title: "Estoque Baixo",
    value: "18",
    change: "+3",
    trend: "down" as const,
    icon: TrendingDown,
    description: "Produtos com estoque crítico",
  },
]

interface MetricCardProps {
  metric: (typeof metrics)[0]
  isLoading?: boolean
}

const MetricCard = memo(function MetricCard({ metric, isLoading = false }: MetricCardProps) {
  if (isLoading) {
    return (
      <Card className="p-6 bg-white border-0 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="w-12 h-12 rounded-lg" />
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4 sm:p-6 bg-white border-0 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-[#9A9A9A] text-sm font-medium truncate">{metric.title}</p>
            <div className="group-hover:opacity-100 opacity-0 transition-opacity duration-200">
              <div className="w-1 h-1 bg-[#CFCFCF] rounded-full" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#000000] mb-3 group-hover:text-[#FFD300] transition-colors duration-200">
            {metric.value}
          </p>
          <div className="flex items-center gap-2">
            {metric.trend === "up" ? (
              <TrendingUp className="w-4 h-4 text-green-500 flex-shrink-0" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500 flex-shrink-0" />
            )}
            <span className={`text-sm font-medium ${metric.trend === "up" ? "text-green-500" : "text-red-500"}`}>
              {metric.change}
            </span>
            <span className="text-xs text-[#CFCFCF] hidden sm:inline">vs mês anterior</span>
          </div>
        </div>
        <div className="p-3 bg-[#F8F8F8] rounded-xl ml-4 flex-shrink-0 group-hover:bg-[#FFD300] group-hover:scale-110 transition-all duration-200">
          <metric.icon className="w-6 h-6 text-[#9A9A9A] group-hover:text-[#0C0C0C]" />
        </div>
      </div>
      <p className="text-xs text-[#CFCFCF] mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {metric.description}
      </p>
    </Card>
  )
})

interface MetricsGridProps {
  isLoading?: boolean
}

export function MetricsGrid({ isLoading = false }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {metrics.map((metric) => (
        <MetricCard key={metric.title} metric={metric} isLoading={isLoading} />
      ))}
    </div>
  )
}
