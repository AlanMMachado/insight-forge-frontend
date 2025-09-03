"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Package, Search, Download, Filter, MoveHorizontal, Upload, ArrowUpDown, ArrowUp, ArrowDown, Eye, Edit, Trash2, Plus, Table2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ApiService, Movimentacao, Produto } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { format, parseISO, isValid } from "date-fns"
import { ptBR } from "date-fns/locale"
import AuthenticatedLayout from "@/components/authenticated-layout"

export default function MovimentacoesPage() {
  const router = useRouter()
  const { toast } = useToast()
  type MovimentacaoWithProduto = Movimentacao & { produtoCompleto?: Produto }
  
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoWithProduto[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [hasSearched, setHasSearched] = useState(false)
  const [filterTipo, setFilterTipo] = useState<'Compra' | 'Venda' | ''>("")
  const [filterProdutoId, setFilterProdutoId] = useState<number | null>(null)
  const [filterCategoria, setFilterCategoria] = useState<string | null>(null)
  const [categorias, setCategorias] = useState<string[]>([])
  const [filterDataInicio, setFilterDataInicio] = useState("")
  const [filterDataFim, setFilterDataFim] = useState("")
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc') // 'desc' = mais recente primeiro
  const [exportLoading, setExportLoading] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [exportOption, setExportOption] = useState<'all' | 'produto' | 'categoria' | 'periodo'>('all')
  const [exportProdutoId, setExportProdutoId] = useState<number | null>(null)
  const [exportCategoria, setExportCategoria] = useState<string | null>(null)
  const [exportDataInicio, setExportDataInicio] = useState('')
  const [exportDataFim, setExportDataFim] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [formData, setFormData] = useState<Omit<Movimentacao, "id" | "dataCriacao">>({
    produto: { id: 0 },
    tipoMovimentacao: "Compra", // Padrão atualizado para o formato correto
    quantidadeMovimentada: 1,
    dataMovimentacao: new Date().toISOString().split('T')[0]
  })

  const [selectedMovimentacao, setSelectedMovimentacao] = useState<MovimentacaoWithProduto | null>(null)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)

  // Função para converter formato de tipo para o backend
  const mapTipoForBackend = (tipo: string): 'COMPRA' | 'VENDA' => {
    return tipo.toLowerCase() === 'compra' ? 'COMPRA' : 'VENDA'
  }

  // Gera um nome de arquivo legível baseado nos filtros ativos
  const sanitizeFilename = (s: string) => {
    return s
      .normalize('NFKD')
      .replace(/[^a-zA-Z0-9\.\-\_ ]/g, '')
      .trim()
      .replace(/\s+/g, '_')
  }

  const buildExportFilename = (): string => {
    const parts: string[] = ['movimentacoes']
    if (filterProdutoId) {
      const p = produtos.find(p => p.id === filterProdutoId)
      parts.push(`produto-${sanitizeFilename(p?.nome || String(filterProdutoId))}`)
    }
    if (filterCategoria) parts.push(`categoria-${sanitizeFilename(filterCategoria)}`)
    if (filterTipo) parts.push(`tipo-${sanitizeFilename(filterTipo)}`)
    if (filterDataInicio && filterDataFim) parts.push(`${filterDataInicio}_to_${filterDataFim}`)

    return `${parts.join('_')}.xlsx`
  }

  // Carregar movimentações
  const loadMovimentacoes = useCallback(async () => {
    try {
      setLoading(true)
      let data: Movimentacao[]
      
      // Sempre carrega todas as movimentações e aplica filtros no frontend
      // Isso é mais simples e permite combinação de filtros
      data = await ApiService.listarMovimentacoes()
      
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
      setHasSearched(true)
    } catch (error) {
      toast({
        title: "Erro ao carregar movimentações",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Carregar produtos
  const loadProdutos = useCallback(async () => {
    try {
      const data = await ApiService.listarProdutos()
      setProdutos(data)
      // extrair categorias únicas para o filtro
      const cats = Array.from(new Set(data.map(p => p.categoria).filter(Boolean))) as string[]
      setCategorias(cats)
    } catch (error) {
      toast({
        title: "Erro ao carregar produtos",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      })
    }
  }, [toast])

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
      const payload = { ...formData, tipoMovimentacao: mapTipoForBackend(formData.tipoMovimentacao) }
      await ApiService.criarMovimentacao(payload as Movimentacao)
      toast({
        title: "Movimentação criada",
        description: "Movimentação criada com sucesso!"
      })
      setShowCreateDialog(false)
      resetForm()
      if (hasSearched) {
        loadMovimentacoes()
      }
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
        setHasSearched(true)
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
      setHasSearched(true)
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
      setExportLoading(true)
      let result: { blob: Blob; filename?: string }
      if (filterProdutoId) {
        result = await ApiService.exportarMovimentacoesPorProduto(filterProdutoId)
      } else if (filterCategoria) {
        result = await ApiService.exportarMovimentacoesPorCategoria(filterCategoria)
      } else if (filterTipo) {
        result = await ApiService.exportarMovimentacoesPorTipo(mapTipoForBackend(filterTipo))
      } else if (filterDataInicio && filterDataFim) {
        result = await ApiService.exportarMovimentacoesPorData(filterDataInicio, filterDataFim)
      } else {
        // Nenhum filtro aplicado -> exporta todas as movimentações
        result = await ApiService.exportarMovimentacoes()
      }

  const url = window.URL.createObjectURL(result.blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = result.filename || buildExportFilename();
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Exportação concluída",
        description: "Movimentações exportadas com sucesso!"
      });
    } catch (error) {
      toast({
        title: "Erro ao exportar movimentações",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setExportLoading(false)
    }
  }

  // Helper to perform export given explicit options (used by modal)
  const performExport = async (option: 'all' | 'produto' | 'categoria' | 'periodo', opts?: { produtoId?: number; categoria?: string; dataInicio?: string; dataFim?: string }) => {
    try {
      setExportLoading(true)
      let result: { blob: Blob; filename?: string }
      if (option === 'produto' && opts?.produtoId) {
        result = await ApiService.exportarMovimentacoesPorProduto(opts.produtoId)
      } else if (option === 'categoria' && opts?.categoria) {
        result = await ApiService.exportarMovimentacoesPorCategoria(opts.categoria)
      } else if (option === 'periodo' && opts?.dataInicio && opts?.dataFim) {
        result = await ApiService.exportarMovimentacoesPorData(opts.dataInicio, opts.dataFim)
      } else if (option === 'all') {
        result = await ApiService.exportarMovimentacoes()
      } else {
        throw new Error('Parâmetros de exportação inválidos')
      }

      const url = window.URL.createObjectURL(result.blob);
      const a = document.createElement('a');
      a.href = url;
      // try backend filename, otherwise build a name based on opts or current filters
      let filename = result.filename || buildExportFilename()
      if (!result.filename) {
        const prevParts: string[] = ['movimentacoes']
        if (option === 'produto' && opts?.produtoId) {
          const p = produtos.find(p => p.id === opts.produtoId)
          prevParts.push(`produto-${sanitizeFilename(p?.nome || String(opts.produtoId))}`)
        }
        if (option === 'categoria' && opts?.categoria) prevParts.push(`categoria-${sanitizeFilename(opts.categoria)}`)
        if (option === 'periodo' && opts?.dataInicio && opts?.dataFim) prevParts.push(`${opts.dataInicio}_to_${opts.dataFim}`)
        filename = `${prevParts.join('_')}.xlsx`
      }
      a.download = filename
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({ title: 'Exportação concluída', description: 'Movimentações exportadas com sucesso!' })
    } catch (error) {
      toast({ title: 'Erro ao exportar movimentações', description: error instanceof Error ? error.message : 'Erro desconhecido', variant: 'destructive' })
    } finally {
      setExportLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      produto: { id: 0 },
      tipoMovimentacao: "Compra", // Padrão atualizado
      quantidadeMovimentada: 1,
      dataMovimentacao: new Date().toISOString().split('T')[0]
    });
  };

  // Filtrar e ordenar movimentações
  const filteredMovimentacoes = movimentacoes
    .filter(mov => {
      const matchesTipo = !filterTipo || mov.tipoMovimentacao?.toLowerCase() === filterTipo.toLowerCase();
      const matchesProduto = !filterProdutoId || mov.produto.id === filterProdutoId;
      const matchesCategoria = !filterCategoria || mov.produtoCompleto?.categoria === filterCategoria;
      
      const dataMovimentacao = parseISO(mov.dataMovimentacao);
      const matchesDataInicio = !filterDataInicio || dataMovimentacao >= parseISO(filterDataInicio);
      const matchesDataFim = !filterDataFim || dataMovimentacao <= parseISO(filterDataFim);

      return matchesTipo && matchesProduto && matchesCategoria && matchesDataInicio && matchesDataFim;
    })
    .sort((a, b) => {
      const dataA = parseISO(a.dataMovimentacao);
      const dataB = parseISO(b.dataMovimentacao);
      
      if (sortOrder === 'desc') {
        return dataB.getTime() - dataA.getTime(); // Mais recente primeiro
      } else {
        return dataA.getTime() - dataB.getTime(); // Mais antigo primeiro
      }
    });

  useEffect(() => {
    loadProdutos()
  }, [])

  // Handlers para ações das movimentações
  const openViewDialog = (mov: MovimentacaoWithProduto) => {
    setSelectedMovimentacao(mov)
    setShowViewDialog(true)
  }

  const openEditDialog = (mov: MovimentacaoWithProduto) => {
    setSelectedMovimentacao(mov)
    setFormData({
      produto: { id: mov.produto.id },
      // Normaliza para apresentação no select (Compra/Venda)
      tipoMovimentacao: mov.tipoMovimentacao?.toLowerCase() === 'compra' ? 'Compra' : 'Venda',
      quantidadeMovimentada: mov.quantidadeMovimentada,
      dataMovimentacao: mov.dataMovimentacao
    })
    setShowEditDialog(true)
  }

  const handleUpdateMovimentacao = async () => {
    if (!selectedMovimentacao?.id) return
    try {
  const payload = { ...formData, tipoMovimentacao: mapTipoForBackend(formData.tipoMovimentacao) }
  await ApiService.atualizarMovimentacao(selectedMovimentacao.id, payload as Movimentacao)
      toast({ title: "Movimentação atualizada", description: "Atualizada com sucesso" })
      setShowEditDialog(false)
      if (hasSearched) {
        loadMovimentacoes()
      }
    } catch (error) {
      toast({ title: "Erro ao atualizar", description: error instanceof Error ? error.message : "Erro desconhecido", variant: 'destructive' })
    }
  }

  const handleDeleteMovimentacao = async (id?: number) => {
    if (!id) return
    if (!confirm('Tem certeza que deseja excluir esta movimentação?')) return
    try {
      await ApiService.deletarMovimentacao(id)
      toast({ title: "Movimentação excluída", description: "Excluída com sucesso" })
      if (hasSearched) {
        loadMovimentacoes()
      }
    } catch (error) {
      toast({ title: "Erro ao excluir", description: error instanceof Error ? error.message : "Erro desconhecido", variant: 'destructive' })
    }
  }

  return (
    <AuthenticatedLayout>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-white to-[#FFFDF0] p-6 rounded-2xl border border-[#FFD300]/20 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-[#FFD300] to-[#E6BD00] rounded-xl shadow-md">
              <MoveHorizontal className="h-8 w-8 text-[#0C0C0C]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#0C0C0C] mb-1">Movimentações</h1>
              <p className="text-gray-600 flex items-center gap-2">
                <span className="w-2 h-2 bg-[#FFD300] rounded-full"></span>
                Gerencie o fluxo dos seus produtos
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => router.push('/importar-dados')} 
              variant="outline" 
              className="border-[#FFD300]/50 hover:border-[#FFD300] hover:bg-[#FFFDF0] transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Upload className="w-4 h-4 mr-2 text-[#0C0C0C]" />
              Importar
            </Button>
            <Button 
              onClick={() => setShowCreateDialog(true)} 
              className="bg-gradient-to-r from-[#FFD300] to-[#E6BD00] text-[#0C0C0C] hover:from-[#E6BD00] hover:to-[#FFD300] shadow-md hover:shadow-lg transition-all duration-200 font-medium"
            >
              <Package className="w-4 h-4 mr-2" />
              Nova Movimentação
            </Button>
          </div>
        </div>
      </div>

      {/* Controles de Busca */}
      <Card className="border-[#FFD300]/20 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="bg-gradient-to-r from-[#FFFDF0] to-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#FFD300]/20 rounded-lg">
              <Search className="h-5 w-5 text-[#0C0C0C]" />
            </div>
            <div>
              <CardTitle className="text-lg text-[#0C0C0C]">Buscar Movimentações</CardTitle>
              <CardDescription className="text-gray-600">
                Use os filtros para encontrar movimentações específicas
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
            {/* Campo de busca por produto */}
            <div className="lg:col-span-5">
              <Label htmlFor="search" className="text-sm font-medium text-gray-700 mb-2 block">
                Nome do Produto
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Digite o nome do produto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 border-gray-200 focus:border-[#FFD300] focus:ring-[#FFD300]/20 rounded-xl"
                  onKeyPress={(e) => e.key === 'Enter' && searchMovimentacoes()}
                />
              </div>
            </div>
            
            {/* Botões de ação */}
            <div className="lg:col-span-7 flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
              <Button
                onClick={() => {
                  setHasSearched(true)
                  searchMovimentacoes()
                }}
                disabled={loading}
                className="bg-gradient-to-r from-[#FFD300] to-[#E6BD00] text-[#0C0C0C] hover:from-[#E6BD00] hover:to-[#FFD300] flex-1 h-11 shadow-md hover:shadow-lg transition-all duration-200 font-medium rounded-xl"
              >
                <Search className="w-4 h-4 mr-2" />
                {loading ? 'Buscando...' : 'Buscar'}
              </Button>
              <Button
                onClick={() => {
                  setHasSearched(true)
                  setFilterTipo("")
                  setFilterProdutoId(null)
                  setFilterDataInicio("")
                  setFilterDataFim("")
                  setSortOrder('desc')
                  setSearchTerm("")
                  loadMovimentacoes()
                }}
                disabled={loading}
                variant="outline"
                className="flex-1 h-11 border-[#FFD300]/50 hover:border-[#FFD300] hover:bg-[#FFFDF0] transition-all duration-200 rounded-xl"
              >
                <MoveHorizontal className="w-4 h-4 mr-2" />
                Todas
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card de Movimentações - modificado */}
      <Card className="border-[#FFD300]/20 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-[#FFFDF0] to-white">
          <div className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#FFD300]/20 rounded-lg">
                <MoveHorizontal className="h-5 w-5 text-[#0C0C0C]" />
              </div>
              <div>
                <CardTitle className="text-lg text-[#0C0C0C]">
                  Movimentações Encontradas ({filteredMovimentacoes.length})
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {filteredMovimentacoes.length === 1 ? 'movimentação encontrada' : 'movimentações no sistema'}
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowExportDialog(true)}
                variant="outline"
                className="border-[#FFD300]/50 hover:border-[#FFD300] hover:bg-[#FFFDF0] transition-all duration-200 rounded-xl"
                disabled={filteredMovimentacoes.length === 0}
              >
                <Download className="w-4 h-4 mr-2 text-[#0C0C0C]" />
                Exportar
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setFilterTipo("")
                  setFilterProdutoId(null)
                  setFilterCategoria(null)
                  setFilterDataInicio("")
                  setFilterDataFim("")
                  setSortOrder('desc')
                }}
                className="border-[#FFD300]/50 hover:border-[#FFD300] hover:bg-[#FFFDF0] transition-all duration-200 rounded-xl"
              >
                <Filter className="w-4 h-4 mr-2" />
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!hasSearched ? (
            <div className="py-16">
              <div className="text-center">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-[#FFD300]/20 to-[#FFD300]/10 rounded-full flex items-center justify-center mb-6">
                  <Search className="h-10 w-10 text-[#FFD300]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Use a busca ou os filtros</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Digite o nome do produto ou use os filtros para visualizar movimentações do sistema.
                </p>
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-gradient-to-r from-[#FFD300] to-[#E6BD00] text-[#0C0C0C] hover:from-[#E6BD00] hover:to-[#FFD300] shadow-md hover:shadow-lg transition-all duration-200 font-medium rounded-xl"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Criar Primeira Movimentação
                </Button>
              </div>
            </div>
          ) : loading ? (
            <div className="text-center py-8">Carregando movimentações...</div>
          ) : movimentacoes.length === 0 ? (
            <div className="py-16">
              <div className="text-center">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-[#FFD300]/20 to-[#FFD300]/10 rounded-full flex items-center justify-center mb-6">
                  <MoveHorizontal className="h-10 w-10 text-[#FFD300]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma movimentação encontrada</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Comece criando sua primeira movimentação de produtos.
                </p>
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-gradient-to-r from-[#FFD300] to-[#E6BD00] text-[#0C0C0C] hover:from-[#E6BD00] hover:to-[#FFD300] shadow-md hover:shadow-lg transition-all duration-200 font-medium rounded-xl"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Nova Movimentação
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Filtros movidos para dentro do card de movimentações */}
              <Card className="bg-gray-50/50 border-gray-200/50">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-600" />
                    <CardTitle className="text-base text-gray-700">Filtros Rápidos</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="filterTipo" className="text-sm font-medium text-gray-700 mb-2 block">
                        Filtrar por tipo
                      </Label>
                      <Select value={filterTipo || "all"} onValueChange={(value: string) => {
                        const tipoValue = value === "all" ? "" : value
                        setFilterTipo(tipoValue as 'Compra' | 'Venda' | '')
                      }}>
                        <SelectTrigger className="border-gray-200 focus:border-[#FFD300] focus:ring-[#FFD300]/20 rounded-xl">
                          <SelectValue placeholder="Todos os tipos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os tipos</SelectItem>
                          <SelectItem value="Compra">Compra</SelectItem>
                          <SelectItem value="Venda">Venda</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="filterCategoria" className="text-sm font-medium text-gray-700 mb-2 block">
                        Filtrar por categoria
                      </Label>
                      <Select
                        value={filterCategoria || "all"}
                        onValueChange={(value) => setFilterCategoria(value === "all" ? null : value)}
                      >
                        <SelectTrigger className="border-gray-200 focus:border-[#FFD300] focus:ring-[#FFD300]/20 rounded-xl">
                          <SelectValue placeholder="Todas as categorias" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas as categorias</SelectItem>
                          {categorias.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="filterProduto" className="text-sm font-medium text-gray-700 mb-2 block">
                        Filtrar por produto
                      </Label>
                      <Select 
                        value={filterProdutoId?.toString() || "all"} 
                        onValueChange={(value) => {
                          const id = value === "all" ? null : parseInt(value)
                          setFilterProdutoId(id)
                        }}
                      >
                        <SelectTrigger className="border-gray-200 focus:border-[#FFD300] focus:ring-[#FFD300]/20 rounded-xl">
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
                      <Label htmlFor="filterDataInicio" className="text-sm font-medium text-gray-700 mb-2 block">
                        Data Início
                      </Label>
                      <Input
                        type="date"
                        value={filterDataInicio}
                        onChange={(e) => {
                          setFilterDataInicio(e.target.value)
                        }}
                        className="border-gray-200 focus:border-[#FFD300] focus:ring-[#FFD300]/20 rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Segunda linha para data fim e ordenação */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                    <div>
                      <Label htmlFor="filterDataFim" className="text-sm font-medium text-gray-700 mb-2 block">
                        Data Fim
                      </Label>
                      <Input
                        type="date"
                        value={filterDataFim}
                        onChange={(e) => {
                          setFilterDataFim(e.target.value)
                        }}
                        className="border-gray-200 focus:border-[#FFD300] focus:ring-[#FFD300]/20 rounded-xl"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="sortOrder" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <ArrowUpDown className="h-4 w-4" />
                        Ordenação
                      </Label>
                      <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => {
                        setSortOrder(value)
                      }}>
                        <SelectTrigger className="border-gray-200 focus:border-[#FFD300] focus:ring-[#FFD300]/20 rounded-xl">
                          <SelectValue placeholder="Ordenar por data" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="desc" className="flex items-center gap-2">
                            <ArrowDown className="h-4 w-4 inline mr-2" />
                            Mais recente primeiro
                          </SelectItem>
                          <SelectItem value="asc" className="flex items-center gap-2">
                            <ArrowUp className="h-4 w-4 inline mr-2" />
                            Mais antigo primeiro
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Área de resultados: mostra mensagem ou tabela, mas mantém os filtros visíveis */}
              {filteredMovimentacoes.length === 0 ? (
                <div className="py-16">
                  <div className="text-center">
                    <div className="mx-auto w-20 h-20 bg-gradient-to-br from-[#FFD300]/20 to-[#FFD300]/10 rounded-full flex items-center justify-center mb-6">
                      <MoveHorizontal className="h-10 w-10 text-[#FFD300]" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma movimentação encontrada</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      {movimentacoes.length === 0 
                        ? "Comece criando sua primeira movimentação de produtos." 
                        : "Tente ajustar os filtros para encontrar o que procura."
                      }
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button
                        onClick={() => setShowCreateDialog(true)}
                        className="bg-gradient-to-r from-[#FFD300] to-[#E6BD00] text-[#0C0C0C] hover:from-[#E6BD00] hover:to-[#FFD300] shadow-md hover:shadow-lg transition-all duration-200 font-medium rounded-xl"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Movimentação
                      </Button>
                      {movimentacoes.length > 0 && (
                        <Button
                          onClick={() => {
                            setFilterTipo("")
                            setFilterProdutoId(null)
                            setFilterCategoria(null)
                            setFilterDataInicio("")
                            setFilterDataFim("")
                            setSortOrder('desc')
                          }}
                          variant="outline"
                          className="border-[#FFD300]/50 hover:border-[#FFD300] hover:bg-[#FFFDF0] transition-all duration-200 rounded-xl"
                        >
                          <Filter className="w-4 h-4 mr-2" />
                          Limpar Filtros
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <Card className="bg-white border-gray-200/50">
                  <CardHeader className="bg-gradient-to-r from-gray-50/50 to-white pb-4">
                    <div className="flex items-center gap-2">
                      <Table2 className="h-4 w-4 text-gray-600" />
                      <CardTitle className="text-base text-gray-700">Lista de Movimentações</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50/50 border-b-2 border-[#FFD300]/20">
                            <TableHead className="font-semibold text-gray-700">Produto</TableHead>
                            <TableHead 
                              className="cursor-pointer select-none hover:bg-[#FFD300]/10 transition-colors font-semibold text-gray-700 rounded-lg"
                              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                            >
                              <div className="flex items-center gap-2">
                                Data
                                {sortOrder === 'desc' ? (
                                  <ArrowDown className="h-4 w-4 text-[#FFD300]" />
                                ) : (
                                  <ArrowUp className="h-4 w-4 text-[#FFD300]" />
                                )}
                              </div>
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700">Tipo</TableHead>
                            <TableHead className="text-center font-semibold text-gray-700">Quantidade</TableHead>
                            <TableHead className="text-center font-semibold text-gray-700">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredMovimentacoes.map((movimentacao, index) => (
                            <TableRow 
                              key={movimentacao.id}
                              className={`hover:bg-[#FFFDF0] transition-colors ${
                                index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                              }`}
                            >
                              <TableCell className="py-4">
                                <div className="space-y-1">
                                  <div className="font-medium text-gray-900">{movimentacao.produtoCompleto?.nome || 'Produto não encontrado'}</div>
                                  <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md inline-block">
                                    {movimentacao.produtoCompleto?.categoria || '-'}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="text-gray-700">
                                  {(() => {
                                    const parsedDate = parseISO(movimentacao.dataMovimentacao);
                                    return isValid(parsedDate)
                                      ? format(parsedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                                      : "-";
                                  })()}
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                <Badge 
                                  variant={movimentacao.tipoMovimentacao?.toLowerCase() === 'compra' ? 'default' : 'secondary'}
                                  className={
                                    movimentacao.tipoMovimentacao?.toLowerCase() === 'compra' 
                                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                      : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                  }
                                >
                                  {movimentacao.tipoMovimentacao?.toLowerCase() === 'compra' ? 'Compra' : 'Venda'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center py-4">
                                <span className="font-semibold text-gray-800 bg-[#FFD300]/20 px-3 py-1 rounded-lg">
                                  {movimentacao.quantidadeMovimentada}
                                </span>
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="flex justify-center space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openViewDialog(movimentacao)}
                                    className="h-9 w-9 p-0 hover:bg-blue-100 hover:text-blue-700 transition-colors rounded-lg"
                                    title="Visualizar"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openEditDialog(movimentacao)}
                                    className="h-9 w-9 p-0 hover:bg-[#FFD300]/30 hover:text-[#0C0C0C] transition-colors rounded-lg"
                                    title="Editar"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteMovimentacao(movimentacao.id)}
                                    className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-100 transition-colors rounded-lg"
                                    title="Excluir"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para Criar Movimentação */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl border-[#FFD300]/20">
          <DialogHeader className="bg-gradient-to-r from-[#FFFDF0] to-white p-6 -m-6 mb-6 rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#FFD300]/20 rounded-lg">
                <Plus className="h-5 w-5 text-[#0C0C0C]" />
              </div>
              <div>
                <DialogTitle className="text-lg text-[#0C0C0C]">Nova Movimentação</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Registre uma nova movimentação de produto no estoque
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="produto" className="text-sm font-medium text-gray-700 mb-2 block">
                  Produto *
                </Label>
                <Select
                  value={formData.produto.id.toString()}
                  onValueChange={(value) => setFormData({...formData, produto: { id: parseInt(value) }})}
                >
                  <SelectTrigger className="border-gray-200 focus:border-[#FFD300] focus:ring-[#FFD300]/20 rounded-xl h-11">
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
                <Label htmlFor="tipo" className="text-sm font-medium text-gray-700 mb-2 block">
                  Tipo de Movimentação *
                </Label>
                <Select
                  value={formData.tipoMovimentacao}
                  onValueChange={(value: string) => setFormData({...formData, tipoMovimentacao: value})}
                >
                  <SelectTrigger className="border-gray-200 focus:border-[#FFD300] focus:ring-[#FFD300]/20 rounded-xl h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Compra">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Compra
                      </div>
                    </SelectItem>
                    <SelectItem value="Venda">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Venda
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="quantidade" className="text-sm font-medium text-gray-700 mb-2 block">
                  Quantidade *
                </Label>
                <Input
                  id="quantidade"
                  type="number"
                  min="1"
                  value={formData.quantidadeMovimentada}
                  onChange={(e) => setFormData({...formData, quantidadeMovimentada: parseInt(e.target.value) || 0})}
                  className="border-gray-200 focus:border-[#FFD300] focus:ring-[#FFD300]/20 rounded-xl h-11"
                  placeholder="Ex: 10"
                />
              </div>
              
              <div>
                <Label htmlFor="data" className="text-sm font-medium text-gray-700 mb-2 block">
                  Data da Movimentação *
                </Label>
                <Input
                  id="data"
                  type="date"
                  value={formData.dataMovimentacao}
                  onChange={(e) => setFormData({...formData, dataMovimentacao: e.target.value})}
                  className="border-gray-200 focus:border-[#FFD300] focus:ring-[#FFD300]/20 rounded-xl h-11"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter className="bg-gray-50/50 p-6 -m-6 mt-6 rounded-b-lg">
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button 
                variant="outline" 
                onClick={() => setShowCreateDialog(false)}
                className="flex-1 border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-xl h-11"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateMovimentacao}
                disabled={!formData.produto.id || !formData.quantidadeMovimentada}
                className="flex-1 bg-gradient-to-r from-[#FFD300] to-[#E6BD00] text-[#0C0C0C] hover:from-[#E6BD00] hover:to-[#FFD300] shadow-md hover:shadow-lg transition-all duration-200 font-medium rounded-xl h-11"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Movimentação
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog para Visualizar Movimentação */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl border-[#FFD300]/20">
          <DialogHeader className="bg-gradient-to-r from-[#FFFDF0] to-white p-6 -m-6 mb-6 rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#FFD300]/20 rounded-lg">
                <Eye className="h-5 w-5 text-[#0C0C0C]" />
              </div>
              <div>
                <DialogTitle className="text-lg text-[#0C0C0C]">Detalhes da Movimentação</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Visualize as informações completas da movimentação
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedMovimentacao && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50/50 p-4 rounded-xl">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <Package className="h-4 w-4" />
                    Produto
                  </Label>
                  <p className="text-gray-900 font-medium">{selectedMovimentacao.produtoCompleto?.nome || 'Produto não encontrado'}</p>
                </div>

                <div className="bg-gray-50/50 p-4 rounded-xl">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <Filter className="h-4 w-4" />
                    Categoria
                  </Label>
                  <p className="text-gray-900">{selectedMovimentacao.produtoCompleto?.categoria || '-'}</p>
                </div>

                <div className="bg-gray-50/50 p-4 rounded-xl">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <ArrowUpDown className="h-4 w-4" />
                    Data da Movimentação
                  </Label>
                  <p className="text-gray-900 font-medium">{(() => {
                    const parsed = parseISO(selectedMovimentacao.dataMovimentacao)
                    return isValid(parsed) ? format(parsed, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : '-'
                  })()}</p>
                </div>

                <div className="bg-gray-50/50 p-4 rounded-xl">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <MoveHorizontal className="h-4 w-4" />
                    Tipo de Movimentação
                  </Label>
                  <div className="mt-2">
                    <Badge 
                      variant={selectedMovimentacao.tipoMovimentacao?.toLowerCase() === 'compra' ? 'default' : 'secondary'}
                      className={
                        selectedMovimentacao.tipoMovimentacao?.toLowerCase() === 'compra' 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      }
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          selectedMovimentacao.tipoMovimentacao?.toLowerCase() === 'compra' ? 'bg-green-500' : 'bg-blue-500'
                        }`}></div>
                        {selectedMovimentacao.tipoMovimentacao?.toLowerCase() === 'compra' ? 'Compra' : 'Venda'}
                      </div>
                    </Badge>
                  </div>
                </div>

                <div className="bg-[#FFD300]/10 p-4 rounded-xl border border-[#FFD300]/20">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <Package className="h-4 w-4" />
                    Quantidade Movimentada
                  </Label>
                  <p className="text-xl font-bold text-[#0C0C0C]">{selectedMovimentacao.quantidadeMovimentada || 0}</p>
                </div>

              </div>
            </div>
          )}

          <DialogFooter className="bg-gray-50/50 p-6 -m-6 mt-6 rounded-b-lg">
            <Button 
              variant="outline" 
              onClick={() => setShowViewDialog(false)}
              className="w-full border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-xl h-11"
            >
              <Eye className="w-4 h-4 mr-2" />
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para Editar Movimentação */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl border-[#FFD300]/20">
          <DialogHeader className="bg-gradient-to-r from-[#FFFDF0] to-white p-6 -m-6 mb-6 rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#FFD300]/20 rounded-lg">
                <Edit className="h-5 w-5 text-[#0C0C0C]" />
              </div>
              <div>
                <DialogTitle className="text-lg text-[#0C0C0C]">Editar Movimentação</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Altere os dados da movimentação selecionada
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="edit-produto" className="text-sm font-medium text-gray-700 mb-2 block">
                  Produto *
                </Label>
                <Select
                  value={formData.produto.id.toString()}
                  onValueChange={(value) => setFormData({...formData, produto: { id: parseInt(value) }})}
                >
                  <SelectTrigger className="border-gray-200 focus:border-[#FFD300] focus:ring-[#FFD300]/20 rounded-xl h-11">
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
                <Label htmlFor="edit-tipo" className="text-sm font-medium text-gray-700 mb-2 block">
                  Tipo de Movimentação *
                </Label>
                <Select
                  value={formData.tipoMovimentacao}
                  onValueChange={(value: string) => setFormData({...formData, tipoMovimentacao: value})}
                >
                  <SelectTrigger className="border-gray-200 focus:border-[#FFD300] focus:ring-[#FFD300]/20 rounded-xl h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Compra">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Compra
                      </div>
                    </SelectItem>
                    <SelectItem value="Venda">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Venda
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-quantidade" className="text-sm font-medium text-gray-700 mb-2 block">
                  Quantidade *
                </Label>
                <Input 
                  id="edit-quantidade" 
                  type="number" 
                  min="1"
                  value={formData.quantidadeMovimentada} 
                  onChange={(e) => setFormData({...formData, quantidadeMovimentada: parseInt(e.target.value) || 0})}
                  className="border-gray-200 focus:border-[#FFD300] focus:ring-[#FFD300]/20 rounded-xl h-11"
                  placeholder="Ex: 10"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-data" className="text-sm font-medium text-gray-700 mb-2 block">
                  Data da Movimentação *
                </Label>
                <Input 
                  id="edit-data" 
                  type="date" 
                  value={formData.dataMovimentacao} 
                  onChange={(e) => setFormData({...formData, dataMovimentacao: e.target.value})}
                  className="border-gray-200 focus:border-[#FFD300] focus:ring-[#FFD300]/20 rounded-xl h-11"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter className="bg-gray-50/50 p-6 -m-6 mt-6 rounded-b-lg">
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button 
                variant="outline" 
                onClick={() => setShowEditDialog(false)}
                className="flex-1 border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-xl h-11"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleUpdateMovimentacao} 
                className="flex-1 bg-gradient-to-r from-[#FFD300] to-[#E6BD00] text-[#0C0C0C] hover:from-[#E6BD00] hover:to-[#FFD300] shadow-md hover:shadow-lg transition-all duration-200 font-medium rounded-xl h-11"
              >
                <Edit className="w-4 h-4 mr-2" />
                Salvar Alterações
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog para Exportar Movimentações */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader className="text-center pb-2">
            <DialogTitle className="flex items-center justify-center gap-2 text-xl">
              <span className="text-2xl">📊</span>
              Exportar Movimentações
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Escolha o formato e os dados que deseja exportar
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <Label className="text-base font-semibold mb-4 block">Escolha o tipo de exportação</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setExportOption('all')}
                  className={`group relative p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                    exportOption === 'all' 
                      ? 'border-[#FFD300] bg-gradient-to-br from-[#FFFDF0] to-[#FFF9E6] shadow-md' 
                      : 'border-gray-200 bg-white hover:border-[#FFD300]/50'
                  }`}
                >
                  <div className="text-left">
                    <div className={`font-semibold ${exportOption === 'all' ? 'text-[#0C0C0C]' : 'text-gray-700'}`}>
                      📊 Todas as movimentações
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Exportar todo o histórico
                    </div>
                  </div>
                  {exportOption === 'all' && (
                    <div className="absolute top-2 right-2 w-3 h-3 bg-[#FFD300] rounded-full"></div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setExportOption('produto')}
                  className={`group relative p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                    exportOption === 'produto' 
                      ? 'border-[#FFD300] bg-gradient-to-br from-[#FFFDF0] to-[#FFF9E6] shadow-md' 
                      : 'border-gray-200 bg-white hover:border-[#FFD300]/50'
                  }`}
                >
                  <div className="text-left">
                    <div className={`font-semibold ${exportOption === 'produto' ? 'text-[#0C0C0C]' : 'text-gray-700'}`}>
                      📦 Por produto
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Filtrar por produto específico
                    </div>
                  </div>
                  {exportOption === 'produto' && (
                    <div className="absolute top-2 right-2 w-3 h-3 bg-[#FFD300] rounded-full"></div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setExportOption('categoria')}
                  className={`group relative p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                    exportOption === 'categoria' 
                      ? 'border-[#FFD300] bg-gradient-to-br from-[#FFFDF0] to-[#FFF9E6] shadow-md' 
                      : 'border-gray-200 bg-white hover:border-[#FFD300]/50'
                  }`}
                >
                  <div className="text-left">
                    <div className={`font-semibold ${exportOption === 'categoria' ? 'text-[#0C0C0C]' : 'text-gray-700'}`}>
                      🏷️ Por categoria
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Agrupar por categoria
                    </div>
                  </div>
                  {exportOption === 'categoria' && (
                    <div className="absolute top-2 right-2 w-3 h-3 bg-[#FFD300] rounded-full"></div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setExportOption('periodo')}
                  className={`group relative p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                    exportOption === 'periodo' 
                      ? 'border-[#FFD300] bg-gradient-to-br from-[#FFFDF0] to-[#FFF9E6] shadow-md' 
                      : 'border-gray-200 bg-white hover:border-[#FFD300]/50'
                  }`}
                >
                  <div className="text-left">
                    <div className={`font-semibold ${exportOption === 'periodo' ? 'text-[#0C0C0C]' : 'text-gray-700'}`}>
                      📅 Por período
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Definir intervalo de datas
                    </div>
                  </div>
                  {exportOption === 'periodo' && (
                    <div className="absolute top-2 right-2 w-3 h-3 bg-[#FFD300] rounded-full"></div>
                  )}
                </button>
              </div>
            </div>

            {/* Campos condicionais */}
            {exportOption === 'produto' && (
              <div className="bg-gradient-to-r from-[#FFFDF0] to-[#FFF9E6] p-4 rounded-xl border border-[#FFD300]/30">
                <Label className="text-sm font-medium text-[#0C0C0C] mb-2 block">
                  📦 Selecione o produto
                </Label>
                <Select value={exportProdutoId?.toString() || 'all'} onValueChange={(v) => setExportProdutoId(v === 'all' ? null : parseInt(v))}>
                  <SelectTrigger className="border-[#FFD300]/50 focus:border-[#FFD300] focus:ring-[#FFD300]/20">
                    <SelectValue placeholder="Escolha um produto..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Escolha um produto...</SelectItem>
                    {produtos.map(p => (
                      <SelectItem key={p.id} value={p.id!.toString()}>{p.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {exportOption === 'categoria' && (
              <div className="bg-gradient-to-r from-[#FFFDF0] to-[#FFF9E6] p-4 rounded-xl border border-[#FFD300]/30">
                <Label className="text-sm font-medium text-[#0C0C0C] mb-2 block">
                  🏷️ Selecione a categoria
                </Label>
                <Select value={exportCategoria || 'all'} onValueChange={(v) => setExportCategoria(v === 'all' ? null : v)}>
                  <SelectTrigger className="border-[#FFD300]/50 focus:border-[#FFD300] focus:ring-[#FFD300]/20">
                    <SelectValue placeholder="Escolha uma categoria..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Escolha uma categoria...</SelectItem>
                    {categorias.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {exportOption === 'periodo' && (
              <div className="bg-gradient-to-r from-[#FFFDF0] to-[#FFF9E6] p-4 rounded-xl border border-[#FFD300]/30">
                <Label className="text-sm font-medium text-[#0C0C0C] mb-3 block">
                  📅 Defina o período
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-600 mb-1 block">Data de início</Label>
                    <Input 
                      type="date" 
                      value={exportDataInicio} 
                      onChange={(e) => setExportDataInicio(e.target.value)}
                      className="border-[#FFD300]/50 focus:border-[#FFD300] focus:ring-[#FFD300]/20"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600 mb-1 block">Data de fim</Label>
                    <Input 
                      type="date" 
                      value={exportDataFim} 
                      onChange={(e) => setExportDataFim(e.target.value)}
                      className="border-[#FFD300]/50 focus:border-[#FFD300] focus:ring-[#FFD300]/20"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <Label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                💾 Preview do arquivo
              </Label>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-sm">📄</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-sm bg-white px-3 py-2 rounded-lg border border-gray-200 text-gray-800 truncate">
                    {(() => {
                      if (exportOption === 'produto' && exportProdutoId) {
                        const p = produtos.find(p => p.id === exportProdutoId)
                        return `movimentacoes_produto-${sanitizeFilename(p?.nome || String(exportProdutoId))}.xlsx`
                      }
                      if (exportOption === 'categoria' && exportCategoria) return `movimentacoes_categoria-${sanitizeFilename(exportCategoria)}.xlsx`
                      if (exportOption === 'periodo' && exportDataInicio && exportDataFim) return `movimentacoes_${exportDataInicio}_to_${exportDataFim}.xlsx`
                      return 'movimentacoes.xlsx'
                    })()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Arquivo Excel (.xlsx)
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3 pt-6">
            <Button 
              variant="outline" 
              onClick={() => setShowExportDialog(false)}
              className="flex-1 border-gray-300 hover:bg-gray-50"
            >
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                // validação simples
                if (exportOption === 'produto' && !exportProdutoId) {
                  toast({ title: 'Selecione um produto', variant: 'destructive' })
                  return
                }
                if (exportOption === 'categoria' && !exportCategoria) {
                  toast({ title: 'Selecione uma categoria', variant: 'destructive' })
                  return
                }
                if (exportOption === 'periodo' && (!exportDataInicio || !exportDataFim)) {
                  toast({ title: 'Informe início e fim do período', variant: 'destructive' })
                  return
                }

                setShowExportDialog(false)
                if (exportOption === 'produto') await performExport('produto', { produtoId: exportProdutoId! })
                else if (exportOption === 'categoria') await performExport('categoria', { categoria: exportCategoria! })
                else if (exportOption === 'periodo') await performExport('periodo', { dataInicio: exportDataInicio, dataFim: exportDataFim })
                else await performExport('all')
              }}
              className="flex-1 bg-[#FFD300] text-[#0C0C0C] hover:bg-[#E6BD00] shadow-md hover:shadow-lg transition-all duration-200 font-medium"
              disabled={exportLoading}
            >
              {exportLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#0C0C0C]/30 border-t-[#0C0C0C] rounded-full animate-spin"></div>
                  Exportando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>📥</span>
                  Exportar
                </div>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </AuthenticatedLayout>
  )
}
