"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, FileX, Plus, RefreshCw } from "lucide-react"
import { ImportMovimentacoesResponse, ProdutoNaoEncontrado } from "@/types/import"

interface ImportResultDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  result: ImportMovimentacoesResponse
  onCadastrarProdutos: (produtos: string[]) => void
  onTentarNovamente: () => void
  onIgnorar: () => void
}

export function ImportResultDialog({
  open,
  onOpenChange,
  result,
  onCadastrarProdutos,
  onTentarNovamente,
  onIgnorar
}: ImportResultDialogProps) {
  const [selectedProdutos, setSelectedProdutos] = useState<string[]>([])

  const hasErrors = result.produtosNaoEncontrados.length > 0
  const isPartialSuccess = result.movimentacoesImportadas > 0 && hasErrors

  // Criar lista de produtos únicos
  const produtosUnicos = result.produtosNaoEncontrados.reduce((acc, produto) => {
    if (!acc.find(p => p.nomeProduto === produto.nomeProduto)) {
      acc.push(produto)
    }
    return acc
  }, [] as typeof result.produtosNaoEncontrados)

  // Obter lista de produtos únicos apenas os nomes
  const nomesProdutosUnicos = produtosUnicos.map(p => p.nomeProduto)

  const handleSelectProduto = (nomeProduto: string, checked: boolean) => {
    if (checked) {
      setSelectedProdutos(prev => [...prev, nomeProduto])
    } else {
      setSelectedProdutos(prev => prev.filter(p => p !== nomeProduto))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProdutos(nomesProdutosUnicos)
    } else {
      setSelectedProdutos([])
    }
  }

  const allSelected = selectedProdutos.length === nomesProdutosUnicos.length
  const someSelected = selectedProdutos.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {hasErrors ? (
              <>
                <AlertTriangle className="w-6 h-6 text-yellow-500" />
                Importação Parcial
              </>
            ) : (
              <>
                <CheckCircle className="w-6 h-6 text-green-500" />
                Importação Concluída
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {result.mensagem}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo da importação */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  Importadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {result.movimentacoesImportadas}
                </div>
                <p className="text-sm text-muted-foreground">movimentações processadas</p>
              </CardContent>
            </Card>

            {hasErrors && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 text-yellow-600">
                    <FileX className="w-5 h-5" />
                    Ignoradas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">
                    {result.movimentacoesIgnoradas}
                  </div>
                  <p className="text-sm text-muted-foreground">produtos não encontrados</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Lista de produtos não encontrados */}
          {hasErrors && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  Produtos Não Encontrados
                </CardTitle>
                <CardDescription>
                  Os produtos abaixo não foram encontrados no sistema. Você pode cadastrá-los e tentar importar novamente.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Seleção de todos */}
                  <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                    <Checkbox
                      id="select-all"
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                    />
                    <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                      Selecionar todos ({nomesProdutosUnicos.length} produtos únicos)
                    </label>
                  </div>

                  {/* Tabela de produtos */}
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12"></TableHead>
                          <TableHead>Produto</TableHead>
                          <TableHead className="text-center">Linha</TableHead>
                          <TableHead className="text-center">Quantidade</TableHead>
                          <TableHead className="text-center">Data</TableHead>
                          <TableHead className="text-center">Tipo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {produtosUnicos.map((produto, index) => (
                          <TableRow key={`${produto.nomeProduto}-${index}`}>
                            <TableCell>
                              <Checkbox
                                checked={selectedProdutos.includes(produto.nomeProduto)}
                                onCheckedChange={(checked) => 
                                  handleSelectProduto(produto.nomeProduto, checked as boolean)
                                }
                              />
                            </TableCell>
                            <TableCell className="font-medium">
                              {produto.nomeProduto}
                            </TableCell>
                            <TableCell className="text-center">
                              {produto.linha}
                            </TableCell>
                            <TableCell className="text-center">
                              {produto.quantidadeMovimentada}
                            </TableCell>
                            <TableCell className="text-center">
                              {new Date(produto.dataMovimentacao).toLocaleDateString('pt-BR')}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge 
                                variant={produto.tipoMovimentacao?.toLowerCase() === 'compra' ? 'default' : 'secondary'}
                                className={
                                  produto.tipoMovimentacao?.toLowerCase() === 'compra' 
                                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                                }
                              >
                                {produto.tipoMovimentacao?.toLowerCase() === 'compra' ? 'Compra' : 'Venda'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {someSelected && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-700">
                        {selectedProdutos.length} produto(s) selecionado(s) para cadastro
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="flex gap-2 flex-col sm:flex-row">
          {hasErrors ? (
            <>
              <Button
                variant="outline"
                onClick={onIgnorar}
                className="flex-1"
              >
                <FileX className="w-4 h-4 mr-2" />
                Ignorar e Continuar
              </Button>
              
              <Button
                variant="outline"
                onClick={onTentarNovamente}
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Corrigir Arquivo
              </Button>
              
              <Button
                onClick={() => onCadastrarProdutos(selectedProdutos)}
                disabled={!someSelected}
                className="flex-1 bg-[#FFD300] text-[#0C0C0C] hover:bg-[#E6BD00]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Selecionados ({selectedProdutos.length})
              </Button>
            </>
          ) : (
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full bg-[#FFD300] text-[#0C0C0C] hover:bg-[#E6BD00]"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Concluir
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
