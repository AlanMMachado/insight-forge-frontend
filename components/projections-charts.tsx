"use client"

import { Card } from "@/components/ui/card"
import { Line, LineChart, XAxis, YAxis, Bar, BarChart, ResponsiveContainer } from "recharts"
import { ChartTooltip, ChartContainer } from "@/components/ui/chart"
import { useState, useEffect } from "react"
import { ApiService } from "@/lib/api"

interface ProjectionData {
  month: string
  atual: number | null
  projecao: number
}

interface DemandData {
  product: string
  demanda: number
}

export function ProjectionsCharts() {
  const [projectionData] = useState<ProjectionData[]>([
    { month: "Jul", atual: 5500, projecao: 5800 },
    { month: "Ago", atual: null, projecao: 6200 },
    { month: "Set", atual: null, projecao: 6500 },
    { month: "Out", atual: null, projecao: 6800 },
    { month: "Nov", atual: null, projecao: 7200 },
    { month: "Dez", atual: null, projecao: 7500 },
  ])
  
  const [demandData, setDemandData] = useState<DemandData[]>([])

  useEffect(() => {
    const loadDemandData = async () => {
      try {
        const produtos = await ApiService.listarProdutos()
        
        // Usar produtos reais com demanda simulada baseada no estoque
        const demandChartData: DemandData[] = produtos.slice(0, 5).map(produto => ({
          product: produto.nome.length > 12 ? produto.nome.substring(0, 12) + '...' : produto.nome,
          demanda: Math.max(60, Math.min(100, (produto.quantidadeEstoque || 0) + Math.random() * 40))
        }))

        setDemandData(demandChartData)
      } catch (error) {
        console.error('Erro ao carregar dados de demanda:', error)
        // Fallback para dados de exemplo se API falhar
        setDemandData([
          { product: "Produto A", demanda: 85 },
          { product: "Produto B", demanda: 92 },
          { product: "Produto C", demanda: 78 },
          { product: "Produto D", demanda: 95 },
          { product: "Produto E", demanda: 88 },
        ])
      }
    }

    loadDemandData()
  }, [])
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6 bg-white border-0 shadow-sm">
        <h3 className="text-lg font-semibold text-[#000000] mb-4">Projeção de Vendas - Próximos 6 Meses</h3>
        <ChartContainer
          config={{
            atual: { label: "Vendas Atuais", color: "#0C0C0C" },
            projecao: { label: "Projeção", color: "#FFD300" },
          }}
          className="w-full h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projectionData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9A9A9A" }} />
              <YAxis hide />
              <ChartTooltip />
              <Line
                dataKey="atual"
                stroke="#0C0C0C"
                strokeWidth={3}
                dot={{ fill: "#0C0C0C", strokeWidth: 2, r: 4 }}
                connectNulls={false}
              />
              <Line
                dataKey="projecao"
                stroke="#FFD300"
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ fill: "#FFD300", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </Card>

      <Card className="p-6 bg-white border-0 shadow-sm">
        <h3 className="text-lg font-semibold text-[#000000] mb-4">Previsão de Demanda por Produto</h3>
        <ChartContainer config={{ demanda: { label: "Demanda", color: "#FFD300" } }} className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={demandData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <XAxis dataKey="product" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9A9A9A" }} />
              <YAxis hide />
              <ChartTooltip />
              <Bar dataKey="demanda" fill="#FFD300" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </Card>
    </div>
  )
}
