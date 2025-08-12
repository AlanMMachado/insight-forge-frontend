"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Package, Search, Download, Filter, MoveHorizontal } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ApiService, Movimentacao, Produto } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import AuthenticatedLayout from "@/components/authenticated-layout"

export default function MovimentacoesPage() {
  const { toast } = useToast()
  type MovimentacaoWithProduto = Movimentacao & { produtoCompleto?: Produto }
  
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoWithProduto[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [hasSearched, setHasSearched] = useState(false)
  const [filterTipo, setFilterTipo] = useState<'COMPRA' | 'VENDA' | ''>("")
  const [filterProdutoId, setFilterProdutoId] = useState<number | null>(null)
  const [filterDataInicio, setFilterDataInicio] = useState("")
  const [filterDataFim, setFilterDataFim] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [formData, setFormData] = useState<Omit<Movimentacao, "id" | "dataCriacao">>({
    produto: { id: 0 },
    tipoMovimentacao: "COMPRA",
    quantidadeMovimentada: 1,
    dataMovimentacao: new Date().toISOString().split('T')[0],
    motivo: "",
    observacoes: ""
  })

  // Carregar movimentações
  const loadMovimentacoes = async () => {
    try {
      setLoading(true)
      let data: Movimentacao[]
      
      // Aplicar filtros do backend ou listar todas
      if (!filterTipo && !filterProdutoId && !filterDataInicio && !filterDataFim) {
        // Se não houver filtros ativos, lista todas as movimentações
        data = await ApiService.listarMovimentacoes()
      } else if (filterTipo) {
        data = await ApiService.filtrarPorTipo(filterTipo)
      } else if (filterDataInicio && filterDataFim) {
        data = await ApiService.filtrarPorData(filterDataInicio, filterDataFim)
      } else if (filterProdutoId) {
        data = await ApiService.filtrarPorProduto(filterProdutoId)
      } else {
        data = await ApiService.listarMovimentacoes()
      }
      
      // Buscar informações dos produtos para cada movimentação
      const movimentacoesComProdutos = await Promise.all(
        data.map(async (mov) => {
          try {
            const produto = await ApiService.buscarProdutoPorId(mov.produto.id)
            return { ...mov, produtoCompleto: produto }
          } catch {
            return mov
          }
        })
      )
      
      setMovimentacoes(movimentacoesComProdutos)
    } catch (error) {
      toast({
        title: "Erro ao carregar movimentações",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Carregar produtos
  const loadProdutos = async () => {
    try {
      const data = await ApiService.listarProdutos()
      setProdutos(data)
    } catch (error) {
      toast({
        title: "Erro ao carregar produtos",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      })
    }
  }

  // Criar movimentação
  const handleCreateMovimentacao = async () => {
    if (!formData.produto.id || !formData.quantidadeMovimentada) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      })
      return
    }

    try {
      await ApiService.criarMovimentacao(formData)
      toast({
        title: "Movimentação criada",
        description: "Movimentação criada com sucesso!"
      })
      setShowCreateDialog(false)
      resetForm()
      loadMovimentacoes()
    } catch (error) {
      toast({
        title: "Erro ao criar movimentação",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      })
    }
  }

  // Pesquisar por produto
  const searchMovimentacoes = async () => {
    if (!searchTerm.trim()) {
      loadMovimentacoes()
      return
    }

    try {
      setLoading(true)
      const produtosEncontrados = await ApiService.buscarProdutoPorNome(searchTerm)
      if (produtosEncontrados.length === 0) {
        setMovimentacoes([])
        return
      }

      const todasMovimentacoes = await Promise.all(
        produtosEncontrados.map(async (produto) => {
          try {
            const movs = await ApiService.listarMovimentacoes()
            return movs
              .filter(mov => mov.produto.id === produto.id)
              .map(mov => ({ ...mov, produtoCompleto: produto }))
          } catch {
            return []
          }
        })
      )

      setMovimentacoes(todasMovimentacoes.flat() as MovimentacaoWithProduto[])
    } catch (error) {
      toast({
        title: "Erro na busca",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Exportar movimentações
  const handleExportMovimentacoes = async () => {
    try {
      let blob: Blob
      if (filterProdutoId) {
        blob = await ApiService.exportarMovimentacoesPorProduto(filterProdutoId)
      } else if (filterTipo) {
        blob = await ApiService.exportarMovimentacoesPorTipo(filterTipo)
      } else if (filterDataInicio && filterDataFim) {
        blob = await ApiService.exportarMovimentacoesPorData(filterDataInicio, filterDataFim)
      } else {
        toast({
          title: "Selecione um filtro",
          description: "Selecione um período, tipo de movimentação ou produto para exportar",
          variant: "destructive"
        })
        return
      }

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'movimentacoes.xlsx'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: "Exportação concluída",
        description: "Movimentações exportadas com sucesso!"
      })
    } catch (error) {
      toast({
        title: "Erro ao exportar movimentações",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setFormData({
      produto: { id: 0 },
      tipoMovimentacao: "COMPRA",
      quantidadeMovimentada: 1,
      dataMovimentacao: new Date().toISOString().split('T')[0],
      motivo: "",
      observacoes: ""
    })
  }

  // Filtrar movimentações
  const filteredMovimentacoes = movimentacoes.filter(mov => {
    const matchesTipo = !filterTipo || mov.tipoMovimentacao === filterTipo
    const matchesProduto = !filterProdutoId || mov.produto.id === filterProdutoId
    
    const dataMovimentacao = parseISO(mov.dataMovimentacao)
    const matchesDataInicio = !filterDataInicio || dataMovimentacao >= parseISO(filterDataInicio)
    const matchesDataFim = !filterDataFim || dataMovimentacao <= parseISO(filterDataFim)

    return matchesTipo && matchesProduto && matchesDataInicio && matchesDataFim
  })

  useEffect(() => {
    loadMovimentacoes()
    loadProdutos()
  }, [])

  return (
    <AuthenticatedLayout>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <MoveHorizontal className="h-6 w-6 mr-2 text-[#FFD300]" />
          <div>
            <h1 className="text-3xl font-bold text-[#000000]">Movimentações</h1>
            <p className="text-[#9A9A9A] mt-2">Gerencie as movimentações dos seus produtos</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button onClick={() => handleExportMovimentacoes()} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={() => setShowCreateDialog(true)} className="bg-[#FFD300] text-[#0C0C0C] hover:bg-[#E6BD00]">
            <Package className="w-4 h-4 mr-2" />
            Nova Movimentação
          </Button>
        </div>
      </div>

      {/* Controles de Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Buscar Movimentações</CardTitle>
          <CardDescription>Use os filtros abaixo para encontrar movimentações específicas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
            {/* Campo de busca por produto */}
            <div className="lg:col-span-5">
              <Label htmlFor="search">Nome do Produto</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Digite o nome do produto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-10"
                  onKeyPress={(e) => e.key === 'Enter' && searchMovimentacoes()}
                />
              </div>
            </div>
            
            {/* Botões de ação */}
            <div className="lg:col-span-7 flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
              <Button
                onClick={() => {
                  setHasSearched(true)
                  searchMovimentacoes()
                }}
                disabled={loading}
                className="bg-[#FFD300] text-[#0C0C0C] hover:bg-[#E6BD00] flex-1 h-10"
              >
                <Search className="w-4 h-4 mr-2" />
                Buscar
              </Button>
              <Button
                onClick={() => {
                  setHasSearched(true)
                  setFilterTipo("")
                  setFilterProdutoId(null)
                  setFilterDataInicio("")
                  setFilterDataFim("")
                  setSearchTerm("")
                  loadMovimentacoes()
                }}
                disabled={loading}
                variant="outline"
                className="flex-1 h-10"
              >
                <MoveHorizontal className="w-4 h-4 mr-2" />
                Todas
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Movimentações */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>
              Movimentações ({filteredMovimentacoes.length})
            </CardTitle>
          </div>
          <Button 
            variant="outline" 
            onClick={() => {
              setHasSearched(false)
              setFilterTipo("")
              setFilterProdutoId(null)
              setFilterDataInicio("")
              setFilterDataFim("")
              loadMovimentacoes()
            }}
          >
            <Filter className="w-4 h-4 mr-2" />
            Limpar Filtros
          </Button>
        </CardHeader>
        <CardContent>
          {!hasSearched ? (
            <div className="text-center py-8">
              <Search className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Use a busca ou os filtros</h3>
              <p className="mt-1 text-sm text-gray-500">
                Digite o nome do produto ou use os filtros para visualizar as movimentações.
              </p>
            </div>
          ) : loading ? (
            <div className="text-center py-8">Carregando movimentações...</div>
          ) : movimentacoes.length === 0 ? (
            <div className="text-center py-8">
              <MoveHorizontal className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma movimentação encontrada</h3>
              <p className="mt-1 text-sm text-gray-500">
                Comece criando sua primeira movimentação.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Filtros */}
              <div className="border-b pb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="filterTipo">Filtrar por tipo</Label>
                    <Select value={filterTipo || "all"} onValueChange={(value: 'all' | 'COMPRA' | 'VENDA') => {
                      setFilterTipo(value === "all" ? "" : value)
                      if (value !== "all") {
                        setFilterProdutoId(null)
                        setFilterDataInicio("")
                        setFilterDataFim("")
                        loadMovimentacoes()
                      } else {
                        loadMovimentacoes()
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os tipos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os tipos</SelectItem>
                        <SelectItem value="COMPRA">Compra</SelectItem>
                        <SelectItem value="VENDA">Venda</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="filterProduto">Filtrar por produto</Label>
                    <Select 
                      value={filterProdutoId?.toString() || "all"} 
                      onValueChange={(value) => {
                        const id = value === "all" ? null : parseInt(value)
                        setFilterProdutoId(id)
                        if (id) {
                          setFilterTipo("")
                          setFilterDataInicio("")
                          setFilterDataFim("")
                        } else {
                          setFilterTipo("")
                        }
                        loadMovimentacoes()
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os produtos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os produtos</SelectItem>
                        {produtos.map(produto => (
                          <SelectItem key={produto.id} value={produto.id!.toString()}>
                            {produto.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="filterDataInicio">Data Início</Label>
                    <Input
                      type="date"
                      value={filterDataInicio}
                      onChange={(e) => {
                        setFilterDataInicio(e.target.value)
                        if (filterDataFim && e.target.value) {
                          setFilterTipo("")
                          setFilterProdutoId(null)
                          loadMovimentacoes()
                        }
                      }}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="filterDataFim">Data Fim</Label>
                    <Input
                      type="date"
                      value={filterDataFim}
                      onChange={(e) => {
                        setFilterDataFim(e.target.value)
                        if (filterDataInicio && e.target.value) {
                          setFilterTipo("")
                          setFilterProdutoId(null)
                          loadMovimentacoes()
                        }
                      }}
                    />
                  </div>
                </div>
                

              </div>

              {/* Tabela */}
              {filteredMovimentacoes.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-center">Quantidade</TableHead>
                        <TableHead>Motivo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMovimentacoes.map((movimentacao) => (
                        <TableRow key={movimentacao.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{movimentacao.produtoCompleto?.nome || 'Produto não encontrado'}</div>
                              <div className="text-xs text-gray-500">{movimentacao.produtoCompleto?.categoria || '-'}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {format(parseISO(movimentacao.dataMovimentacao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </TableCell>
                          <TableCell>
                            <Badge variant={movimentacao.tipoMovimentacao === 'COMPRA' ? 'default' : 'secondary'}>
                              {movimentacao.tipoMovimentacao === 'COMPRA' ? 'Compra' : 'Venda'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {movimentacao.quantidadeMovimentada}
                          </TableCell>
                          <TableCell>
                            {movimentacao.motivo || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <MoveHorizontal className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum resultado encontrado</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Tente ajustar os filtros para encontrar o que procura.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para Criar Movimentação */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Movimentação</DialogTitle>
            <DialogDescription>
              Registre uma nova movimentação de produto
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="produto">Produto *</Label>
              <Select
                value={formData.produto.id.toString()}
                onValueChange={(value) => setFormData({...formData, produto: { id: parseInt(value) }})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {produtos.map((produto) => (
                    <SelectItem key={produto.id} value={produto.id!.toString()}>
                      {produto.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="tipo">Tipo de Movimentação *</Label>
              <Select
                value={formData.tipoMovimentacao}
                onValueChange={(value: 'COMPRA' | 'VENDA') => setFormData({...formData, tipoMovimentacao: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COMPRA">Compra</SelectItem>
                  <SelectItem value="VENDA">Venda</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="quantidade">Quantidade *</Label>
              <Input
                id="quantidade"
                type="number"
                min="1"
                value={formData.quantidadeMovimentada}
                onChange={(e) => setFormData({...formData, quantidadeMovimentada: parseInt(e.target.value) || 0})}
              />
            </div>
            
            <div>
              <Label htmlFor="data">Data da Movimentação *</Label>
              <Input
                id="data"
                type="date"
                value={formData.dataMovimentacao}
                onChange={(e) => setFormData({...formData, dataMovimentacao: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="motivo">Motivo</Label>
              <Input
                id="motivo"
                value={formData.motivo}
                onChange={(e) => setFormData({...formData, motivo: e.target.value})}
                placeholder="Motivo da movimentação"
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Input
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                placeholder="Observações adicionais"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateMovimentacao}
              disabled={!formData.produto.id || !formData.quantidadeMovimentada}
              className="bg-[#FFD300] text-[#0C0C0C] hover:bg-[#E6BD00]"
            >
              Criar Movimentação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </AuthenticatedLayout>
  )
}
