"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { Bar, BarChart, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line } from "recharts"
import { ChartTooltip, ChartContainer } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { memo, useState, useEffect } from "react"
import { TrendingUp, BarChart3, PieChartIcon } from "lucide-react"
import { ApiService, Produto } from "@/lib/api"

interface ChartData {
  name: string
  value: number
  color?: string
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
      <Card className={`p-4 sm:p-6 bg-white border-0 shadow-sm ${className}`}>
        <ChartSkeleton />
      </Card>
    )
  }

  return (
    <Card
      className={`p-4 sm:p-6 bg-white border-0 shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-[#FFD300] rounded-lg">
          <Icon className="w-4 h-4 text-[#0C0C0C]" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-[#000000]">{title}</h3>
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
  const [inventoryData, setInventoryData] = useState<StockData[]>([])
  const [salesData] = useState([
    { month: "Jan", sales: 4000 },
    { month: "Fev", sales: 3000 },
    { month: "Mar", sales: 5000 },
    { month: "Abr", sales: 4500 },
    { month: "Mai", sales: 6000 }
  ])

  useEffect(() => {
    const loadChartData = async () => {
      try {
        const produtos = await ApiService.listarProdutos()
        
        // Dados por categoria
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

        // Dados de estoque (top 5 produtos)
        const stockData: StockData[] = produtos
          .slice(0, 5)
          .map(produto => ({
            product: produto.nome.length > 15 ? produto.nome.substring(0, 15) + '...' : produto.nome,
            stock: produto.quantidadeEstoque || 0
          }))

        setInventoryData(stockData)
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
      {/* Vendas Mensais */}
      <ChartCard title="Vendas Mensais" icon={TrendingUp} isLoading={isLoading}>
        <ChartContainer
          config={{
            sales: { label: "Vendas", color: "#FFD300" },
          }}
          className="w-full h-[180px] sm:h-[200px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
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
              />
              <Line
                dataKey="sales"
                stroke="#FFD300"
                strokeWidth={3}
                dot={{ fill: "#FFD300", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "#FFD300" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </ChartCard>

      {/* Categorias de Produtos */}
      <ChartCard title="Categorias" icon={PieChartIcon} isLoading={isLoading}>
        <ChartContainer
          config={{ value: { label: "Categorias", color: "#FFD300" } }}
          className="h-[180px] sm:h-[200px]"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between h-full gap-4">
            <div className="flex-1 flex justify-center">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value">
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2 min-w-0">
              {categoryData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-[#9A9A9A] truncate flex-1">{item.name}</span>
                  <span className="font-medium text-[#000000]">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </ChartContainer>
      </ChartCard>

      {/* Níveis de Estoque */}
      <ChartCard title="Níveis de Estoque" icon={BarChart3} isLoading={isLoading}>
        <ChartContainer
          config={{ stock: { label: "Estoque", color: "#FFD300" } }}
          className="w-full h-[180px] sm:h-[200px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={inventoryData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <XAxis
                dataKey="product"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#9A9A9A" }}
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
              />
              <Bar dataKey="stock" fill="#FFD300" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </ChartCard>
    </div>
  )
}
