"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { FileSpreadsheet, CheckCircle, AlertTriangle, Download, Upload, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ApiService } from "@/lib/api"
import { createProdutosTemplate, createMovimentacoesTemplate, downloadFile } from "@/lib/templates"

type ImportType = "produtos" | "movimentacoes"

export default function ImportarDadosPage() {
  const [importType, setImportType] = useState<ImportType>("produtos")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [description, setDescription] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const validateFile = (file: File): boolean => {
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
      "application/csv"
    ]
    
    const validExtensions = [".xlsx", ".xls", ".csv"]
    const hasValidType = validTypes.includes(file.type)
    const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))

    if (!hasValidType && !hasValidExtension) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione um arquivo Excel (.xlsx, .xls) ou CSV (.csv)",
        variant: "destructive",
      })
      return false
    }

    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > 10) {
      toast({
        title: "Arquivo muito grande",
        description: `O arquivo deve ter no máximo 10MB. Tamanho atual: ${fileSizeMB.toFixed(2)}MB`,
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file)
      setUploadStatus("idle")
      setErrorMessage("")
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(false)
    const file = event.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(false)
  }

  const removeFile = () => {
    setSelectedFile(null)
    setUploadStatus("idle")
    setErrorMessage("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const uploadFile = async () => {
    if (!selectedFile) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione um arquivo para importar",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    setUploadStatus("idle")

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      let message: string
      if (importType === "produtos") {
        message = await ApiService.importarProdutos(selectedFile)
      } else {
        message = await ApiService.importarMovimentacoes(selectedFile)
      }

      clearInterval(progressInterval)
      setUploadProgress(100)
      setUploadStatus("success")
      
      toast({
        title: "Importação concluída",
        description: message,
      })
      
      setTimeout(() => {
        setSelectedFile(null)
        setDescription("")
        setUploadProgress(0)
        setUploadStatus("idle")
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }, 3000)

    } catch (error) {
      setUploadStatus("error")
      const errorMsg = error instanceof Error ? error.message : "Erro desconhecido"
      setErrorMessage(errorMsg)
      toast({
        title: "Erro na importação",
        description: errorMsg,
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const downloadTemplate = async () => {
    try {
      if (importType === "produtos") {
        const blob = createProdutosTemplate()
        downloadFile(blob, "template-produtos.xlsx")
        
        toast({
          title: "Template baixado",
          description: "Template para produtos baixado com sucesso",
        })
      } else {
        const blob = createMovimentacoesTemplate()
        downloadFile(blob, "template-movimentacoes.xlsx")
        
        toast({
          title: "Template baixado",
          description: "Template para movimentações baixado com sucesso",
        })
      }
    } catch (error) {
      toast({
        title: "Erro ao baixar template",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-[#FFD300] rounded-xl mr-4">
              <FileSpreadsheet className="h-8 w-8 text-[#0C0C0C]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#000000]">Importar Dados</h1>
              <p className="text-[#9A9A9A] mt-1">Importe produtos ou movimentações através de planilhas Excel ou CSV</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal - Upload */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Card */}
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-[#000000] flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#FFD300] rounded-lg flex items-center justify-center">
                    <Upload className="w-5 h-5 text-[#0C0C0C]" />
                  </div>
                  Upload da Planilha
                </CardTitle>
                <CardDescription className="text-[#9A9A9A]">
                  Selecione um arquivo Excel (.xlsx) ou CSV (.csv) com seus dados
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Seleção do tipo de importação */}
                <div>
                  <Label className="text-[#000000] font-medium mb-3 block">
                    Tipo de Importação
                  </Label>
                  <RadioGroup 
                    value={importType} 
                    onValueChange={(value: ImportType) => setImportType(value)}
                    className="grid grid-cols-2 gap-4"
                    disabled={isUploading}
                  >
                    <div className="flex items-center space-x-3 p-4 border-2 border-[#CFCFCF] rounded-lg hover:border-[#FFD300] transition-colors">
                      <RadioGroupItem value="produtos" id="produtos" />
                      <Label htmlFor="produtos" className="cursor-pointer flex-1">
                        <div className="font-medium">Produtos</div>
                        <div className="text-sm text-[#9A9A9A]">Cadastro de produtos</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border-2 border-[#CFCFCF] rounded-lg hover:border-[#FFD300] transition-colors">
                      <RadioGroupItem value="movimentacoes" id="movimentacoes" />
                      <Label htmlFor="movimentacoes" className="cursor-pointer flex-1">
                        <div className="font-medium">Movimentações</div>
                        <div className="text-sm text-[#9A9A9A]">Entrada/saída estoque</div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Upload Zone */}
                <div>
                  <Label htmlFor="file" className="text-[#000000] font-medium block mb-2">
                    Arquivo da Planilha
                  </Label>
                  <div 
                    className={`
                      border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
                      ${isDragOver 
                        ? "border-[#FFD300] bg-yellow-50" 
                        : selectedFile 
                          ? "border-green-300 bg-green-50" 
                          : "border-[#CFCFCF] hover:border-[#FFD300] hover:bg-gray-50"
                      }
                      ${isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                    `}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={selectedFile ? undefined : () => fileInputRef.current?.click()}
                  >
                    {selectedFile ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center space-x-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <FileSpreadsheet className="w-6 h-6 text-green-600" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-medium text-[#000000]">{selectedFile.name}</div>
                            <div className="text-sm text-[#9A9A9A]">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type || "Tipo desconhecido"}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeFile()
                            }}
                            className="h-8 w-8 p-0 hover:bg-red-100"
                            disabled={isUploading}
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                          <Upload className={`w-8 h-8 ${isDragOver ? "text-[#FFD300]" : "text-[#9A9A9A]"}`} />
                        </div>
                        <div>
                          <p className={`text-lg font-medium mb-2 ${isDragOver ? "text-[#FFD300]" : "text-[#000000]"}`}>
                            {isDragOver ? "Solte o arquivo aqui" : "Arraste e solte seu arquivo"}
                          </p>
                          <p className="text-[#9A9A9A] mb-4">ou</p>
                          <Button
                            variant="outline"
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="border-[#FFD300] text-[#FFD300] hover:bg-[#FFD300] hover:text-[#0C0C0C] bg-transparent"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Selecionar Arquivo
                          </Button>
                        </div>
                        <p className="text-xs text-[#9A9A9A]">
                          Formatos aceitos: .xlsx, .xls, .csv (máx. 10MB)
                        </p>
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleInputChange}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </div>
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
                    disabled={isUploading}
                  />
                </div>

                {/* Barra de progresso */}
                {isUploading && (
                  <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-700 font-medium">Processando arquivo...</span>
                      <span className="text-blue-600">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="w-full" />
                  </div>
                )}

                {/* Status da importação */}
                {uploadStatus === "success" && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Sucesso!</AlertTitle>
                    <AlertDescription className="text-green-700">
                      {importType === "produtos" ? "Produtos" : "Movimentações"} importados com sucesso!
                    </AlertDescription>
                  </Alert>
                )}

                {uploadStatus === "error" && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Erro na Importação</AlertTitle>
                    <AlertDescription>
                      {errorMessage || "Erro ao processar arquivo"}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Botão de processar */}
                <Button 
                  onClick={uploadFile}
                  disabled={!selectedFile || isUploading}
                  className="w-full bg-[#FFD300] text-[#0C0C0C] hover:bg-[#E6BD00] font-medium disabled:opacity-50 h-12"
                >
                  {isUploading 
                    ? "Processando..." 
                    : `Processar ${importType === "produtos" ? "Produtos" : "Movimentações"}`
                  }
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Coluna Lateral - Informações */}
          <div className="space-y-6">
            {/* Card com informações sobre o formato esperado */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader className="pb-4">
                <CardTitle className="font-semibold text-blue-900 flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                  </div>
                  Formato Esperado
                </CardTitle>
                <CardDescription className="text-blue-700">
                  {importType === "produtos" ? "Estrutura para produtos" : "Estrutura para movimentações"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-blue-800 space-y-2">
                  {importType === "produtos" ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-white/50 rounded-lg">
                        <div className="font-medium text-blue-900 mb-2">Colunas Obrigatórias:</div>
                        <ul className="space-y-1 text-sm">
                          <li><span className="font-medium">Nome:</span> Nome do produto</li>
                          <li><span className="font-medium">Preço:</span> Valor (ex: 29.99)</li>
                          <li><span className="font-medium">Descrição:</span> Detalhes do produto</li>
                          <li><span className="font-medium">Categoria:</span> Categoria do produto</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-3 bg-white/50 rounded-lg">
                        <div className="font-medium text-blue-900 mb-2">Colunas Obrigatórias:</div>
                        <ul className="space-y-1 text-sm">
                          <li><span className="font-medium">Nome do Produto:</span> Nome completo</li>
                          <li><span className="font-medium">Quantidade:</span> Número inteiro</li>
                          <li><span className="font-medium">Data:</span> Formato AAAA-MM-DD</li>
                          <li><span className="font-medium">Tipo:</span> "Compra" ou "Venda"</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="pt-4 border-t border-blue-200">
                  <p className="text-xs text-blue-700 mb-3 flex items-start gap-2">
                    <span className="text-lg">💡</span>
                    <span>Use o template abaixo para garantir que seu arquivo está no formato correto.</span>
                  </p>
                  <Button 
                    variant="outline"
                    onClick={downloadTemplate}
                    className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar Template
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Card de Dicas */}
            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
              <CardHeader className="pb-4">
                <CardTitle className="font-semibold text-yellow-900 flex items-center gap-2">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  </div>
                  Dicas Importantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-yellow-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-0.5">•</span>
                    <span>Verifique se todas as colunas obrigatórias estão preenchidas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-0.5">•</span>
                    <span>Remova linhas vazias antes de importar</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-0.5">•</span>
                    <span>Use o template fornecido para evitar erros</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-0.5">•</span>
                    <span>Tamanho máximo do arquivo: 10MB</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
