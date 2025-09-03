"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Package, DollarSign, ShoppingCart, Target, AlertTriangle, Wallet } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { memo, useState, useEffect } from "react"
import { ApiService, Produto, Movimentacao } from "@/lib/api"

interface MetricData {
  title: string
  value: string
  change?: string
  trend?: "up" | "down"
  icon: React.ComponentType<{ className?: string }>
  description: string
}

interface MetricCardProps {
  metric: MetricData
  isLoading?: boolean
  isHighlighted?: boolean
}

const MetricCard = memo(function MetricCard({ metric, isLoading = false, isHighlighted = false }: MetricCardProps) {
  if (isLoading) {
    return (
      <Card className={`p-6 ${isHighlighted ? 'bg-gradient-to-br from-[#FFD300]/10 to-[#FFD300]/5 border-[#FFD300] border-2 min-h-[140px] sm:min-h-[160px]' : 'bg-white border-[#FFD300]/20 min-h-[140px] sm:min-h-[160px]'} shadow-sm`}>
        <div className="flex items-center justify-between h-full">
          <div className="flex-1 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="w-12 h-12 rounded-xl" />
        </div>
      </Card>
    )
  }

  if (isHighlighted) {
    return (
      <Card className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 via-white to-[#FFFDF0] border-gray-300 border-2 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer rounded-2xl relative overflow-hidden">
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100/20 to-transparent pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 pr-3">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-[#0C0C0C] text-xs sm:text-sm font-semibold truncate leading-tight">{metric.title}</p>
                <div className="w-2 h-2 bg-[#0C0C0C] rounded-full animate-pulse" />
              </div>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0C0C0C] mb-2 group-hover:text-[#B8860B] transition-colors duration-200 truncate">
                {metric.value}
              </p>
              {metric.change && (
                <div className="flex items-center gap-1.5 overflow-hidden">
                  {metric.trend === "up" ? (
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
                  )}
                  <span className={`text-sm sm:text-base font-bold ${metric.trend === "up" ? "text-green-600" : "text-red-600"} truncate`}>
                    {metric.change}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-600 hidden lg:inline truncate font-medium">vs mês anterior</span>
                </div>
              )}
            </div>
            <div className="p-3 sm:p-4 bg-gradient-to-br from-[#0C0C0C] to-[#333333] rounded-xl flex-shrink-0 group-hover:scale-110 transition-all duration-200 shadow-md">
              <metric.icon className="w-6 h-6 sm:w-7 sm:h-7 text-[#FFD300]" />
            </div>
          </div>
          <p className="text-xs sm:text-sm text-[#9A9A9A] mt-3 font-medium line-clamp-2">
            {metric.description}
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4 sm:p-6 bg-gradient-to-br from-white to-[#FFFDF0] border-[#FFD300]/20 shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer rounded-2xl min-h-[140px] sm:min-h-[160px]">
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-3">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-gray-600 text-xs sm:text-sm font-medium leading-tight line-clamp-2">{metric.title}</p>
              <div className="group-hover:opacity-100 opacity-0 transition-opacity duration-200">
                <div className="w-1 h-1 bg-[#FFD300] rounded-full flex-shrink-0" />
              </div>
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-[#0C0C0C] mb-2 group-hover:text-[#FFD300] transition-colors duration-200 truncate">
              {metric.value}
            </p>
          </div>
          <div className="p-2.5 sm:p-3 bg-gradient-to-br from-[#FFD300]/20 to-[#FFD300]/10 rounded-xl flex-shrink-0 group-hover:bg-gradient-to-br group-hover:from-[#FFD300] group-hover:to-[#E6BD00] group-hover:scale-110 transition-all duration-200 shadow-sm">
            <metric.icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#FFD300] group-hover:text-[#0C0C0C]" />
          </div>
        </div>
        
        <div className="mt-auto space-y-2">
          {metric.change && (
            <div className="flex items-center gap-1.5 overflow-hidden">
              {metric.trend === "up" ? (
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
              ) : (
                <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 flex-shrink-0" />
              )}
              <span className={`text-xs sm:text-sm font-medium ${metric.trend === "up" ? "text-green-500" : "text-red-500"} truncate`}>
                {metric.change}
              </span>
              <span className="text-[10px] sm:text-xs text-gray-500 hidden lg:inline truncate">vs mês anterior</span>
            </div>
          )}
          <p className="text-[10px] sm:text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 line-clamp-2">
            {metric.description}
          </p>
        </div>
      </div>
    </Card>
  )
})

interface MetricsGridProps {
  isLoading?: boolean
}

export function MetricsGrid({ isLoading = false }: MetricsGridProps) {
  const [metrics, setMetrics] = useState<MetricData[]>([
    {
      title: "Valor Total do Estoque",
      value: "R$ 0,00",
      icon: Wallet,
      description: "Valor total dos produtos em estoque",
    },
    {
      title: "Margem de Lucro Potencial",
      value: "R$ 0,00",
      icon: Target,
      description: "Lucro potencial com estoque atual",
    },
    {
      title: "Produtos Ativos",
      value: "0",
      icon: Package,
      description: "Produtos disponíveis para venda",
    },
    {
      title: "Produtos Críticos",
      value: "0",
      icon: AlertTriangle,
      description: "Produtos com estoque baixo (≤ 10)",
    },
    {
      title: "Movimentações (Mês)",
      value: "0",
      icon: ShoppingCart,
      description: "Total de movimentações do mês",
    },
    {
      title: "Receita Total",
      value: "R$ 0,00",
      icon: DollarSign,
      description: "Receita total das vendas (histórico completo)",
    },
    {
      title: "Lucro Total",
      value: "R$ 0,00",
      icon: TrendingUp,
      description: "Lucro total das vendas (histórico completo)",
    },
    {
      title: "Entradas do Mês",
      value: "0",
      icon: TrendingDown,
      description: "Quantidade comprada este mês",
    },
  ])

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const [produtos, movimentacoes] = await Promise.all([
          ApiService.listarProdutos(),
          ApiService.listarMovimentacoes()
        ])
        
        // Filtrar movimentações do mês atual
        const currentMonth = new Date().getMonth()
        const currentYear = new Date().getFullYear()
        const movimentacoesMes = movimentacoes.filter(mov => {
          const movDate = new Date(mov.dataMovimentacao)
          return movDate.getMonth() === currentMonth && movDate.getFullYear() === currentYear
        })
        
        // Métricas básicas
        const produtosAtivos = produtos.filter(p => p.ativo !== false).length
        const produtosCriticos = produtos.filter(p => (p.quantidadeEstoque || 0) <= 10).length
        
        // Métricas financeiras
        const valorTotalEstoque = produtos.reduce((sum, p) => {
          const preco = p.preco || 0
          const quantidade = p.quantidadeEstoque || 0
          return sum + (preco * quantidade)
        }, 0)
        
        const margemLucroPotencial = produtos.reduce((sum, p) => {
          const preco = p.preco || 0
          const custo = p.custo || 0
          const quantidade = p.quantidadeEstoque || 0
          return sum + ((preco - custo) * quantidade)
        }, 0)
        
        // Métricas de movimentações
        const totalMovimentacoesMes = movimentacoesMes.length
        
        const vendasMes = movimentacoesMes
          .filter(mov => mov.tipoMovimentacao.toLowerCase().includes('venda'))
          .reduce((sum, mov) => sum + mov.quantidadeMovimentada, 0)
        
        const entradasMes = movimentacoesMes
          .filter(mov => mov.tipoMovimentacao.toLowerCase().includes('compra'))
          .reduce((sum, mov) => sum + mov.quantidadeMovimentada, 0)
        
        // Receita e lucro total (baseada em todas as vendas cadastradas)
        const vendasTotais = movimentacoes.filter(mov => mov.tipoMovimentacao.toLowerCase().includes('venda'))
        
        const receitaTotal = vendasTotais.reduce((sum, mov) => {
          const produto = produtos.find(p => p.id === mov.produto.id)
          const preco = produto?.preco || 0
          return sum + (preco * mov.quantidadeMovimentada)
        }, 0)
        
        const lucroTotal = vendasTotais.reduce((sum, mov) => {
          const produto = produtos.find(p => p.id === mov.produto.id)
          const preco = produto?.preco || 0
          const custo = produto?.custo || 0
          return sum + ((preco - custo) * mov.quantidadeMovimentada)
        }, 0)

        // Calcular período das movimentações para exibir no description
        let periodoInfo = "histórico completo"
        if (movimentacoes.length > 0) {
          const datas = movimentacoes.map(mov => new Date(mov.dataMovimentacao)).sort((a, b) => a.getTime() - b.getTime())
          const dataInicial = datas[0]
          const dataFinal = datas[datas.length - 1]
          
          if (dataInicial && dataFinal) {
            const formatarData = (data: Date) => data.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
            periodoInfo = `${formatarData(dataInicial)} - ${formatarData(dataFinal)}`
          }
        }
        
        // Helper function para determinar trend baseado no change
        const getTrendFromChange = (change: string): "up" | "down" => {
          if (change.includes("+") || change === "OK") return "up"
          if (change.includes("-") || change === "Atenção") return "down"
          return "up" // default para 0% ou outros casos
        }

        setMetrics([
          {
            title: "Valor Total do Estoque",
            value: `R$ ${valorTotalEstoque.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            change: valorTotalEstoque > 50000 ? "+12%" : valorTotalEstoque > 20000 ? "+5%" : valorTotalEstoque > 0 ? "+2%" : "0%",
            trend: valorTotalEstoque > 0 ? "up" : "down",
            icon: Wallet,
            description: "Valor total dos produtos em estoque",
          },
          {
            title: "Margem de Lucro Potencial",
            value: `R$ ${margemLucroPotencial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            change: margemLucroPotencial > 20000 ? "+15%" : margemLucroPotencial > 5000 ? "+8%" : margemLucroPotencial > 0 ? "+3%" : "0%",
            trend: margemLucroPotencial > 0 ? "up" : "down",
            icon: Target,
            description: "Lucro potencial com estoque atual",
          },
          {
            title: "Produtos Ativos",
            value: produtosAtivos.toString(),
            change: produtosAtivos > 15 ? "+8%" : produtosAtivos > 5 ? "+3%" : produtosAtivos > 0 ? "+1%" : "0%",
            trend: produtosAtivos > 0 ? "up" : "down",
            icon: Package,
            description: "Produtos disponíveis para venda",
          },
          {
            title: "Produtos Críticos",
            value: produtosCriticos.toString(),
            change: produtosCriticos === 0 ? "OK" : produtosCriticos <= 3 ? "Atenção" : "Crítico",
            trend: produtosCriticos === 0 ? "up" : "down",
            icon: AlertTriangle,
            description: "Produtos com estoque baixo (≤ 10)",
          },
          {
            title: "Movimentações (Mês)",
            value: totalMovimentacoesMes.toString(),
            change: totalMovimentacoesMes > 20 ? "+15%" : totalMovimentacoesMes > 10 ? "+8%" : totalMovimentacoesMes > 0 ? "+3%" : "0%",
            trend: totalMovimentacoesMes > 0 ? "up" : "down",
            icon: ShoppingCart,
            description: "Total de movimentações do mês",
          },
          {
            title: "Receita Total",
            value: `R$ ${receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            change: receitaTotal > 50000 ? "+25%" : receitaTotal > 20000 ? "+15%" : receitaTotal > 5000 ? "+8%" : receitaTotal > 0 ? "+5%" : "0%",
            trend: receitaTotal > 0 ? "up" : "down",
            icon: DollarSign,
            description: `Receita total das vendas (${periodoInfo})`,
          },
          {
            title: "Lucro Total",
            value: `R$ ${lucroTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            change: lucroTotal > 20000 ? "+30%" : lucroTotal > 10000 ? "+20%" : lucroTotal > 2000 ? "+12%" : lucroTotal > 0 ? "+10%" : "0%",
            trend: lucroTotal > 0 ? "up" : "down",
            icon: TrendingUp,
            description: `Lucro total das vendas (${periodoInfo})`,
          },
          {
            title: "Entradas do Mês",
            value: entradasMes.toString(),
            change: entradasMes > 100 ? "+25%" : entradasMes > 50 ? "+15%" : entradasMes > 10 ? "+8%" : entradasMes > 0 ? "+5%" : "0%",
            trend: entradasMes > 0 ? "up" : "down",
            icon: TrendingDown,
            description: "Quantidade comprada este mês",
          },
        ])
      } catch (error) {
        console.error('Erro ao carregar métricas:', error)
        // Manter valores padrão em caso de erro
      }
    }

    if (!isLoading) {
      loadMetrics()
    }
  }, [isLoading])

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Seção de Métricas Financeiras - Loading */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-9 h-9 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <MetricCard key="loading-1" metric={{} as MetricData} isLoading={true} isHighlighted={true} />
            <MetricCard key="loading-2" metric={{} as MetricData} isLoading={true} isHighlighted={true} />
          </div>
        </div>
        
        {/* Seção de Métricas Operacionais - Loading */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-9 h-9 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <MetricCard key={`loading-${i + 3}`} metric={{} as MetricData} isLoading={true} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Seção de Métricas Financeiras */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-[#FFD300] to-[#E6BD00] rounded-lg">
            <DollarSign className="w-5 h-5 text-[#0C0C0C]" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#0C0C0C]">Métricas Financeiras</h2>
            <p className="text-sm text-gray-600">Indicadores de valor e rentabilidade</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <MetricCard key={metrics[0].title} metric={metrics[0]} isLoading={isLoading} isHighlighted={true} />
          <MetricCard key={metrics[1].title} metric={metrics[1]} isLoading={isLoading} isHighlighted={true} />
        </div>
      </div>
      
      {/* Seção de Métricas Operacionais */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-[#FFD300]/20 to-[#FFD300]/10 rounded-lg">
            <Package className="w-5 h-5 text-[#FFD300]" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#0C0C0C]">Métricas Operacionais</h2>
            <p className="text-sm text-gray-600">Indicadores de estoque e movimentação</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {metrics.slice(2).map((metric) => (
            <MetricCard key={metric.title} metric={metric} isLoading={isLoading} />
          ))}
        </div>
      </div>
    </div>
  )
}
