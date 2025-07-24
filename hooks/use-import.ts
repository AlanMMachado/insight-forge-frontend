"use client"

import { useState, useCallback } from "react"
import { ApiService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export type ImportType = "produtos" | "movimentacoes"

export interface ImportResult {
  success: boolean
  message: string
  recordsProcessed?: number
}

export interface UseImportProps {
  onSuccess?: (result: ImportResult) => void
  onError?: (error: string) => void
}

export function useImport({ onSuccess, onError }: UseImportProps = {}) {
  const [isImporting, setIsImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()

  const importFile = useCallback(async (
    file: File, 
    type: ImportType
  ): Promise<ImportResult> => {
    setIsImporting(true)
    setProgress(0)

    try {
      // Simular progresso de upload
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      let message: string
      if (type === "produtos") {
        message = await ApiService.importarProdutos(file)
      } else {
        message = await ApiService.importarMovimentacoes(file)
      }

      clearInterval(progressInterval)
      setProgress(100)

      const result: ImportResult = {
        success: true,
        message
      }

      toast({
        title: "Importação concluída",
        description: message,
      })

      onSuccess?.(result)
      return result

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
      
      toast({
        title: "Erro na importação",
        description: errorMessage,
        variant: "destructive",
      })

      onError?.(errorMessage)
      
      return {
        success: false,
        message: errorMessage
      }
    } finally {
      setIsImporting(false)
      // Reset progress after a delay
      setTimeout(() => setProgress(0), 2000)
    }
  }, [toast, onSuccess, onError])

  const downloadTemplate = useCallback(async (type: ImportType) => {
    try {
      if (type === "produtos") {
        const blob = await ApiService.exportarProdutos()
        const filename = "template-produtos.xlsx"
        
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast({
          title: "Template baixado",
          description: `Template para ${type} baixado com sucesso`,
        })

        return true
      } else {
        // Para movimentações, não há template disponível ainda
        toast({
          title: "Template não disponível",
          description: "Template para movimentações ainda não está disponível",
          variant: "destructive",
        })
        return false
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
      
      toast({
        title: "Erro ao baixar template",
        description: errorMessage,
        variant: "destructive",
      })

      return false
    }
  }, [toast])

  return {
    isImporting,
    progress,
    importFile,
    downloadTemplate
  }
}
