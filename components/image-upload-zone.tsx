"use client"

import React, { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Image as ImageIcon, X, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"

interface ImageUploadZoneProps {
  onImageSelect: (file: File) => void
  selectedImage: File | null
  currentImageUrl?: string
  onRemoveImage: () => void
  maxSize?: number // em MB
  disabled?: boolean
  className?: string
}

// Constantes para validação de imagens
const VALID_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"] as const
const JPEG_SIGNATURE = [0xFF, 0xD8] as const
const PNG_SIGNATURE = [0x89, 0x50, 0x4E, 0x47] as const

export function ImageUploadZone({
  onImageSelect,
  selectedImage,
  currentImageUrl,
  onRemoveImage,
  maxSize = 5,
  disabled = false,
  className = ""
}: ImageUploadZoneProps) {
  
  const [isDragOver, setIsDragOver] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Criar preview da imagem selecionada
  React.useEffect(() => {
    if (selectedImage) {
      const url = URL.createObjectURL(selectedImage)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setPreviewUrl(null)
    }
  }, [selectedImage])

  const validateImage = async (file: File): Promise<boolean> => {
    // Verificar tipo MIME
    if (!VALID_IMAGE_TYPES.includes(file.type as any)) {
      toast({
        title: "Formato não suportado",
        description: "A imagem deve ser no formato JPEG ou PNG",
        variant: "destructive",
      })
      return false
    }

    // Verificar tamanho do arquivo
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSize) {
      toast({
        title: "Arquivo muito grande",
        description: `A imagem deve ter no máximo ${maxSize}MB. Tamanho atual: ${fileSizeMB.toFixed(2)}MB`,
        variant: "destructive",
      })
      return false
    }

    // Verificar assinatura dos bytes iniciais para confirmar que é uma imagem válida
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const buffer = e.target?.result as ArrayBuffer
        if (!buffer) {
          toast({
            title: "Erro na validação",
            description: "Não foi possível validar o arquivo",
            variant: "destructive",
          })
          resolve(false)
          return
        }

        const bytes = new Uint8Array(buffer, 0, 8)
        
        // Verificar assinatura JPEG (FF D8)
        const isJPEG = bytes[0] === JPEG_SIGNATURE[0] && bytes[1] === JPEG_SIGNATURE[1]
        
        // Verificar assinatura PNG (89 50 4E 47)
        const isPNG = bytes[0] === PNG_SIGNATURE[0] && bytes[1] === PNG_SIGNATURE[1] && 
                     bytes[2] === PNG_SIGNATURE[2] && bytes[3] === PNG_SIGNATURE[3]

        if (!isJPEG && !isPNG) {
          toast({
            title: "Arquivo inválido",
            description: "O arquivo selecionado não é uma imagem válida (JPEG ou PNG)",
            variant: "destructive",
          })
          resolve(false)
        } else {
          resolve(true)
        }
      }
      reader.onerror = () => {
        toast({
          title: "Erro na validação",
          description: "Não foi possível validar o arquivo",
          variant: "destructive",
        })
        resolve(false)
      }
      reader.readAsArrayBuffer(file.slice(0, 8)) // Ler apenas os primeiros 8 bytes
    })
  }

  const processImageFile = async (file: File) => {
    if (await validateImage(file)) {
      onImageSelect(file)
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(false)

    if (disabled) return

    const files = Array.from(event.dataTransfer.files)
    if (files.length > 0) {
      processImageFile(files[0])
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
      processImageFile(file)
    }
  }

  const openFileDialog = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  const handleRemoveImage = () => {
    onRemoveImage()
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const getImageUrl = () => {
    if (previewUrl) return previewUrl
    if (currentImageUrl) return currentImageUrl
    return null
  }

  const imageUrl = getImageUrl()

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Área de upload / preview */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={imageUrl ? undefined : openFileDialog}
        className={`
          relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 cursor-pointer
          ${isDragOver ? 'border-[#FFD300] bg-[#FFFDF0]' : 'border-gray-300 hover:border-[#FFD300]/50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${imageUrl ? 'border-solid border-gray-200' : ''}
        `}
      >
        {imageUrl ? (
          <div className="space-y-4">
            <div className="relative mx-auto w-32 h-32 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex justify-center gap-2">
              <Dialog open={showPreview} onOpenChange={setShowPreview}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-[#FFD300]/50 hover:border-[#FFD300] hover:bg-[#FFFDF0]"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Visualizar
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogTitle className="sr-only">Image Preview</DialogTitle>
                  <img
                    src={imageUrl}
                    alt="Preview ampliada"
                    className="w-full h-auto max-h-[70vh] object-contain"
                  />
                </DialogContent>
              </Dialog>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openFileDialog}
                className="border-[#FFD300]/50 hover:border-[#FFD300] hover:bg-[#FFFDF0]"
              >
                <Upload className="w-4 h-4 mr-2" />
                Trocar
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemoveImage}
                className="border-red-300 hover:border-red-400 hover:bg-red-50 text-red-600"
              >
                <X className="w-4 h-4 mr-2" />
                Remover
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#FFD300]/20 to-[#FFD300]/10 rounded-full flex items-center justify-center mb-4">
              <ImageIcon className="h-8 w-8 text-[#FFD300]" />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">
                Arraste uma imagem ou clique para selecionar
              </p>
              <p className="text-xs text-gray-500">
                JPEG, PNG até {maxSize}MB
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              className="mt-4 border-[#FFD300]/50 hover:border-[#FFD300] hover:bg-[#FFFDF0]"
            >
              <Upload className="w-4 h-4 mr-2" />
              Selecionar Imagem
            </Button>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Informações da imagem selecionada */}
      {selectedImage && (
        <div className="text-xs text-gray-500 text-center">
          {selectedImage.name} ({(selectedImage.size / 1024 / 1024).toFixed(2)}MB)
        </div>
      )}
    </div>
  )
}