"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { Bar, BarChart, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line } from "recharts"
import { ChartTooltip, ChartContainer } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { memo, useState, useEffect } from "react"
import { TrendingUp, BarChart3, PieChartIcon, DollarSign, Target, Award } from "lucide-react"
import { ApiService, Produto, Movimentacao } from "@/lib/api"

interface ChartData {
  name: string
  value: number
  color?: string
}

interface ProductRevenueData {
  product: string
  revenue: number
  margin: number
}

interface RevenueData {
  month: string
  revenue: number
  profit: number
}

interface StockData {
  product: string
  stock: number
}

const ChartSkeleton = memo(function ChartSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-[200px] w-full rounded-lg" />
    </div>
  )
})

interface ChartCardProps {
  title: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  isLoading?: boolean
  className?: string
}

const ChartCard = memo(function ChartCard({
  title,
  icon: Icon,
  children,
  isLoading = false,
  className = "",
}: ChartCardProps) {
  if (isLoading) {
    return (
      <Card className={`p-4 sm:p-6 bg-white border-[#FFD300]/20 shadow-sm rounded-2xl ${className}`}>
        <ChartSkeleton />
      </Card>
    )
  }

  return (
    <Card
      className={`p-4 sm:p-6 bg-gradient-to-br from-white to-[#FFFDF0] border-[#FFD300]/20 shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl ${className}`}
    >
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="p-1.5 sm:p-2 bg-gradient-to-br from-[#FFD300]/20 to-[#FFD300]/10 rounded-lg flex-shrink-0">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFD300]" />
        </div>
        <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-[#0C0C0C] truncate">{title}</h3>
      </div>
      {children}
    </Card>
  )
})

interface ChartsGridProps {
  isLoading?: boolean
}

