"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Package, Plus, Search, Edit, Trash2, Eye, Download, Filter, AlertTriangle, CheckCircle, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ApiService, Produto } from "@/lib/api"

export default function ProdutosPage() {
  const router = useRouter()
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchType, setSearchType] = useState<'nome' | 'categoria'>('nome')
  const [filterCategoria, setFilterCategoria] = useState("")
  const [filterAtivo, setFilterAtivo] = useState<boolean | null>(null)
  // Novo estado para controlar a visibilidade dos resultados
  const [hasSearched, setHasSearched] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null)
  const [formData, setFormData] = useState<Produto>({
    nome: "",
    categoria: "",
    preco: 0,
    quantidadeEstoque: 0,
    ativo: true,
    descricao: ""
  })
  const { toast } = useToast()

  // Atualizar loadProdutos para setar hasSearched
  const loadProdutos = async () => {
    try {
      setLoading(true)
      const data = await ApiService.listarProdutos()
      setProdutos(data)
      setHasSearched(true)
    } catch (error) {
      toast({
        title: "Erro ao carregar produtos",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Atualizar searchProdutos para setar hasSearched
  const searchProdutos = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Digite um termo para buscar",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)
      let data: Produto[] = []
      
      if (searchType === 'nome') {
        data = await ApiService.buscarProdutoPorNome(searchTerm)
      } else {
        data = await ApiService.buscarProdutoPorCategoria(searchTerm)
      }
      
      setProdutos(Array.isArray(data) ? data : [data])
      setHasSearched(true)
    } catch (error) {
      toast({
        title: "Erro na busca",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      })
      setProdutos([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProduto = async () => {
    try {
      await ApiService.criarProduto(formData)
      toast({
        title: "Produto criado",
        description: "Produto criado com sucesso!"
      })
      setShowCreateDialog(false)
      resetForm()
      loadProdutos()
    } catch (error) {
      toast({
        title: "Erro ao criar produto",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      })
    }
  }

  const handleUpdateProduto = async () => {
    if (!selectedProduto?.id) return

    try {
      await ApiService.atualizarProduto(selectedProduto.id, formData)
      toast({
        title: "Produto atualizado",
        description: "Produto atualizado com sucesso!"
      })
      setShowEditDialog(false)
      resetForm()
      loadProdutos()
    } catch (error) {
      toast({
        title: "Erro ao atualizar produto",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      })
    }
  }

  const handleDeleteProduto = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return

    try {
      await ApiService.deletarProduto(id)
      toast({
        title: "Produto excluído",
        description: "Produto excluído com sucesso!"
      })
      loadProdutos()
    } catch (error) {
      toast({
        title: "Erro ao excluir produto",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      })
    }
  }

  const handleExportProdutos = async () => {
    try {
      const blob = await ApiService.exportarProdutos()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'produtos.xlsx'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: "Exportação concluída",
        description: "Produtos exportados com sucesso!"
      })
    } catch (error) {
      toast({
        title: "Erro ao exportar produtos",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setFormData({
      nome: "",
      categoria: "",
      preco: 0,
      quantidadeEstoque: 0,
      ativo: true,
      descricao: ""
    })
    setSelectedProduto(null)
  }

  const openEditDialog = (produto: Produto) => {
    setSelectedProduto(produto)
    setFormData({
      nome: produto.nome,
      categoria: produto.categoria || "",
      preco: produto.preco || 0,
      quantidadeEstoque: produto.quantidadeEstoque || 0,
      ativo: produto.ativo ?? true,
      descricao: produto.descricao || ""
    })
    setShowEditDialog(true)
  }

  const openViewDialog = (produto: Produto) => {
    setSelectedProduto(produto)
    setShowViewDialog(true)
  }

  // Filtrar produtos
  const filteredProdutos = produtos.filter(produto => {
    const matchesCategoria = filterCategoria === "" || produto.categoria === filterCategoria
    const matchesAtivo = filterAtivo === null || produto.ativo === filterAtivo
    return matchesCategoria && matchesAtivo
  })

  // Obter categorias únicas para o filtro
  const categorias = Array.from(new Set(produtos.map(p => p.categoria).filter(Boolean)))

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Package className="h-6 w-6 mr-2 text-[#FFD300]" />
          <div>
            <h1 className="text-3xl font-bold text-[#000000]">Gerenciar Produtos</h1>
            <p className="text-[#9A9A9A] mt-2">Gerencie seu catálogo de produtos</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button onClick={handleExportProdutos} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button onClick={() => router.push('/importar-dados')} variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Importar
            </Button>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="bg-[#FFD300] text-[#0C0C0C] hover:bg-[#E6BD00]">
            <Plus className="w-4 h-4 mr-2" />
            Novo Produto
          </Button>
        </div>
      </div>

      {/* Card de Busca - simplificado */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Buscar Produtos</CardTitle>
          <CardDescription>Use os filtros abaixo para encontrar produtos específicos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
            {/* Tipo de busca */}
            <div className="lg:col-span-3">
              <Label htmlFor="searchType">Buscar por</Label>
              <Select value={searchType} onValueChange={(value: 'nome' | 'categoria') => setSearchType(value)}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nome">Nome do Produto</SelectItem>
                  <SelectItem value="categoria">Categoria</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Campo de busca */}
            <div className="lg:col-span-5">
              <Label htmlFor="search">Termo de busca</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder={searchType === 'nome' ? "Digite o nome do produto..." : "Digite a categoria..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-10"
                  onKeyPress={(e) => e.key === 'Enter' && searchProdutos()}
                />
              </div>
            </div>
            
            {/* Botões de ação */}
            <div className="lg:col-span-4 flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
              <Button
                onClick={() => {
                  setHasSearched(true)
                  searchProdutos()
                }}
                disabled={!searchTerm.trim() || loading}
                className="bg-[#FFD300] text-[#0C0C0C] hover:bg-[#E6BD00] flex-1 h-10"
              >
                <Search className="w-4 h-4 mr-2" />
                Buscar
              </Button>
              <Button
                onClick={() => {
                  setHasSearched(true)
                  loadProdutos()
                }}
                disabled={loading}
                variant="outline"
                className="flex-1 h-10"
              >
                <Package className="w-4 h-4 mr-2" />
                Todos
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card de Produtos - modificado */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>
              Produtos ({filteredProdutos.length})
            </CardTitle>
          </div>
          <Button 
            variant="outline" 
            onClick={() => {
              setHasSearched(false)
              setSearchTerm("")
              setFilterCategoria("")
              setFilterAtivo(null)
              setProdutos([])
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
                Digite o nome do produto, categoria ou use os filtros para visualizar os produtos.
              </p>
            </div>
          ) : loading ? (
            <div className="text-center py-8">Carregando produtos...</div>
          ) : filteredProdutos.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum produto encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                {produtos.length === 0 ? "Comece criando seu primeiro produto." : "Tente ajustar os filtros."}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Filtros movidos para dentro do card de produtos */}
              <div className="border-b pb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="filterCategoria">Filtrar por categoria</Label>
                    <Select value={filterCategoria} onValueChange={(value) => setFilterCategoria(value === "all" ? "" : value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas as categorias" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as categorias</SelectItem>
                        {categorias.map(categoria => (
                          <SelectItem key={categoria} value={categoria!}>
                            {categoria}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="filterStatus">Filtrar por status</Label>
                    <Select 
                      value={filterAtivo === null ? "all" : filterAtivo.toString()} 
                      onValueChange={(value) => {
                        const ativo = value === "all" ? null : value === "true"
                        setFilterAtivo(ativo)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os status</SelectItem>
                        <SelectItem value="true">Ativo</SelectItem>
                        <SelectItem value="false">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Tabela */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[150px]">Nome</TableHead>
                      <TableHead className="hidden sm:table-cell">Categoria</TableHead>
                      <TableHead className="hidden md:table-cell">Preço</TableHead>
                      <TableHead className="text-center">Estoque</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center min-w-[120px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProdutos.map((produto) => (
                      <TableRow key={produto.id}>
                        <TableCell className="font-medium">
                          <div className="space-y-1">
                            <div className="font-medium text-sm">{produto.nome}</div>
                            <div className="text-xs text-gray-500 sm:hidden">
                              {produto.categoria || "Sem categoria"}
                            </div>
                            <div className="text-xs text-gray-500 md:hidden">
                              {produto.preco ? `R$ ${produto.preco.toFixed(2)}` : "Sem preço"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {produto.categoria || "-"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {produto.preco ? `R$ ${produto.preco.toFixed(2)}` : "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className="font-medium">{produto.quantidadeEstoque || 0}</span>
                            <div
                              className={`w-2 h-2 rounded-full ${
                                (produto.quantidadeEstoque || 0) < 20 
                                  ? "bg-red-500" 
                                  : (produto.quantidadeEstoque || 0) > 50 
                                  ? "bg-green-500" 
                                  : "bg-yellow-500"
                              }`}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={produto.ativo ? "default" : "secondary"} className="text-xs">
                            {produto.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openViewDialog(produto)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(produto)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => produto.id && handleDeleteProduto(produto.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para Criar Produto */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Criar Novo Produto</DialogTitle>
            <DialogDescription>
              Preencha as informações do produto
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                placeholder="Nome do produto"
              />
            </div>
            
            <div>
              <Label htmlFor="categoria">Categoria</Label>
              <Input
                id="categoria"
                value={formData.categoria}
                onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                placeholder="Categoria do produto"
              />
            </div>
            
            <div>
              <Label htmlFor="preco">Preço</Label>
              <Input
                id="preco"
                type="number"
                step="0.01"
                value={formData.preco}
                onChange={(e) => setFormData({...formData, preco: parseFloat(e.target.value) || 0})}
                placeholder="0.00"
              />
            </div>
            
            <div>
              <Label htmlFor="estoque">Quantidade em Estoque</Label>
              <Input
                id="estoque"
                type="number"
                value={formData.quantidadeEstoque}
                onChange={(e) => setFormData({...formData, quantidadeEstoque: parseInt(e.target.value) || 0})}
                placeholder="0"
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                placeholder="Descrição do produto"
                rows={3}
              />
            </div>
            
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="ativo"
                  checked={formData.ativo}
                  onCheckedChange={(checked) => setFormData({...formData, ativo: checked})}
                />
                <Label htmlFor="ativo">Produto ativo</Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateProduto}
              disabled={!formData.nome.trim()}
              className="bg-[#FFD300] text-[#0C0C0C] hover:bg-[#E6BD00]"
            >
              Criar Produto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para Editar Produto */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
            <DialogDescription>
              Altere as informações do produto
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-nome">Nome *</Label>
              <Input
                id="edit-nome"
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                placeholder="Nome do produto"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-categoria">Categoria</Label>
              <Input
                id="edit-categoria"
                value={formData.categoria}
                onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                placeholder="Categoria do produto"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-preco">Preço</Label>
              <Input
                id="edit-preco"
                type="number"
                step="0.01"
                value={formData.preco}
                onChange={(e) => setFormData({...formData, preco: parseFloat(e.target.value) || 0})}
                placeholder="0.00"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-estoque">Quantidade em Estoque</Label>
              <Input
                id="edit-estoque"
                type="number"
                value={formData.quantidadeEstoque}
                onChange={(e) => setFormData({...formData, quantidadeEstoque: parseInt(e.target.value) || 0})}
                placeholder="0"
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="edit-descricao">Descrição</Label>
              <Textarea
                id="edit-descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                placeholder="Descrição do produto"
                rows={3}
              />
            </div>
            
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-ativo"
                  checked={formData.ativo}
                  onCheckedChange={(checked) => setFormData({...formData, ativo: checked})}
                />
                <Label htmlFor="edit-ativo">Produto ativo</Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleUpdateProduto}
              disabled={!formData.nome.trim()}
              className="bg-[#FFD300] text-[#0C0C0C] hover:bg-[#E6BD00]"
            >
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para Visualizar Produto */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Produto</DialogTitle>
          </DialogHeader>
          
          {selectedProduto && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Nome</Label>
                  <p className="text-sm text-gray-900">{selectedProduto.nome}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Categoria</Label>
                  <p className="text-sm text-gray-900">{selectedProduto.categoria || "-"}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Preço</Label>
                  <p className="text-sm text-gray-900">
                    {selectedProduto.preco ? `R$ ${selectedProduto.preco.toFixed(2)}` : "-"}
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Quantidade em Estoque</Label>
                  <p className="text-sm text-gray-900">{selectedProduto.quantidadeEstoque || 0}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Status</Label>
                  <div className="mt-1">
                    <Badge variant={selectedProduto.ativo ? "default" : "secondary"}>
                      {selectedProduto.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </div>
                
                {selectedProduto.dataCriacao && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Data de Criação</Label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedProduto.dataCriacao).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}
              </div>
              
              {selectedProduto.descricao && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Descrição</Label>
                  <p className="text-sm text-gray-900 mt-1">{selectedProduto.descricao}</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
