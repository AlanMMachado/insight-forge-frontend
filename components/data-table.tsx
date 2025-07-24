"use client"

import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { memo, useState, useEffect } from "react"
import { Package, TrendingUp } from "lucide-react"
import { ApiService, Produto } from "@/lib/api"

interface TableItem {
  produto: string
  categoria: string
  estoque: number
  status: "Baixo" | "Normal" | "Alto"
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
  const [tableData, setTableData] = useState<TableItem[]>([])

  useEffect(() => {
    const loadTableData = async () => {
      try {
        const produtos = await ApiService.listarProdutos()
        
        const formattedData: TableItem[] = produtos.slice(0, 6).map(produto => {
          const estoque = produto.quantidadeEstoque || 0
          let status: "Baixo" | "Normal" | "Alto" = "Normal"
          
          if (estoque < 20) status = "Baixo"
          else if (estoque > 50) status = "Alto"
          
          return {
            produto: produto.nome,
            categoria: produto.categoria || 'Sem Categoria',
            estoque,
            status
          }
        })

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
      <Card className="p-4 sm:p-6 bg-white border-0 shadow-sm">
        <TableSkeleton />
      </Card>
    )
  }

  return (
    <Card className="p-4 sm:p-6 bg-white border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-[#FFD300] rounded-lg">
          <Package className="w-4 h-4 text-[#0C0C0C]" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-[#000000]">Produtos em Destaque</h3>
      </div>

      <div className="overflow-x-auto -mx-2 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#CFCFCF] hover:bg-transparent">
                <TableHead className="text-[#9A9A9A] font-medium py-3 text-xs sm:text-sm">Produto</TableHead>
                <TableHead className="text-[#9A9A9A] font-medium py-3 text-xs sm:text-sm hidden sm:table-cell">
                  Categoria
                </TableHead>
                <TableHead className="text-[#9A9A9A] font-medium py-3 text-xs sm:text-sm">Estoque</TableHead>
                <TableHead className="text-[#9A9A9A] font-medium py-3 text-xs sm:text-sm">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((item, index) => (
                <TableRow
                  key={index}
                  className="border-b border-[#F8F8F8] hover:bg-[#F8F8F8] transition-colors duration-200 group"
                >
                  <TableCell className="py-4">
                    <div className="space-y-1">
                      <div className="font-medium text-[#000000] text-sm group-hover:text-[#FFD300] transition-colors">
                        {item.produto}
                      </div>
                      <div className="text-xs text-[#9A9A9A] sm:hidden">{item.categoria}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-[#9A9A9A] py-4 text-sm hidden sm:table-cell">{item.categoria}</TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[#000000] font-medium text-sm">{item.estoque}</span>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          item.estoque < 20 ? "bg-red-500" : item.estoque > 50 ? "bg-green-500" : "bg-yellow-500"
                        }`}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge
                      variant="secondary"
                      className={`text-xs font-medium px-3 py-1 ${
                        item.status === "Baixo"
                          ? "bg-red-100 text-red-800 hover:bg-red-200"
                          : item.status === "Alto"
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
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

      <div className="mt-4 text-xs text-[#CFCFCF] flex items-center justify-between">
        <span>
          Mostrando {tableData.length} de {tableData.length} produtos
        </span>
        <span>Atualizado há 5 min</span>
      </div>
    </Card>
  )
}
