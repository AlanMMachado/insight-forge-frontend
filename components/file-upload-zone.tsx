"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, FileSpreadsheet, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void
  selectedFile: File | null
  onRemoveFile: () => void
  accept?: string
  maxSize?: number // em MB
  disabled?: boolean
}

export function FileUploadZone({
  onFileSelect,
  selectedFile,
  onRemoveFile,
  accept = ".xlsx,.xls",
  maxSize = 10,
  disabled = false
}: FileUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const validateFile = (file: File): boolean => {
    // Verificar tipo de arquivo
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel"
    ]
    
    const validExtensions = [".xlsx", ".xls"]
    const hasValidType = validTypes.includes(file.type)
    const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))

    if (!hasValidType && !hasValidExtension) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione um arquivo Excel (.xlsx ou .xls)",
        variant: "destructive",
      })
      return false
    }

    // Verificar tamanho do arquivo
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSize) {
      toast({
        title: "Arquivo muito grande",
        description: `O arquivo deve ter no máximo ${maxSize}MB. Tamanho atual: ${fileSizeMB.toFixed(2)}MB`,
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      onFileSelect(file)
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(false)

    if (disabled) return

    const files = Array.from(event.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (!disabled) {
      setIsDragOver(true)
    }
  }

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(false)
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const openFileDialog = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div
      className={`
        mt-2 border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
        ${isDragOver 
          ? "border-[#FFD300] bg-yellow-50" 
          : selectedFile 
            ? "border-green-300 bg-green-50" 
            : "border-[#CFCFCF] hover:border-[#FFD300]"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={selectedFile ? undefined : openFileDialog}
    >
      {selectedFile ? (
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <FileSpreadsheet className="w-6 h-6 text-green-600" />
            <span className="text-[#000000] font-medium">{selectedFile.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onRemoveFile()
              }}
              className="h-6 w-6 p-0 hover:bg-red-100"
              disabled={disabled}
            >
              <X className="w-4 h-4 text-red-500" />
            </Button>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-[#9A9A9A]">
              Tamanho: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <p className="text-sm text-[#9A9A9A]">
              Tipo: {selectedFile.type || "Desconhecido"}
            </p>
          </div>
        </div>
      ) : (
        <div>
          <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragOver ? "text-[#FFD300]" : "text-[#9A9A9A]"}`} />
          <p className={`mb-2 ${isDragOver ? "text-[#FFD300]" : "text-[#9A9A9A]"}`}>
            {isDragOver ? "Solte o arquivo aqui" : "Arraste e solte seu arquivo aqui ou"}
          </p>
          {!isDragOver && (
            <Button
              variant="outline"
              type="button"
              onClick={openFileDialog}
              disabled={disabled}
              className="border-[#FFD300] text-[#FFD300] hover:bg-[#FFD300] hover:text-[#0C0C0C] bg-transparent"
            >
              Selecionar Arquivo
            </Button>
          )}
          <p className="text-xs text-[#9A9A9A] mt-2">
            Formatos aceitos: .xlsx, .xls (máx. {maxSize}MB)
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  )
}
