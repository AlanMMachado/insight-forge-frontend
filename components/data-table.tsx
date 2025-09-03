"use client"

import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { memo, useState, useEffect } from "react"
import { TrendingUp, DollarSign, Award } from "lucide-react"
import { ApiService, Produto, Movimentacao } from "@/lib/api"

interface TopProductItem {
  produto: string
  categoria: string
  vendas: number
  receita: number
  margem: number
  margemPercentual: number
  status: "Excelente" | "Bom" | "Regular" | "Baixo"
}

const TableSkeleton = memo(function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-8 h-8 rounded-lg" />
        <Skeleton className="h-6 w-48" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
})

interface DataTableProps {
  isLoading?: boolean
}

export function DataTable({ isLoading = false }: DataTableProps) {
  const [tableData, setTableData] = useState<TopProductItem[]>([])

  useEffect(() => {
    const loadTableData = async () => {
      try {
        const [produtos, movimentacoes] = await Promise.all([
          ApiService.listarProdutos(),
          ApiService.listarMovimentacoes()
        ])
        
        // Calcular dados de vendas por produto
        const produtoVendas: { [key: number]: { vendas: number, receita: number, margem: number } } = {}
        
        movimentacoes
          .filter(mov => mov.tipoMovimentacao.toLowerCase().includes('venda'))
          .forEach(mov => {
            const produtoId = mov.produto.id
            if (!produtoVendas[produtoId]) {
              produtoVendas[produtoId] = { vendas: 0, receita: 0, margem: 0 }
            }
            
            const produto = produtos.find(p => p.id === produtoId)
            if (produto) {
              const quantidade = mov.quantidadeMovimentada
              const preco = produto.preco || 0
              const custo = produto.custo || 0
              
              produtoVendas[produtoId].vendas += quantidade
              produtoVendas[produtoId].receita += preco * quantidade
              produtoVendas[produtoId].margem += (preco - custo) * quantidade
            }
          })

        const formattedData: TopProductItem[] = Object.entries(produtoVendas)
          .map(([produtoId, data]) => {
            const produto = produtos.find(p => p.id === parseInt(produtoId))
            if (!produto) return null
            
            const margemPercentual = data.receita > 0 ? (data.margem / data.receita) * 100 : 0
            let status: "Excelente" | "Bom" | "Regular" | "Baixo" = "Baixo"
            
            if (margemPercentual >= 40) status = "Excelente"
            else if (margemPercentual >= 25) status = "Bom"
            else if (margemPercentual >= 15) status = "Regular"
            
            return {
              produto: produto.nome.length > 15 ? produto.nome.substring(0, 15) + '...' : produto.nome,
              categoria: produto.categoria || 'Sem Categoria',
              vendas: data.vendas,
              receita: data.receita,
              margem: data.margem,
              margemPercentual,
              status
            }
          })
          .filter((item): item is TopProductItem => item !== null)
          .sort((a, b) => b.receita - a.receita)
          .slice(0, 8)

        setTableData(formattedData)
      } catch (error) {
        console.error('Erro ao carregar dados da tabela:', error)
      }
    }

    if (!isLoading) {
      loadTableData()
    }
  }, [isLoading])

  if (isLoading) {
    return (
      <Card className="p-4 sm:p-6 bg-white border-[#FFD300]/20 shadow-sm rounded-2xl">
        <TableSkeleton />
      </Card>
    )
  }

  return (
    <Card className="p-4 sm:p-6 bg-gradient-to-br from-white to-[#FFFDF0] border-[#FFD300]/20 shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="p-1.5 sm:p-2 bg-gradient-to-br from-[#FFD300]/20 to-[#FFD300]/10 rounded-lg flex-shrink-0">
          <Award className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFD300]" />
        </div>
        <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-[#0C0C0C] truncate">Top Produtos por Performance</h3>
      </div>

      <div className="overflow-x-auto -mx-2 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <Table>
            <TableHeader>
              <TableRow className="border-b-2 border-[#FFD300]/20 hover:bg-transparent bg-gray-50/50">
                <TableHead className="text-gray-700 font-semibold py-3 text-xs sm:text-sm min-w-[120px]">Produto</TableHead>
                <TableHead className="text-gray-700 font-semibold py-3 text-xs sm:text-sm hidden sm:table-cell min-w-[100px]">
                  Categoria
                </TableHead>
                <TableHead className="text-gray-700 font-semibold py-3 text-xs sm:text-sm min-w-[70px]">Vendas</TableHead>
                <TableHead className="text-gray-700 font-semibold py-3 text-xs sm:text-sm min-w-[90px]">Receita</TableHead>
                <TableHead className="text-gray-700 font-semibold py-3 text-xs sm:text-sm hidden lg:table-cell min-w-[70px]">Margem</TableHead>
                <TableHead className="text-gray-700 font-semibold py-3 text-xs sm:text-sm min-w-[80px]">Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((item, index) => (
                <TableRow
                  key={index}
                  className={`hover:bg-[#FFFDF0] transition-colors duration-200 group ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                  }`}
                >
                  <TableCell className="py-3 sm:py-4 min-w-[120px]">
                    <div className="space-y-1">
                      <div className="font-medium text-[#0C0C0C] text-xs sm:text-sm group-hover:text-[#FFD300] transition-colors truncate">
                        {item.produto}
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-600 sm:hidden truncate">{item.categoria}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600 py-3 sm:py-4 text-xs sm:text-sm hidden sm:table-cell min-w-[100px]">
                    <span className="truncate block">{item.categoria}</span>
                  </TableCell>
                  <TableCell className="py-3 sm:py-4 min-w-[70px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#0C0C0C] font-medium text-xs sm:text-sm">{item.vendas}</span>
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full flex-shrink-0" />
                    </div>
                  </TableCell>
                  <TableCell className="py-3 sm:py-4 min-w-[90px]">
                    <span className="text-[#0C0C0C] font-medium text-xs sm:text-sm truncate block">
                      R$ {item.receita.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 sm:py-4 hidden lg:table-cell min-w-[70px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#0C0C0C] font-medium text-xs sm:text-sm">
                        {item.margemPercentual.toFixed(0)}%
                      </span>
                      <div
                        className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0 ${
                          item.margemPercentual >= 40 ? "bg-green-500" : 
                          item.margemPercentual >= 25 ? "bg-yellow-500" : "bg-red-500"
                        }`}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="py-3 sm:py-4 min-w-[80px]">
                    <Badge
                      variant="secondary"
                      className={`text-[10px] sm:text-xs font-medium px-2 py-1 rounded-full ${
                        item.status === "Excelente"
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : item.status === "Bom"
                            ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                            : item.status === "Regular"
                              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                              : "bg-red-100 text-red-800 hover:bg-red-200"
                      }`}
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 flex items-center justify-between border-t border-[#FFD300]/10 pt-4">
        <span>
          Mostrando {tableData.length} de {tableData.length} produtos
        </span>
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Atualizado há 5 min
        </span>
      </div>
    </Card>
  )
}
