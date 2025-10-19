"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Package, Plus, Search, Edit, Trash2, Eye, Download, Filter, Upload, Table2, ImageIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ApiService, Produto, getFullImageUrl } from "@/lib/api"
import { CATEGORIAS_PRODUTOS } from "@/lib/categorias"
import AuthenticatedLayout from "@/components/authenticated-layout"
import MobileDataCard, { createDefaultActions, CardField } from "@/components/mobile-data-card"
import { ImageUploadZone } from "@/components/image-upload-zone"
import { useIsMobile } from "@/hooks/use-mobile"
import { PageHeader } from "@/components/page-header"

export default function ProdutosPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategoria, setFilterCategoria] = useState("")
  const [filterAtivo, setFilterAtivo] = useState<boolean | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null)
  const [formData, setFormData] = useState<Produto>({
    nome: "",
    categoria: "",
    preco: 0,
    custo: null,
    quantidadeEstoque: 0,
    ativo: true,
    descricao: "",
    fotoUrl: ""
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [removerFoto, setRemoverFoto] = useState(false)
  const [categorias, setCategorias] = useState<string[]>([]);
  const [novaCategoria, setNovaCategoria] = useState("");
  const [hoveredProductId, setHoveredProductId] = useState<number | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState<{x: number, y: number} | null>(null)

  const handleImageHover = (produtoId: number, event: React.MouseEvent) => {
    setHoveredProductId(produtoId)
    
    const rect = event.currentTarget.getBoundingClientRect()
    const tooltipWidth = 160 // largura estimada do tooltip
    const tooltipHeight = 180 // altura estimada do pop-up da imagem
    
    let x = rect.left + rect.width / 2 - tooltipWidth / 2
    let y = rect.top - tooltipHeight - 10
    
    // Ajustar horizontalmente se sair da tela
    if (x < 10) x = 10
    if (x + tooltipWidth > window.innerWidth - 10) x = window.innerWidth - tooltipWidth - 10
    
    // Se não couber acima, colocar abaixo
    if (y < 10) {
      y = rect.bottom + 10
    }
    
    setTooltipPosition({ x, y })
  }
  const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false);
  const { toast } = useToast()

  const loadProdutos = useCallback(async () => {
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
  }, [toast])

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
      const data = await ApiService.buscarProdutoPorNome(searchTerm)
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
    if (!formData.nome.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Nome do produto é obrigatório",
        variant: "destructive"
      })
      return
    }

    if (!formData.preco || formData.preco <= 0) {
      toast({
        title: "Valor inválido",
        description: "O preço deve ser maior que zero",
        variant: "destructive"
      })
      return
    }

    if (formData.custo !== null && formData.custo !== undefined && formData.custo < 0) {
      toast({
        title: "Valor inválido",
        description: "O custo não pode ser negativo",
        variant: "destructive"
      })
      return
    }

    try {
      const produtoCriado = await ApiService.criarProdutoComImagem(formData, selectedImage || undefined)
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

    if (!formData.nome.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Nome do produto é obrigatório",
        variant: "destructive"
      })
      return
    }

    if (!formData.preco || formData.preco <= 0) {
      toast({
        title: "Valor inválido",
        description: "O preço deve ser maior que zero",
        variant: "destructive"
      })
      return
    }

    if (formData.custo !== null && formData.custo !== undefined && formData.custo < 0) {
      toast({
        title: "Valor inválido",
        description: "O custo não pode ser negativo",
        variant: "destructive"
      })
      return
    }

    try {
      // Se temos uma nova imagem selecionada, não devemos remover a foto
      const shouldRemovePhoto = removerFoto && !selectedImage;
      
      await ApiService.atualizarProdutoComImagem(selectedProduto.id, formData, selectedImage || undefined, shouldRemovePhoto)
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
      custo: null,
      quantidadeEstoque: 0,
      ativo: true,
      descricao: "",
      fotoUrl: ""
    })
    setSelectedProduto(null)
    setSelectedImage(null)
    setRemoverFoto(false)
  }

  const renderProdutoCard = (produto: Produto, index: number) => {
    const calcularMargem = () => {
      if (produto.preco && produto.custo && produto.custo > 0) {
        const margem = ((produto.preco - produto.custo) / produto.preco) * 100;
        return margem.toFixed(1) + '%';
      }
      return '-';
    };

    const margem = calcularMargem();
    const margemNumeric = produto.preco && produto.custo && produto.custo > 0 
      ? ((produto.preco - produto.custo) / produto.preco) * 100 
      : null;

    const getStatusColor = (ativo: boolean) => {
      return ativo ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600";
    };

    const getEstoqueColor = (quantidade: number) => {
      if (quantidade < 20) return "text-red-600";
      if (quantidade > 50) return "text-green-600";
      return "text-yellow-600";
    };

    const getMargemColor = (margem: number | null) => {
      if (margem === null) return "text-gray-400";
      if (margem >= 30) return "text-green-600";
      if (margem >= 15) return "text-yellow-600";
      return "text-red-600";
    };

    const fields: CardField[] = [
      {
        label: "Categoria",
        value: produto.categoria || "Sem categoria",
        className: "font-medium"
      },
      {
        label: "Preço",
        value: produto.preco ? `R$ ${produto.preco.toFixed(2)}` : "Não informado",
        className: "font-semibold text-gray-800"
      },
      {
        label: "Custo",
        value: produto.custo ? `R$ ${produto.custo.toFixed(2)}` : "Não informado",
        className: "text-gray-700"
      },
      {
        label: "Margem",
        value: margem,
        className: `font-medium ${getMargemColor(margemNumeric)}`
      },
      {
        label: "Estoque",
        value: `${produto.quantidadeEstoque || 0} unid.`,
        className: `font-semibold ${getEstoqueColor(produto.quantidadeEstoque || 0)}`
      },
      {
        label: "Status",
        value: produto.ativo ? "Ativo" : "Inativo",
        isStatus: true,
        statusVariant: produto.ativo ? "default" : "secondary"
      }
    ];

    const actions = [
      createDefaultActions.view(() => openViewDialog(produto)),
      createDefaultActions.edit(() => openEditDialog(produto)),
      createDefaultActions.delete(() => produto.id && handleDeleteProduto(produto.id))
    ];

    return (
      <MobileDataCard
        key={produto.id}
        title={produto.nome}
        fields={fields}
        actions={actions}
        className="mb-4"
      />
    );
  };

  const openEditDialog = (produto: Produto) => {
    setSelectedProduto(produto)
    setFormData({
      nome: produto.nome,
      categoria: produto.categoria || "",
      preco: produto.preco || 0,
      custo: produto.custo || null,
      quantidadeEstoque: produto.quantidadeEstoque || 0,
      ativo: produto.ativo ?? true,
      descricao: produto.descricao || "",
      fotoUrl: produto.fotoUrl || ""
    })
    setSelectedImage(null)
    setRemoverFoto(false)
    setShowEditDialog(true)
  }

  const openViewDialog = (produto: Produto) => {
    setSelectedProduto(produto)
    setShowViewDialog(true)
  }

  const filteredProdutos = produtos.filter(produto => {
    const matchesCategoria = filterCategoria === "" || produto.categoria === filterCategoria
    const matchesAtivo = filterAtivo === null || produto.ativo === filterAtivo
    return matchesCategoria && matchesAtivo
  })

  const categoriasUnicas = Array.from(new Set(produtos.map(p => p.categoria).filter(Boolean)))

  const loadCategorias = useCallback(async () => {
    try {
      const data = await ApiService.listarCategorias();
      setCategorias(data);
    } catch (error) {
      toast({
        title: "Erro ao carregar categorias",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    loadCategorias();
  }, []);

  return (
    <AuthenticatedLayout>
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <PageHeader
        icon={<Package className="h-8 w-8 text-[#0C0C0C]" />}
        title="Produtos"
        description="Gerencie seu catálogo de produtos"
        actions={
          <>
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
              Novo Produto
            </Button>
          </>
        }
      />

      {/* Card de Busca - simplificado */}
      <Card className="border-[#FFD300]/20 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="bg-gradient-to-r from-[#FFFDF0] to-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#FFD300]/20 rounded-lg">
              <Search className="h-5 w-5 text-[#0C0C0C]" />
            </div>
            <div>
              <CardTitle className="text-lg text-[#0C0C0C]">Buscar Produtos</CardTitle>
              <CardDescription className="text-gray-600">
                Use os filtros para encontrar produtos específicos
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-end">
            {/* Campo de busca */}
            <div className="lg:col-span-5">
              <Label htmlFor="search" className="text-sm font-medium text-gray-700 mt-2 mb-2 block">
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
                  onKeyPress={(e) => e.key === 'Enter' && searchProdutos()}
                />
              </div>
            </div>
            
            {/* Botões de ação */}
            <div className="lg:col-span-7 flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-end">
              <Button
                onClick={() => {
                  setHasSearched(true)
                  searchProdutos()
                }}
                disabled={!searchTerm.trim() || loading}
                className="bg-gradient-to-r from-[#FFD300] to-[#E6BD00] text-[#0C0C0C] hover:from-[#E6BD00] hover:to-[#FFD300] flex-1 h-11 shadow-md hover:shadow-lg transition-all duration-200 font-medium rounded-xl"
              >
                <Search className="w-4 h-4 mr-2" />
                {loading ? 'Buscando...' : 'Buscar'}
              </Button>
              <Button
                onClick={() => {
                  setHasSearched(true)
                  loadProdutos()
                }}
                disabled={loading}
                variant="outline"
                className="flex-1 h-11 border-[#FFD300]/50 hover:border-[#FFD300] hover:bg-[#FFFDF0] transition-all duration-200 rounded-xl"
              >
                <Package className="w-4 h-4 mr-2" />
                Todos
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card de Produtos - modificado */}
      <Card className="border-[#FFD300]/20 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-[#FFFDF0] to-white">
          <div className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#FFD300]/20 rounded-lg">
                <Package className="h-5 w-5 text-[#0C0C0C]" />
              </div>
              <div>
                <CardTitle className="text-lg text-[#0C0C0C]">
                  Produtos Encontrados ({filteredProdutos.length})
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {filteredProdutos.length === 1 ? 'produto encontrado' : 'produtos no catálogo'}
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleExportProdutos}
                variant="outline"
                className="border-[#FFD300]/50 hover:border-[#FFD300] hover:bg-[#FFFDF0] transition-all duration-200 rounded-xl"
                disabled={filteredProdutos.length === 0}
              >
                <Download className="w-4 h-4 mr-2 text-[#0C0C0C]" />
                Exportar
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setFilterCategoria("")
                  setFilterAtivo(null)
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Use a busca ou adicione um produto</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Digite o nome do produto, busque todos ou use os filtros para visualizar produtos do seu catálogo.
                </p>
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-gradient-to-r from-[#FFD300] to-[#E6BD00] text-[#0C0C0C] hover:from-[#E6BD00] hover:to-[#FFD300] shadow-md hover:shadow-lg transition-all duration-200 font-medium rounded-xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Produto
                </Button>
              </div>
            </div>
          ) : loading ? (
            <div className="text-center py-8">Carregando produtos...</div>
          ) : produtos.length === 0 ? (
            <div className="py-16">
              <div className="text-center">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-[#FFD300]/20 to-[#FFD300]/10 rounded-full flex items-center justify-center mb-6">
                  <Package className="h-10 w-10 text-[#FFD300]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum produto encontrado</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Comece criando seu primeiro produto no catálogo.
                </p>
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-gradient-to-r from-[#FFD300] to-[#E6BD00] text-[#0C0C0C] hover:from-[#E6BD00] hover:to-[#FFD300] shadow-md hover:shadow-lg transition-all duration-200 font-medium rounded-xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Produto
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Filtros movidos para dentro do card de produtos */}
              <Card className="bg-gray-50/50 border-gray-200/50 mt-5">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-600" />
                    <CardTitle className="text-base text-gray-700">Filtros</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="filterCategoria" className="text-sm font-medium text-gray-700 mb-2 block">
                        Filtrar por categoria
                      </Label>
                      <Select value={filterCategoria} onValueChange={(value) => setFilterCategoria(value === "all" ? "" : value)}>
                        <SelectTrigger className="border-gray-200 focus:border-[#FFD300] focus:ring-[#FFD300]/20 rounded-xl">
                          <SelectValue placeholder="Todas as categorias" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas as categorias</SelectItem>
                          {categoriasUnicas.map(categoria => (
                            <SelectItem key={categoria} value={categoria!}>
                              {categoria}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="filterStatus" className="text-sm font-medium text-gray-700 mb-2 block">
                        Filtrar por status
                      </Label>
                      <Select 
                        value={filterAtivo === null ? "all" : filterAtivo.toString()} 
                        onValueChange={(value) => {
                          const ativo = value === "all" ? null : value === "true"
                          setFilterAtivo(ativo)
                        }}
                      >
                        <SelectTrigger className="border-gray-200 focus:border-[#FFD300] focus:ring-[#FFD300]/20 rounded-xl">
                          <SelectValue placeholder="Todos os status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os status</SelectItem>
                          <SelectItem value="true">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              Ativo
                            </div>
                          </SelectItem>
                          <SelectItem value="false">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                              Inativo
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Área de resultados: mostra mensagem ou tabela, mas mantém os filtros visíveis */}
              {filteredProdutos.length === 0 ? (
                <div className="py-16">
                  <div className="text-center">
                    <div className="mx-auto w-20 h-20 bg-gradient-to-br from-[#FFD300]/20 to-[#FFD300]/10 rounded-full flex items-center justify-center mb-6">
                      <Package className="h-10 w-10 text-[#FFD300]" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum produto encontrado</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      {produtos.length === 0 
                        ? "Comece criando seu primeiro produto no catálogo." 
                        : "Tente ajustar os filtros para encontrar o que procura."
                      }
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button
                        onClick={() => setShowCreateDialog(true)}
                        className="bg-gradient-to-r from-[#FFD300] to-[#E6BD00] text-[#0C0C0C] hover:from-[#E6BD00] hover:to-[#FFD300] shadow-md hover:shadow-lg transition-all duration-200 font-medium rounded-xl"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Produto
                      </Button>
                      {produtos.length > 0 && (
                        <Button
                          onClick={() => {
                            setFilterCategoria("")
                            setFilterAtivo(null)
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
                      <CardTitle className="text-base text-gray-700">Lista de Produtos</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {isMobile ? (
                      <div className="p-4 space-y-4">
                        {filteredProdutos.map((produto, index) => renderProdutoCard(produto, index))}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50/50 border-b-2 border-[#FFD300]/20">
                              <TableHead className="min-w-[120px] font-semibold text-gray-700">Nome</TableHead>
                              <TableHead className="hidden md:table-cell font-semibold text-gray-700 min-w-[100px]">Categoria</TableHead>
                              <TableHead className="hidden lg:table-cell font-semibold text-gray-700 min-w-[80px]">Preço</TableHead>
                              <TableHead className="hidden xl:table-cell font-semibold text-gray-700 min-w-[80px]">Custo</TableHead>
                              <TableHead className="hidden xl:table-cell font-semibold text-gray-700 min-w-[80px]">Margem</TableHead>
                              <TableHead className="text-center font-semibold text-gray-700 min-w-[80px]">Estoque</TableHead>
                              <TableHead className="text-center font-semibold text-gray-700 min-w-[80px]">Status</TableHead>
                              <TableHead className="text-center min-w-[90px] font-semibold text-gray-700">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredProdutos.map((produto, index) => {
                              const calcularMargem = () => {
                                if (produto.preco && produto.custo && produto.custo > 0) {
                                  const margem = ((produto.preco - produto.custo) / produto.preco) * 100;
                                  return margem.toFixed(1) + '%';
                                }
                                return '-';
                              };

                              const margem = calcularMargem();
                              const margemNumeric = produto.preco && produto.custo && produto.custo > 0 
                                ? ((produto.preco - produto.custo) / produto.preco) * 100 
                                : null;

                              return (
                                <TableRow 
                                  key={produto.id}
                                  className={`hover:bg-[#FFFDF0] transition-colors ${
                                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                                  }`}
                                >
                                  <TableCell className="font-medium py-4">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <div className="font-medium text-gray-900">{produto.nome}</div>
                                        {produto.fotoUrl && (
                                          <div className="relative">
                                            <div
                                              className="inline-flex items-center justify-center w-5 h-5 bg-[#FFD300]/10 rounded-full cursor-pointer hover:bg-[#FFD300]/20 transition-colors"
                                              onMouseEnter={(e) => produto.id && handleImageHover(produto.id, e)}
                                              onMouseLeave={() => {
                                                setHoveredProductId(null)
                                                setTooltipPosition(null)
                                              }}
                                            >
                                              <ImageIcon className="w-3 h-3 text-[#FFD300]" />
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                      <div className="text-xs text-gray-500 md:hidden bg-gray-100 px-2 py-1 rounded-md inline-block">
                                        {produto.categoria || "Sem categoria"}
                                      </div>
                                      <div className="text-xs text-gray-500 lg:hidden">
                                        {produto.preco ? `R$ ${produto.preco.toFixed(2)}` : "Sem preço"}
                                      </div>
                                      <div className="text-xs text-gray-500 xl:hidden">
                                        Custo: {produto.custo ? `R$ ${produto.custo.toFixed(2)}` : "Não informado"}
                                      </div>
                                      <div className="text-xs text-gray-500 xl:hidden">
                                        Margem: {margem}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="hidden md:table-cell py-4">
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-medium">
                                      {produto.categoria || "Sem categoria"}
                                    </span>
                                  </TableCell>
                                  <TableCell className="hidden lg:table-cell py-4">
                                    <span className="font-semibold text-gray-800">
                                      {produto.preco ? `R$ ${produto.preco.toFixed(2)}` : "-"}
                                    </span>
                                  </TableCell>
                                  <TableCell className="hidden xl:table-cell py-4">
                                    {produto.custo ? (
                                      <span className="text-gray-700">R$ {produto.custo.toFixed(2)}</span>
                                    ) : (
                                      <span className="text-gray-400 text-sm">Não informado</span>
                                    )}
                                  </TableCell>
                                  <TableCell className="hidden xl:table-cell py-4">
                                    <div className="flex items-center gap-2">
                                      <span className={`font-medium ${
                                        margemNumeric === null ? 'text-gray-400' :
                                        margemNumeric >= 30 ? 'text-green-600' :
                                        margemNumeric >= 15 ? 'text-yellow-600' :
                                        'text-red-600'
                                      }`}>
                                        {margem}
                                      </span>
                                      {margemNumeric !== null && (
                                        <div
                                          className={`w-2 h-2 rounded-full ${
                                            margemNumeric >= 30 ? "bg-green-500" :
                                            margemNumeric >= 15 ? "bg-yellow-500" :
                                            "bg-red-500"
                                          }`}
                                        />
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-center py-4">
                                    <div className="flex items-center justify-center gap-2">
                                      <span className="font-semibold text-gray-800 bg-[#FFD300]/20 px-3 py-1 rounded-lg">
                                        {produto.quantidadeEstoque || 0}
                                      </span>
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
                                  <TableCell className="text-center py-4">
                                    <Badge 
                                      variant={produto.ativo ? "default" : "secondary"} 
                                      className={`text-xs ${
                                        produto.ativo 
                                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                      }`}
                                    >
                                      <div className="flex items-center gap-1">
                                        <div className={`w-1.5 h-1.5 rounded-full ${
                                          produto.ativo ? 'bg-green-500' : 'bg-gray-400'
                                        }`}></div>
                                        {produto.ativo ? "Ativo" : "Inativo"}
                                      </div>
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="py-4">
                                    <div className="flex justify-center space-x-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => openViewDialog(produto)}
                                        className="h-9 w-9 p-0 hover:bg-blue-100 hover:text-blue-700 transition-colors rounded-lg"
                                        title="Visualizar"
                                      >
                                        <Eye className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => openEditDialog(produto)}
                                        className="h-9 w-9 p-0 hover:bg-[#FFD300]/30 hover:text-[#0C0C0C] transition-colors rounded-lg"
                                        title="Editar"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => produto.id && handleDeleteProduto(produto.id)}
                                        className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-100 transition-colors rounded-lg"
                                        title="Excluir"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tooltip global para preview de imagens */}
      {hoveredProductId && tooltipPosition && (
        <div 
          className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-0 overflow-hidden pointer-events-none"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
          }}
        >
          <div className="w-40 h-40">
            <img
              src={getFullImageUrl(filteredProdutos.find(p => p.id === hoveredProductId)?.fotoUrl || '')}
              alt={filteredProdutos.find(p => p.id === hoveredProductId)?.nome || ''}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-100"><svg class="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg></div>';
              }}
            />
          </div>
          {/* Nome do produto */}
          <div className="p-2 bg-gray-50 border-t border-gray-200">
            <p className="text-xs font-medium text-gray-700 text-center truncate">
              {filteredProdutos.find(p => p.id === hoveredProductId)?.nome}
            </p>
          </div>
        </div>
      )}

      {/* Dialog para Criar Produto */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => {
        setShowCreateDialog(open);
        if (open) {
          resetForm();
          if (categorias.length === 0) {
            loadCategorias();
          }
        } else {
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl w-[95vw] sm:w-full border-[#FFD300]/20 shadow-xl rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="bg-gradient-to-r from-[#FFFDF0] to-white p-4 sm:p-6 -m-4 sm:-m-6 mb-4 sm:mb-6 rounded-t-2xl border-b border-[#FFD300]/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#FFD300]/20 rounded-lg">
                <Plus className="h-5 w-5 text-[#0C0C0C]" />
              </div>
              <div>
                <DialogTitle className="text-lg text-[#0C0C0C]">Criar Novo Produto</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Preencha as informações do produto no catálogo
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="nome" className="text-sm font-medium text-gray-700 mb-2 block">
                  Nome do Produto *
                </Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Digite o nome do produto"
                  className="border-gray-200 focus:border-[#FFD300] focus:ring-[#FFD300]/20 rounded-xl h-11"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="categoria" className="text-sm font-medium text-gray-700 mb-2 block">
                  Categoria
                </Label>
                <div className="flex items-center gap-2">
                  <Select
                    value={formData.categoria}
                    onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                  >
                    <SelectTrigger className="border-gray-200 focus:border-[#FFD300] focus:ring-[#FFD300]/20 rounded-xl h-11">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS_PRODUTOS.map((categoria) => (
                        <SelectItem key={categoria.value} value={categoria.value}>
                          {categoria.label}
                        </SelectItem>
                      ))}
                      {/* Categorias personalizadas do usuário */}
                      {categorias.filter(cat => !CATEGORIAS_PRODUTOS.some(predef => predef.value === cat)).map((categoria) => (
                        <SelectItem key={categoria} value={categoria}>
                          {categoria}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => setShowNewCategoryDialog(true)}
                    variant="outline"
                    size="sm"
                    className="h-11 px-3 border-[#FFD300]/50 hover:border-[#FFD300] hover:bg-[#FFFDF0] rounded-xl"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="preco" className="text-sm font-medium text-gray-700 mb-2 block">
                  Preço de Venda
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 h-11 flex items-center min-w-[50px]">
                    R$
                  </span>
                  <Input
                    id="preco"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.preco === 0 ? "" : formData.preco || ""}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      setFormData({ ...formData, preco: isNaN(value) || value < 0 ? 0 : value });
                    }}
                    placeholder="0,00"
                    className="border-gray-200 focus:border-[#FFD300] focus:ring-[#FFD300]/20 rounded-xl h-11"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="custo" className="text-sm font-medium text-gray-700 mb-2 block">
                  Custo (Opcional)
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 h-11 flex items-center min-w-[50px]">
                    R$
                  </span>
                  <Input
                    id="custo"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.custo === null || formData.custo === 0 ? "" : formData.custo || ""}
                    onChange={(e) => {
                      const value = e.target.value === "" ? null : parseFloat(e.target.value);
                      setFormData({ ...formData, custo: value === null ? null : (isNaN(value as number) || value < 0 ? null : value) });
                    }}
                    placeholder="0,00"
                    className="border-gray-200 focus:border-[#FFD300] focus:ring-[#FFD300]/20 rounded-xl h-11"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Campo opcional. Usado para calcular margem de lucro.
                </p>
              </div>

              <div>
                <Label htmlFor="estoque" className="text-sm font-medium text-gray-700 mb-2 block">
                  Quantidade em Estoque
                </Label>
                <Input
                  id="estoque"
                  type="number"
                  min="0"
                  value={formData.quantidadeEstoque === 0 ? "" : formData.quantidadeEstoque || ""}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setFormData({ ...formData, quantidadeEstoque: isNaN(value) ? 0 : value });
                  }}
                  placeholder="Ex: 100"
                  className="border-gray-200 focus:border-[#FFD300] focus:ring-[#FFD300]/20 rounded-xl h-11"
                />
              </div>

              <div className="flex items-center space-x-3 bg-gray-50/50 p-4 rounded-xl">
                <Switch
                  id="ativo"
                  checked={formData.ativo}
                  onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                />
                <div>
                  <Label htmlFor="ativo" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Produto ativo
                  </Label>
                  <p className="text-xs text-gray-500">
                    Produtos ativos aparecem no catálogo
                  </p>
                </div>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="descricao" className="text-sm font-medium text-gray-700 mb-2 block">
                  Descrição do Produto
                </Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Digite uma descrição detalhada do produto..."
                  rows={3}
                  className="border-gray-200 focus:border-[#FFD300] focus:ring-[#FFD300]/20 rounded-xl resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Campo opcional. Descrição detalhada do produto.
                </p>
              </div>

              <div className="md:col-span-2">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Imagem do Produto
                </Label>
                <ImageUploadZone
                  onImageSelect={(file) => {
                    setSelectedImage(file)
                    setRemoverFoto(false) // Consistência com formulário de edição
                  }}
                  selectedImage={selectedImage}
                  onRemoveImage={() => setSelectedImage(null)}
                  maxSize={5}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Formatos aceitos: JPEG, PNG. Tamanho máximo: 5MB.
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter className="bg-gray-50/50 p-4 sm:p-6 -m-4 sm:-m-6 mt-4 sm:mt-6 rounded-b-2xl border-t border-[#FFD300]/20">
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button 
                variant="outline" 
                onClick={() => setShowCreateDialog(false)}
                className="flex-1 border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-xl h-11"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateProduto}
                disabled={!formData.nome.trim()}
                className="flex-1 bg-gradient-to-r from-[#FFD300] to-[#E6BD00] text-[#0C0C0C] hover:from-[#E6BD00] hover:to-[#FFD300] shadow-md hover:shadow-lg transition-all duration-200 font-medium rounded-xl h-11"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Produto
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para Editar Produto */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl w-[95vw] sm:w-full border-[#FFD300]/20 shadow-xl rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="bg-gradient-to-r from-[#FFFDF0] to-white p-4 sm:p-6 -m-4 sm:-m-6 mb-4 sm:mb-6 rounded-t-2xl border-b border-[#FFD300]/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#FFD300]/20 rounded-lg">
                <Edit className="h-5 w-5 text-[#0C0C0C]" />
              </div>
              <div>
                <DialogTitle className="text-lg text-[#0C0C0C]">Editar Produto</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Altere as informações do produto selecionado
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="edit-nome" className="text-sm font-medium text-gray-700 mb-2 block">
                  Nome do Produto *
                </Label>
                <Input
                  id="edit-nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Digite o nome do produto"
                  className="border-gray-200 focus:border-[#FFD300] focus:ring-[#FFD300]/20 rounded-xl h-11"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="edit-categoria" className="text-sm font-medium text-gray-700 mb-2 block">
                  Categoria
                </Label>
                <div className="flex items-center gap-2">
                  <Select
                    value={formData.categoria}
                    onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                  >
                    <SelectTrigger className="border-gray-200 focus:border-[#FFD300] focus:ring-[#FFD300]/20 rounded-xl h-11">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((categoria) => (
                        <SelectItem key={categoria} value={categoria}>
                          {categoria}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => setShowNewCategoryDialog(true)}
                    variant="outline"
                    size="sm"
                    className="h-11 px-3 border-[#FFD300]/50 hover:border-[#FFD300] hover:bg-[#FFFDF0] rounded-xl"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-preco" className="text-sm font-medium text-gray-700 mb-2 block">
                  Preço de Venda
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 h-11 flex items-center min-w-[50px]">
                    R$
                  </span>
                  <Input
                    id="edit-preco"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.preco || ""}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      setFormData({ ...formData, preco: isNaN(value) || value < 0 ? 0 : value });
                    }}
                    placeholder="0.00"
                    className="border-gray-200 focus:border-[#FFD300] focus:ring-[#FFD300]/20 rounded-xl h-11"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-custo" className="text-sm font-medium text-gray-700 mb-2 block">
                  Custo (Opcional)
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 h-11 flex items-center min-w-[50px]">
                    R$
                  </span>
                  <Input
                    id="edit-custo"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.custo || ""}
                    onChange={(e) => {
                      const value = e.target.value === "" ? null : parseFloat(e.target.value);
                      setFormData({ ...formData, custo: value === null ? null : (isNaN(value as number) || value < 0 ? null : value) });
                    }}
                    placeholder="0.00"
                    className="border-gray-200 focus:border-[#FFD300] focus:ring-[#FFD300]/20 rounded-xl h-11"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Campo opcional. Usado para calcular margem de lucro.
                </p>
              </div>

              <div>
                <Label htmlFor="edit-estoque" className="text-sm font-medium text-gray-700 mb-2 block">
                  Quantidade em Estoque
                </Label>
                <Input
                  id="edit-estoque"
                  type="number"
                  min="0"
                  value={formData.quantidadeEstoque || ""}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setFormData({ ...formData, quantidadeEstoque: isNaN(value) ? 0 : value });
                  }}
                  placeholder="Ex: 100"
                  className="border-gray-200 focus:border-[#FFD300] focus:ring-[#FFD300]/20 rounded-xl h-11"
                />
              </div>

              <div className="flex items-center space-x-3 bg-gray-50/50 p-4 rounded-xl">
                <Switch
                  id="edit-ativo"
                  checked={formData.ativo}
                  onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                />
                <div>
                  <Label htmlFor="edit-ativo" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Produto ativo
                  </Label>
                  <p className="text-xs text-gray-500">
                    Produtos ativos aparecem no catálogo
                  </p>
                </div>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="edit-descricao" className="text-sm font-medium text-gray-700 mb-2 block">
                  Descrição do Produto
                </Label>
                <Textarea
                  id="edit-descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Digite uma descrição detalhada do produto..."
                  rows={3}
                  className="border-gray-200 focus:border-[#FFD300] focus:ring-[#FFD300]/20 rounded-xl resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Campo opcional. Descrição detalhada do produto.
                </p>
              </div>

              <div className="md:col-span-2">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Imagem do Produto
                </Label>
                <ImageUploadZone
                  onImageSelect={(file) => {
                    setSelectedImage(file)
                    setRemoverFoto(false) // Limpar flag quando nova imagem é selecionada
                  }}
                  selectedImage={selectedImage}
                  currentImageUrl={getFullImageUrl(formData.fotoUrl)}
                  onRemoveImage={() => {
                    setSelectedImage(null)
                    setRemoverFoto(true)
                    setFormData(prev => ({ ...prev, fotoUrl: "" }))
                  }}
                  maxSize={5}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Formatos aceitos: JPEG, PNG. Tamanho máximo: 5MB.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="bg-gray-50/50 p-4 sm:p-6 -m-4 sm:-m-6 mt-4 sm:mt-6 rounded-b-2xl border-t border-[#FFD300]/20">
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button 
                variant="outline" 
                onClick={() => setShowEditDialog(false)}
                className="flex-1 border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-xl h-11"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUpdateProduto}
                disabled={!formData.nome.trim()}
                className="flex-1 bg-gradient-to-r from-[#FFD300] to-[#E6BD00] text-[#0C0C0C] hover:from-[#E6BD00] hover:to-[#FFD300] shadow-md hover:shadow-lg transition-all duration-200 font-medium rounded-xl h-11"
              >
                <Edit className="w-4 h-4 mr-2" />
                Salvar Alterações
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para Visualizar Produto */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl w-[95vw] sm:w-full border-[#FFD300]/20 shadow-xl rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="bg-gradient-to-r from-[#FFFDF0] to-white p-4 sm:p-6 -m-4 sm:-m-6 mb-4 sm:mb-6 rounded-t-2xl border-b border-[#FFD300]/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#FFD300]/20 rounded-lg">
                <Eye className="h-5 w-5 text-[#0C0C0C]" />
              </div>
              <div>
                <DialogTitle className="text-lg text-[#0C0C0C]">Detalhes do Produto</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Visualize as informações completas do produto
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          {selectedProduto && (
            <div className="space-y-6">
              {/* Imagem do Produto */}
              {selectedProduto.fotoUrl && (
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                    Imagem do Produto
                  </Label>
                  <div className="flex justify-center">
                    <img
                      src={getFullImageUrl(selectedProduto.fotoUrl)}
                      alt={selectedProduto.nome}
                      className="max-w-full max-h-64 object-contain rounded-lg shadow-sm"
                      onError={(e) => {
                        console.error('Erro ao carregar imagem no modal:', {
                          original: selectedProduto.fotoUrl,
                          full: getFullImageUrl(selectedProduto.fotoUrl),
                          produto: selectedProduto.nome
                        });
                      }}
                      loading="lazy"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50/50 p-4 rounded-xl">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <Package className="h-4 w-4" />
                    Nome do Produto
                  </Label>
                  <p className="text-gray-900 font-medium">{selectedProduto.nome}</p>
                </div>
                
                <div className="bg-gray-50/50 p-4 rounded-xl">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <Filter className="h-4 w-4" />
                    Categoria
                  </Label>
                  <p className="text-gray-900">{selectedProduto.categoria || "Sem categoria"}</p>
                </div>
                
                <div className="bg-green-50/50 p-4 rounded-xl border border-green-200/50">
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Preço de Venda
                  </Label>
                  <p className="text-xl font-bold text-green-700">
                    {selectedProduto.preco ? `R$ ${selectedProduto.preco.toFixed(2)}` : "Não definido"}
                  </p>
                </div>
                
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-200/50">
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Custo do Produto
                  </Label>
                  <p className="text-xl font-bold text-blue-700">
                    {selectedProduto.custo ? `R$ ${selectedProduto.custo.toFixed(2)}` : (
                      <span className="text-gray-500 text-base font-normal">Não informado</span>
                    )}
                  </p>
                </div>

                {selectedProduto.preco && selectedProduto.custo && (
                  <div className="bg-[#FFD300]/10 p-4 rounded-xl border border-[#FFD300]/20">
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Margem de Lucro
                    </Label>
                    <div className="flex items-center gap-3">
                      <p className={`text-xl font-bold ${
                        ((selectedProduto.preco - selectedProduto.custo) / selectedProduto.preco) * 100 >= 30 ? 'text-green-600' :
                        ((selectedProduto.preco - selectedProduto.custo) / selectedProduto.preco) * 100 >= 15 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {(((selectedProduto.preco - selectedProduto.custo) / selectedProduto.preco) * 100).toFixed(1)}%
                      </p>
                      <Badge variant={
                        ((selectedProduto.preco - selectedProduto.custo) / selectedProduto.preco) * 100 >= 30 ? "default" :
                        ((selectedProduto.preco - selectedProduto.custo) / selectedProduto.preco) * 100 >= 15 ? "secondary" :
                        "destructive"
                      } className="text-xs">
                        {((selectedProduto.preco - selectedProduto.custo) / selectedProduto.preco) * 100 >= 30 ? "Boa" :
                         ((selectedProduto.preco - selectedProduto.custo) / selectedProduto.preco) * 100 >= 15 ? "Média" :
                         "Baixa"}
                      </Badge>
                    </div>
                  </div>
                )}
                
                <div className="bg-[#FFD300]/10 p-4 rounded-xl border border-[#FFD300]/20">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <Package className="h-4 w-4" />
                    Quantidade em Estoque
                  </Label>
                  <div className="flex items-center gap-3">
                    <p className="text-xl font-bold text-[#0C0C0C]">{selectedProduto.quantidadeEstoque || 0}</p>
                    <div
                      className={`w-3 h-3 rounded-full ${
                        (selectedProduto.quantidadeEstoque || 0) < 20
                          ? "bg-red-500"
                          : (selectedProduto.quantidadeEstoque || 0) > 50
                          ? "bg-green-500"
                          : "bg-yellow-500"
                      }`}
                    />
                    <span className="text-xs text-gray-600">
                      {(selectedProduto.quantidadeEstoque || 0) < 20 ? "Estoque baixo" :
                       (selectedProduto.quantidadeEstoque || 0) > 50 ? "Estoque adequado" : "Estoque médio"}
                    </span>
                  </div>
                </div>

                {selectedProduto.dataCriacao && (
                  <div className="bg-gray-50/50 p-4 rounded-xl">
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Data de Criação
                    </Label>
                    <p className="text-gray-900">
                      {new Date(selectedProduto.dataCriacao).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}
              </div>

              {selectedProduto.descricao && (
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-200/50">
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Descrição do Produto
                  </Label>
                  <p className="text-gray-900 leading-relaxed">{selectedProduto.descricao}</p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xs text-gray-500">Status:</span>
                  <Badge
                    variant={selectedProduto.ativo ? "default" : "secondary"}
                    className={`text-xs ${
                      selectedProduto.ativo
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        selectedProduto.ativo ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                      {selectedProduto.ativo ? "Ativo" : "Inativo"}
                    </div>
                  </Badge>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="bg-gray-50/50 p-4 sm:p-6 -m-4 sm:-m-6 mt-4 sm:mt-6 rounded-b-2xl border-t border-[#FFD300]/20">
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

      {/* Dialog para Criar Nova Categoria */}
      <Dialog open={showNewCategoryDialog} onOpenChange={setShowNewCategoryDialog}>
        <DialogContent className="max-w-md w-[95vw] sm:w-full border-[#FFD300]/20 shadow-xl rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="bg-gradient-to-r from-[#FFFDF0] to-white p-4 sm:p-6 -m-4 sm:-m-6 mb-4 sm:mb-6 rounded-t-2xl border-b border-[#FFD300]/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#FFD300]/20 rounded-lg">
                <Plus className="h-5 w-5 text-[#0C0C0C]" />
              </div>
              <div>
                <DialogTitle className="text-lg text-[#0C0C0C]">Criar Nova Categoria</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Adicione uma nova categoria ao seu catálogo
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="nova-categoria" className="text-sm font-medium text-gray-700 mb-2 block">
                Nome da Categoria *
              </Label>
              <Input
                id="nova-categoria"
                value={novaCategoria}
                onChange={(e) => setNovaCategoria(e.target.value)}
                placeholder="Digite o nome da categoria"
                className="border-gray-200 focus:border-[#FFD300] focus:ring-[#FFD300]/20 rounded-xl h-11"
              />
              <p className="text-xs text-gray-500 mt-1">
                A categoria será adicionada automaticamente ao produto atual
              </p>
            </div>
          </div>

          <DialogFooter className="bg-gray-50/50 p-4 sm:p-6 -m-4 sm:-m-6 mt-4 sm:mt-6 rounded-b-2xl border-t border-[#FFD300]/20">
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button 
                variant="outline" 
                onClick={() => setShowNewCategoryDialog(false)}
                className="flex-1 border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-xl h-11"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  if (novaCategoria.trim()) {
                    setCategorias((prev) => [...prev, novaCategoria.trim()]);
                    setFormData({ ...formData, categoria: novaCategoria.trim() });
                    setNovaCategoria("");
                    setShowNewCategoryDialog(false);
                  }
                }}
                disabled={!novaCategoria.trim()}
                className="flex-1 bg-gradient-to-r from-[#FFD300] to-[#E6BD00] text-[#0C0C0C] hover:from-[#E6BD00] hover:to-[#FFD300] shadow-md hover:shadow-lg transition-all duration-200 font-medium rounded-xl h-11"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Categoria
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </AuthenticatedLayout>
  )
}
