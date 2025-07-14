"use client"

import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { memo } from "react"
import { Package, TrendingUp } from "lucide-react"

const tableData = [
  {
    produto: "Smartphone XYZ",
    categoria: "Eletrônicos",
    estoque: 45,
    vendas: 120,
    receita: "R$ 24.000",
    status: "Normal" as const,
    trend: "+15%",
  },
  {
    produto: "Camiseta Premium",
    categoria: "Roupas",
    estoque: 8,
    vendas: 85,
    receita: "R$ 4.250",
    status: "Baixo" as const,
    trend: "-5%",
  },
  {
    produto: "Mesa de Escritório",
    categoria: "Móveis",
    estoque: 23,
    vendas: 32,
    receita: "R$ 9.600",
    status: "Normal" as const,
    trend: "+8%",
  },
  {
    produto: "Fone Bluetooth",
    categoria: "Eletrônicos",
    estoque: 67,
    vendas: 156,
    receita: "R$ 15.600",
    status: "Alto" as const,
    trend: "+22%",
  },
]

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
                <TableHead className="text-[#9A9A9A] font-medium py-3 text-xs sm:text-sm hidden md:table-cell">
                  Vendas
                </TableHead>
                <TableHead className="text-[#9A9A9A] font-medium py-3 text-xs sm:text-sm">Receita</TableHead>
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
                  <TableCell className="py-4 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <span className="text-[#000000] text-sm">{item.vendas}</span>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-green-500">{item.trend}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-[#FFD300] py-4 text-sm">{item.receita}</TableCell>
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
