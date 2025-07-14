"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileSpreadsheet } from "lucide-react"

export function ImportForm() {
  return (
    <Card className="p-8 bg-white border-0 shadow-sm max-w-2xl">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#FFD300] rounded-full flex items-center justify-center mx-auto mb-4">
          <FileSpreadsheet className="w-8 h-8 text-[#0C0C0C]" />
        </div>
        <h2 className="text-xl font-semibold text-[#000000] mb-2">Upload da Planilha</h2>
        <p className="text-[#9A9A9A]">Selecione um arquivo Excel (.xlsx) ou CSV com seus dados de estoque</p>
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="file" className="text-[#000000] font-medium">
            Arquivo da Planilha
          </Label>
          <div className="mt-2 border-2 border-dashed border-[#CFCFCF] rounded-lg p-8 text-center hover:border-[#FFD300] transition-colors">
            <Upload className="w-8 h-8 text-[#9A9A9A] mx-auto mb-2" />
            <p className="text-[#9A9A9A] mb-2">Arraste e solte seu arquivo aqui ou</p>
            <Button
              variant="outline"
              className="border-[#FFD300] text-[#FFD300] hover:bg-[#FFD300] hover:text-[#0C0C0C] bg-transparent"
            >
              Selecionar Arquivo
            </Button>
          </div>
        </div>

        <div>
          <Label htmlFor="description" className="text-[#000000] font-medium">
            Descrição (Opcional)
          </Label>
          <Input id="description" placeholder="Descreva o conteúdo da planilha..." className="mt-2" />
        </div>

        <Button className="w-full bg-[#FFD300] text-[#0C0C0C] hover:bg-[#E6BD00] font-medium">Processar Dados</Button>
      </div>
    </Card>
  )
}
