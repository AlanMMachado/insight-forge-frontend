"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Package, Save, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ApiService } from "@/lib/api"
import { CATEGORIAS_PRODUTOS } from "@/lib/categorias"
import { ProdutoParaCadastro } from "@/types/import"

interface QuickProductRegistrationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  produtos: string[]
  onComplete: (produtosCadastrados: string[]) => void
}

export function QuickProductRegistration({
  open,
  onOpenChange,
  produtos,
  onComplete
}: QuickProductRegistrationProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [produtosCadastrados, setProdutosCadastrados] = useState<string[]>([])
  const [produtoAtual, setProdutoAtual] = useState<ProdutoParaCadastro>({
    nome: '',
    categoria: '',
    preco: undefined,
    custo: undefined,
    descricao: '',
    quantidadeInicial: undefined
  })
  const { toast } = useToast()

  const currentProduct = produtos[currentIndex] || ''
  const totalProdutos = produtos.length
  const progress = totalProdutos > 0 ? ((currentIndex + 1) / totalProdutos) * 100 : 0

  // Reset form when dialog opens or product changes
  useEffect(() => {
    if (currentProduct && currentProduct !== produtoAtual.nome) {
      setProdutoAtual({
        nome: currentProduct,
        categoria: '',
        preco: undefined,
        custo: undefined,
        descricao: '',
        quantidadeInicial: undefined
      })
    }
  }, [currentProduct, produtoAtual.nome])

  const handleInputChange = (field: keyof ProdutoParaCadastro, value: string | number | undefined) => {
    setProdutoAtual(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!produtoAtual.nome) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe o nome do produto",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      await ApiService.criarProduto({
        nome: produtoAtual.nome,
        descricao: produtoAtual.descricao || '',
        preco: Number(produtoAtual.preco) || 0,
        custo: Number(produtoAtual.custo) || 0,
        categoria: produtoAtual.categoria || 'Geral',
        quantidadeEstoque: Number(produtoAtual.quantidadeInicial) || 0
      })

      setProdutosCadastrados(prev => [...prev, produtoAtual.nome])

      toast({
        title: "Produto cadastrado",
        description: `${produtoAtual.nome} foi cadastrado com sucesso`,
      })

      // Move to next product or complete
      if (currentIndex < totalProdutos - 1) {
        setCurrentIndex(prev => prev + 1)
        const nextProduct = produtos[currentIndex + 1]
        setProdutoAtual({
          nome: nextProduct,
          categoria: produtoAtual.categoria, // Keep category from previous
          preco: undefined,
          custo: undefined,
          descricao: '',
          quantidadeInicial: undefined
        })
      } else {
        // All products registered
        onComplete(produtosCadastrados)
        handleClose()
      }
    } catch (error) {
      toast({
        title: "Erro ao cadastrar produto",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = () => {
    if (currentIndex < totalProdutos - 1) {
      setCurrentIndex(prev => prev + 1)
      const nextProduct = produtos[currentIndex + 1]
      setProdutoAtual({
        nome: nextProduct,
        categoria: produtoAtual.categoria, // Keep category from previous
        preco: undefined,
        custo: undefined,
        descricao: '',
        quantidadeInicial: undefined
      })
    } else {
      onComplete(produtosCadastrados)
      handleClose()
    }
  }

  const handleClose = () => {
    setCurrentIndex(0)
    setProdutosCadastrados([])
    setProdutoAtual({
      nome: '',
      categoria: '',
      preco: undefined,
      custo: undefined,
      descricao: '',
      quantidadeInicial: undefined
    })
    onOpenChange(false)
  }

  if (!open || produtos.length === 0) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Package className="w-6 h-6 text-[#FFD300]" />
            Cadastro Rápido de Produtos
          </DialogTitle>
          <DialogDescription>
            Cadastre os produtos não encontrados para permitir a importação das movimentações
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Produto {currentIndex + 1} de {totalProdutos}
              </span>
              <span className="text-muted-foreground">
                {produtosCadastrados.length} cadastrados
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Current Product Form */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">
                {currentProduct}
                <Badge variant="outline" className="ml-2">
                  {currentIndex + 1}/{totalProdutos}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome do Produto *</Label>
                  <Input
                    id="nome"
                    value={produtoAtual.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    placeholder="Nome do produto"
                  />
                </div>

                <div>
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select
                    value={produtoAtual.categoria}
                    onValueChange={(value) => handleInputChange('categoria', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS_PRODUTOS.map((categoria) => (
                        <SelectItem key={categoria.value} value={categoria.value}>
                          {categoria.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="preco">Preço de Venda (R$)</Label>
                  <Input
                    id="preco"
                    type="number"
                    step="0.01"
                    min="0"
                    value={produtoAtual.preco || ''}
                    onChange={(e) => handleInputChange('preco', parseFloat(e.target.value) || undefined)}
                    placeholder="0,00"
                  />
                </div>

                <div>
                  <Label htmlFor="custo">Custo (R$)</Label>
                  <Input
                    id="custo"
                    type="number"
                    step="0.01"
                    min="0"
                    value={produtoAtual.custo || ''}
                    onChange={(e) => handleInputChange('custo', parseFloat(e.target.value) || undefined)}
                    placeholder="0,00"
                  />
                </div>

                <div>
                  <Label htmlFor="quantidade">Quantidade Inicial</Label>
                  <Input
                    id="quantidade"
                    type="number"
                    min="0"
                    value={produtoAtual.quantidadeInicial || ''}
                    onChange={(e) => handleInputChange('quantidadeInicial', parseInt(e.target.value) || undefined)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={produtoAtual.descricao}
                  onChange={(e) => handleInputChange('descricao', e.target.value)}
                  placeholder="Descrição do produto (opcional)"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Produtos já cadastrados */}
          {produtosCadastrados.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Produtos Cadastrados ({produtosCadastrados.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {produtosCadastrados.map((nome, index) => (
                    <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                      {nome}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={isSubmitting}
          >
            Pular Este
          </Button>

          <Button
            onClick={handleSave}
            disabled={isSubmitting || !produtoAtual.nome}
            className="bg-[#FFD300] text-[#0C0C0C] hover:bg-[#E6BD00]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar e Continuar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
