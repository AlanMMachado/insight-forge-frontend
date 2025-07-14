import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, TrendingUp, Package } from "lucide-react"

const reports = [
  {
    title: "Relatório de Vendas",
    description: "Análise completa das vendas por período",
    icon: TrendingUp,
    lastUpdate: "Atualizado há 2 horas",
  },
  {
    title: "Controle de Estoque",
    description: "Status atual do estoque e movimentações",
    icon: Package,
    lastUpdate: "Atualizado há 1 hora",
  },
  {
    title: "Produtos em Baixa",
    description: "Lista de produtos com estoque crítico",
    icon: FileText,
    lastUpdate: "Atualizado há 30 min",
  },
  {
    title: "Análise de Margem",
    description: "Rentabilidade por produto e categoria",
    icon: TrendingUp,
    lastUpdate: "Atualizado há 3 horas",
  },
]

export function ReportsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {reports.map((report) => (
        <Card key={report.title} className="p-6 bg-white border-0 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#FFD300] rounded-lg">
                <report.icon className="w-5 h-5 text-[#0C0C0C]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#000000]">{report.title}</h3>
                <p className="text-sm text-[#9A9A9A] mt-1">{report.description}</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-[#CFCFCF] mb-4">{report.lastUpdate}</p>
          <div className="flex gap-2">
            <Button size="sm" className="bg-[#FFD300] text-[#0C0C0C] hover:bg-[#E6BD00]">
              Visualizar
            </Button>
            <Button size="sm" variant="outline" className="border-[#CFCFCF] bg-transparent">
              <Download className="w-4 h-4 mr-1" />
              Baixar
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}
