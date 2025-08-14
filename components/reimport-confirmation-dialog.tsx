"use client"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, RefreshCw, X } from "lucide-react"

interface ReimportConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  produtosCadastrados: number
  onConfirm: () => void
  onCancel: () => void
}

export function ReimportConfirmationDialog({
  open,
  onOpenChange,
  produtosCadastrados,
  onConfirm,
  onCancel
}: ReimportConfirmationDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  const handleCancel = () => {
    onCancel()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-500" />
            Produtos Cadastrados!
          </DialogTitle>
          <DialogDescription className="text-left pt-2">
            {produtosCadastrados} produto(s) foram cadastrados com sucesso no sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 font-medium mb-2">
              💡 Recomendação
            </p>
            <p className="text-blue-700 text-sm">
              Agora que os produtos foram cadastrados, é recomendável tentar importar o arquivo novamente 
              para processar as movimentações desses produtos.
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1"
          >
            <X className="w-4 h-4 mr-2" />
            Não, Obrigado
          </Button>
          
          <Button
            onClick={handleConfirm}
            className="flex-1 bg-[#FFD300] text-[#0C0C0C] hover:bg-[#E6BD00]"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Sim, Reimportar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