export function ChartsGrid({ isLoading = false }: ChartsGridProps) {
  const [categoryData, setCategoryData] = useState<ChartData[]>([])
  const [productRevenueData, setProductRevenueData] = useState<ProductRevenueData[]>([])
  const [revenueData, setRevenueData] = useState<RevenueData[]>([
    { month: "Jan", revenue: 0, profit: 0 },
    { month: "Fev", revenue: 0, profit: 0 },
    { month: "Mar", revenue: 0, profit: 0 },
    { month: "Abr", revenue: 0, profit: 0 },
    { month: "Mai", revenue: 0, profit: 0 }
  ])
  const [marginData, setMarginData] = useState<ChartData[]>([])

  useEffect(() => {
    const loadChartData = async () => {
      try {
        const [produtos, movimentacoes] = await Promise.all([
          ApiService.listarProdutos(),
          ApiService.listarMovimentacoes()
        ])
        
        // Dados por categoria (mantido)
        const categoryCounts: { [key: string]: number } = {}
        produtos.forEach(produto => {
          const categoria = produto.categoria || 'Sem Categoria'
          categoryCounts[categoria] = (categoryCounts[categoria] || 0) + 1
        })

        const total = produtos.length
        const colors = ['#FFD300', '#0C0C0C', '#CFCFCF', '#9A9A9A', '#7C7C7C']
        const categoryChartData: ChartData[] = Object.entries(categoryCounts)
          .map(([name, count], index) => ({
            name,
            value: Math.round((count / total) * 100),
            color: colors[index % colors.length]
          }))

        setCategoryData(categoryChartData)

        // Top produtos por receita
        const produtoReceita: { [key: number]: { vendas: number, receita: number, margem: number } } = {}
        
        movimentacoes
          .filter(mov => mov.tipoMovimentacao.toLowerCase().includes('venda'))
          .forEach(mov => {
            const produtoId = mov.produto.id
            if (!produtoReceita[produtoId]) {
              produtoReceita[produtoId] = { vendas: 0, receita: 0, margem: 0 }
            }
            
            const produto = produtos.find(p => p.id === produtoId)
            if (produto) {
              const quantidade = mov.quantidadeMovimentada
              const preco = produto.preco || 0
              const custo = produto.custo || 0
              
              produtoReceita[produtoId].vendas += quantidade
              produtoReceita[produtoId].receita += preco * quantidade
              produtoReceita[produtoId].margem += (preco - custo) * quantidade
            }
          })

        const topProdutos: ProductRevenueData[] = Object.entries(produtoReceita)
          .map(([produtoId, data]) => {
            const produto = produtos.find(p => p.id === parseInt(produtoId))
            return {
              product: produto ? (produto.nome.length > 8 ? produto.nome.substring(0, 8) + '...' : produto.nome) : 'Produto',
              revenue: data.receita,
              margin: data.margem
            }
          })
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5)

        setProductRevenueData(topProdutos)

        // Dados de margem de lucro por categoria
        const marginByCategory: { [key: string]: { receita: number, custo: number } } = {}
        
        produtos.forEach(produto => {
          const categoria = produto.categoria || 'Sem Categoria'
          const quantidade = produto.quantidadeEstoque || 0
          const preco = produto.preco || 0
          const custo = produto.custo || 0
          
          if (!marginByCategory[categoria]) {
            marginByCategory[categoria] = { receita: 0, custo: 0 }
          }
          
          marginByCategory[categoria].receita += preco * quantidade
          marginByCategory[categoria].custo += custo * quantidade
        })

        const marginChartData: ChartData[] = Object.entries(marginByCategory)
          .map(([categoria, data], index) => ({
            name: categoria,
            value: data.receita > 0 ? Math.round(((data.receita - data.custo) / data.receita) * 100) : 0,
            color: colors[index % colors.length]
          }))
          .filter(item => item.value > 0)

        setMarginData(marginChartData)

        // Simular dados de receita mensal baseado em movimentações
        const currentDate = new Date()
        const monthlyRevenue = []
        
        for (let i = 4; i >= 0; i--) {
          const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
          const monthName = targetDate.toLocaleString('pt-BR', { month: 'short' })
          
          const monthMovs = movimentacoes.filter(mov => {
            const movDate = new Date(mov.dataMovimentacao)
            return movDate.getMonth() === targetDate.getMonth() && 
                   movDate.getFullYear() === targetDate.getFullYear() &&
                   mov.tipoMovimentacao.toLowerCase().includes('venda')
          })
          
          const revenue = monthMovs.reduce((sum, mov) => {
            const produto = produtos.find(p => p.id === mov.produto.id)
            return sum + ((produto?.preco || 0) * mov.quantidadeMovimentada)
          }, 0)
          
          const profit = monthMovs.reduce((sum, mov) => {
            const produto = produtos.find(p => p.id === mov.produto.id)
            const preco = produto?.preco || 0
            const custo = produto?.custo || 0
            return sum + ((preco - custo) * mov.quantidadeMovimentada)
          }, 0)
          
          monthlyRevenue.push({
            month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
            revenue: Math.round(revenue),
            profit: Math.round(profit)
          })
        }
        
        setRevenueData(monthlyRevenue)

      } catch (error) {
        console.error('Erro ao carregar dados dos gráficos:', error)
      }
    }

    if (!isLoading) {
      loadChartData()
    }
  }, [isLoading])
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
      {/* Receita e Lucro Mensal */}
      <ChartCard title="Receita & Lucro" icon={DollarSign} isLoading={isLoading}>
        <ChartContainer
          config={{
            revenue: { label: "Receita", color: "#FFD300" },
            profit: { label: "Lucro", color: "#0C0C0C" },
          }}
          className="w-full h-[180px] sm:h-[200px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#9A9A9A" }}
                interval={0}
              />
              <YAxis hide />
              <ChartTooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #CFCFCF",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value, name) => [
                  `R$ ${Number(value).toLocaleString('pt-BR')}`,
                  name === 'revenue' ? 'Receita' : 'Lucro'
                ]}
              />
              <Line
                dataKey="revenue"
                stroke="#FFD300"
                strokeWidth={3}
                dot={{ fill: "#FFD300", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "#FFD300" }}
              />
              <Line
                dataKey="profit"
                stroke="#0C0C0C"
                strokeWidth={2}
                dot={{ fill: "#0C0C0C", strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, fill: "#0C0C0C" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </ChartCard>

      {/* Top Produtos por Receita */}
      <ChartCard title="Top Produtos (Receita)" icon={Award} isLoading={isLoading}>
        <ChartContainer
          config={{ revenue: { label: "Receita", color: "#FFD300" } }}
          className="w-full h-[180px] sm:h-[200px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={productRevenueData} margin={{ top: 10, right: 15, left: 15, bottom: 25 }}>
              <XAxis
                dataKey="product"
                axisLine={false}
                tickLine={false}
                tick={{ 
                  fontSize: 10, 
                  fill: "#333333", 
                  fontWeight: 500 
                }}
                interval={0}
                angle={0}
                textAnchor="middle"
                height={25}
                tickFormatter={(value) => {
                  // Trunca nomes longos e adiciona "..."
                  return value.length > 8 ? value.substring(0, 8) + '...' : value;
                }}
              />
              <YAxis 
                hide 
                domain={[0, 'dataMax + 100']}
              />
              <ChartTooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #CFCFCF",
                  borderRadius: "8px",
                  fontSize: "13px",
                  padding: "8px 12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                }}
                formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, 'Receita']}
                labelFormatter={(label) => `Produto: ${label}`}
                labelStyle={{ color: "#333333", fontWeight: "600", marginBottom: "4px" }}
              />
              <Bar 
                dataKey="revenue" 
                fill="#FFD300" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={40}
                stroke="#E6C200"
                strokeWidth={1}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </ChartCard>

      {/* Margem de Lucro por Categoria */}
      <ChartCard title="Margem por Categoria" icon={Target} isLoading={isLoading}>
        <ChartContainer
          config={{ value: { label: "Margem", color: "#FFD300" } }}
          className="h-[180px] sm:h-[200px]"
        >
          <div className="w-full h-full flex flex-col sm:flex-row items-center sm:items-start sm:justify-start gap-1 sm:gap-2">
            {/* Container do Gráfico + Legenda */}
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:ml-4">
              {/* Gráfico */}
              <div className="h-[120px] sm:h-[160px] w-[160px] sm:w-[180px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={marginData} 
                      cx="50%" 
                      cy="50%" 
                      outerRadius={70}
                      innerRadius={30}
                    dataKey="value"
                    labelLine={false}
                    label={false}
                  >
                    {marginData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #CFCFCF",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value) => [`${value}%`, 'Margem']}
                    labelFormatter={(label) => `${label}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legenda - Responsiva */}
            <div className="flex sm:flex-col flex-wrap justify-center sm:justify-start gap-1.5 sm:gap-2 sm:max-w-[120px]">
              {marginData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5 text-sm">
                  <div 
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: item.color }} 
                  />
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-gray-700 truncate max-w-[60px] sm:max-w-[80px]">
                      {item.name}
                    </span>
                    <span className="font-bold text-gray-900 whitespace-nowrap">
                      {item.value}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
            </div>
          </div>
        </ChartContainer>
      </ChartCard>
    </div>
  )
}
