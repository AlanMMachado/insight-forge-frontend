"use client"

import { useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { FileSpreadsheet, CheckCircle, AlertTriangle, Download } from "lucide-react"
import { FileUploadZone } from "@/components/file-upload-zone"
import { useImport, ImportType } from "@/hooks/use-import"

export function ImportForm() {
  const [importType, setImportType] = useState<ImportType>("produtos")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  
  const { isImporting, progress, importFile, downloadTemplate } = useImport({
    onSuccess: (result) => {
      setStatus("success")
      // Limpar form após sucesso
      setTimeout(() => {
        setSelectedFile(null)
        setDescription("")
        setStatus("idle")
      }, 3000)
    },
    onError: (error) => {
      setStatus("error")
      setErrorMessage(error)
    }
  })

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setStatus("idle")
    setErrorMessage("")
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setStatus("idle")
    setErrorMessage("")
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    
    setStatus("idle")
    await importFile(selectedFile, importType)
  }

  const handleDownloadTemplate = async () => {
    await downloadTemplate(importType)
  }

  return (
    <div className="space-y-6">
      <Card className="p-8 bg-white border-0 shadow-sm max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#FFD300] rounded-full flex items-center justify-center mx-auto mb-4">
            <FileSpreadsheet className="w-8 h-8 text-[#0C0C0C]" />
          </div>
          <h2 className="text-xl font-semibold text-[#000000] mb-2">Upload da Planilha</h2>
          <p className="text-[#9A9A9A]">Selecione um arquivo Excel (.xlsx) com seus dados</p>
        </div>

        <div className="space-y-6">
          {/* Seleção do tipo de importação */}
          <div>
            <Label className="text-[#000000] font-medium mb-3 block">
              Tipo de Importação
            </Label>
            <RadioGroup 
              value={importType} 
              onValueChange={(value: ImportType) => setImportType(value)}
              className="flex flex-col space-y-2"
              disabled={isImporting}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="produtos" id="produtos" />
                <Label htmlFor="produtos">Produtos</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="movimentacoes" id="movimentacoes" />
                <Label htmlFor="movimentacoes">Movimentações</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Botão para baixar template */}
          <div className="flex justify-center">
            <Button 
              variant="outline"
              onClick={handleDownloadTemplate}
              disabled={isImporting}
              className="border-[#FFD300] text-[#FFD300] hover:bg-[#FFD300] hover:text-[#0C0C0C] bg-transparent"
            >
              <Download className="w-4 h-4 mr-2" />
              {importType === "produtos" ? "Baixar Template" : "Template não disponível"}
            </Button>
          </div>

          {/* Upload de arquivo */}
          <div>
            <Label htmlFor="file" className="text-[#000000] font-medium">
              Arquivo da Planilha
            </Label>
            <FileUploadZone
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
              onRemoveFile={handleRemoveFile}
              disabled={isImporting}
              maxSize={10}
            />
          </div>

          {/* Descrição opcional */}
          <div>
            <Label htmlFor="description" className="text-[#000000] font-medium">
              Descrição (Opcional)
            </Label>
            <Input 
              id="description" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o conteúdo da planilha..." 
              className="mt-2"
              disabled={isImporting}
            />
          </div>

          {/* Barra de progresso */}
          {isImporting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#9A9A9A]">Processando...</span>
                <span className="text-[#9A9A9A]">{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Status da importação */}
          {status === "success" && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {importType === "produtos" ? "Produtos" : "Movimentações"} importados com sucesso!
              </AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {errorMessage || "Erro ao processar arquivo"}
              </AlertDescription>
            </Alert>
          )}

          {/* Botão de processar */}
          <Button 
            onClick={handleUpload}
            disabled={!selectedFile || isImporting}
            className="w-full bg-[#FFD300] text-[#0C0C0C] hover:bg-[#E6BD00] font-medium disabled:opacity-50"
          >
            {isImporting 
              ? "Processando..." 
              : `Processar ${importType === "produtos" ? "Produtos" : "Movimentações"}`
            }
          </Button>
        </div>
      </Card>

      {/* Card com informações sobre o formato esperado */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">
          Formato esperado para {importType === "produtos" ? "Produtos" : "Movimentações"}
        </h3>
        <div className="text-sm text-blue-800 space-y-1">
          {importType === "produtos" ? (
            <ul className="list-disc list-inside space-y-1">
              <li>Nome do produto (obrigatório)</li>
              <li>Categoria</li>
              <li>Preço</li>
              <li>Quantidade em estoque</li>
              <li>Status (ativo/inativo)</li>
              <li>Descrição</li>
            </ul>
          ) : (
            <ul className="list-disc list-inside space-y-1">
              <li>ID do produto (obrigatório)</li>
              <li>Tipo de movimentação (entrada/saída)</li>
              <li>Quantidade</li>
              <li>Data da movimentação</li>
              <li>Motivo da movimentação</li>
              <li>Observações</li>
            </ul>
          )}
        </div>
        <p className="text-xs text-blue-700 mt-3">
          💡 Dica: Baixe o template acima para garantir que seu arquivo está no formato correto.
        </p>
      </Card>
    </div>
  )
}
