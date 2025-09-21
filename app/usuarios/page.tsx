"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Eye, Filter, Users, User, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ApiService, Usuario } from "@/lib/api"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import AuthenticatedLayout from "@/components/authenticated-layout"
import MobileDataCard, { createDefaultActions, CardField } from "@/components/mobile-data-card"
import { useIsMobile } from "@/hooks/use-mobile"

export default function UsuariosPage() {
  const { toast } = useToast()
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const isMobile = useIsMobile()
  
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [hasSearched, setHasSearched] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null)
  const [formData, setFormData] = useState<{
    nome: string
    email: string
    password: string
    role: 'USER' | 'ADMIN'
  }>({
    nome: "",
    email: "",
    password: "",
    role: "USER"
  })
  const [editFormData, setEditFormData] = useState<Omit<Usuario, "id" | "dataCriacao" | "createdAt">>({
    nome: "",
    email: "",
    role: "USER"
  })
  const [filterRole, setFilterRole] = useState<'USER' | 'ADMIN' | 'ALL'>('ALL')

  // Verificar se o usuário tem permissão de acesso
  useEffect(() => {
    if (!authLoading && user && user.role !== 'ADMIN') {
      router.push('/unauthorized')
      return
    }
  }, [user, authLoading, router])

  // Carregar usuários
  const loadUsuarios = async () => {
    try {
      setLoading(true)
      const data = await ApiService.listarUsuarios()
      setUsuarios(data)
      setHasSearched(true)
    } catch (error) {
      toast({
        title: "Erro ao carregar usuários",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Buscar usuários por nome
  const searchUsuarios = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Digite um nome para buscar",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)
      const data = await ApiService.buscarUsuarioPorNome(searchTerm)
      setUsuarios(Array.isArray(data) ? data : [data])
      setHasSearched(true)
    } catch (error) {
      toast({
        title: "Erro na busca",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      })
      setUsuarios([])
    } finally {
      setLoading(false)
    }
  }

  // Criar usuário
  const handleCreateUsuario = async () => {
    if (!formData.nome.trim() || !formData.email.trim() || !formData.password.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome, email e senha",
        variant: "destructive"
      })
      return
    }

    // Validar role se fornecido
    if (formData.role && !['USER', 'ADMIN'].includes(formData.role)) {
      toast({
        title: "Role inválido",
        description: "O papel do usuário deve ser 'USER' ou 'ADMIN'",
        variant: "destructive"
      })
      return
    }

    try {
      const response = await ApiService.registrarUsuarioPorAdmin(formData)
      toast({
        title: "Usuário criado com sucesso!",
        description: `ID: ${response.usuario.id} - Criado em: ${new Date(response.usuario.createdAt).toLocaleString('pt-BR')}`
      })
      setShowCreateDialog(false)
      resetForm()
      loadUsuarios()
    } catch (error) {
      toast({
        title: "Erro ao criar usuário",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      })
    }
  }

  // Atualizar usuário
  const handleUpdateUsuario = async () => {
    if (!selectedUsuario?.id) return

    try {
      await ApiService.atualizarUsuario(selectedUsuario.id, editFormData)
      toast({
        title: "Usuário atualizado",
        description: "Usuário atualizado com sucesso!"
      })
      setShowEditDialog(false)
      resetEditForm()
      loadUsuarios()
    } catch (error) {
      toast({
        title: "Erro ao atualizar usuário",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      })
    }
  }

  // Excluir usuário
  const handleDeleteUsuario = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return

    try {
      await ApiService.excluirUsuario(id)
      toast({
        title: "Usuário excluído",
        description: "Usuário excluído com sucesso!"
      })
      loadUsuarios()
    } catch (error) {
      toast({
        title: "Erro ao excluir usuário",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setFormData({
      nome: "",
      email: "",
      password: "",
      role: "USER"
    })
    setSelectedUsuario(null)
  }

  const resetEditForm = () => {
    setEditFormData({
      nome: "",
      email: "",
      role: "USER"
    })
    setSelectedUsuario(null)
  }

  const openEditDialog = (usuario: Usuario) => {
    setSelectedUsuario(usuario)
    setEditFormData({
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role
    })
    setShowEditDialog(true)
  }

  const openViewDialog = (usuario: Usuario) => {
    setSelectedUsuario(usuario)
    setShowViewDialog(true)
  }

  const getRoleBadge = (role: string) => {
    const variants = {
      ADMIN: "destructive",
      USER: "default"
    } as const
    
    const labels = {
      ADMIN: "Administrador", 
      USER: "Usuário"
    } as const

    return (
      <Badge variant={variants[role as keyof typeof variants] || "default"}>
        {labels[role as keyof typeof labels] || role}
      </Badge>
    )
  }

  // Função para renderizar usuário como card mobile
  const renderUsuarioCard = (usuario: Usuario, index: number) => {
    const dataCriacao = (usuario.createdAt || usuario.dataCriacao)
      ? format(parseISO(usuario.createdAt || usuario.dataCriacao!), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
      : "-";

    const isAdmin = usuario.role === 'ADMIN';
    const roleLabel = isAdmin ? "Administrador" : "Usuário";

    const fields: CardField[] = [
      {
        label: "Email",
        value: usuario.email,
        className: "text-gray-700 break-all"
      },
      {
        label: "Tipo",
        value: roleLabel,
        isStatus: true,
        statusVariant: isAdmin ? "destructive" : "default"
      },
      {
        label: "Data de Criação",
        value: dataCriacao,
        className: "text-gray-600 text-sm"
      }
    ];

    const actions = [
      createDefaultActions.view(() => openViewDialog(usuario)),
      createDefaultActions.edit(() => openEditDialog(usuario)),
      createDefaultActions.delete(() => usuario.id && handleDeleteUsuario(usuario.id))
    ];

    return (
      <MobileDataCard
        key={usuario.id}
        title={usuario.nome}
        subtitle={`${roleLabel} • ${usuario.email}`}
        fields={fields}
        actions={actions}
        className="mb-4"
      />
    );
  };

  const filterUsuarios = async (roleParam?: 'ALL' | 'USER' | 'ADMIN') => {
    try {
      setLoading(true)
      const data = await ApiService.listarUsuarios()
      const effectiveRole = roleParam ?? filterRole
      const filteredData = effectiveRole !== 'ALL' ? data.filter(usuario => usuario.role === effectiveRole) : data
      setUsuarios(filteredData)
      setHasSearched(true)
    } catch (error) {
      toast({
        title: "Erro ao filtrar usuários",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Carregar usuários quando a página for acessada
    if (!authLoading && user && user.role === 'ADMIN') {
      loadUsuarios()
    }
  }, [authLoading, user])

  // Se não é admin, não renderizar nada (redirecionamento já foi feito)
  if (!authLoading && user && user.role !== 'ADMIN') {
    return null
  }

  return (
    <AuthenticatedLayout>
      {/* Verificação de carregamento */}
      {authLoading && (
        <div className="p-6 flex justify-center items-center">
          <div>Carregando...</div>
        </div>
      )}

      {/* Verificação de acesso negado para usuários não-admin */}
      {!authLoading && user && user.role !== 'ADMIN' && (
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <Shield className="mx-auto h-12 w-12 text-red-500" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Acesso Negado</h3>
              <p className="mt-1 text-sm text-gray-500">
                Você não tem permissão para acessar esta área.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo da página - acessível apenas para administradores */}
      {!authLoading && user && user.role === 'ADMIN' && (
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-white to-[#FFFDF0] p-6 rounded-2xl border border-[#FFD300]/20 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="p-3 bg-gradient-to-br from-[#FFD300] to-[#E6BD00] rounded-xl shadow-md">
                <Users className="h-8 w-8 text-[#0C0C0C]" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#0C0C0C] mb-1">Usuários</h1>
                <p className="text-gray-600 flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#FFD300] rounded-full"></span>
                  Gerencie os usuários do sistema
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Button 
                onClick={() => setShowCreateDialog(true)} 
                className="bg-gradient-to-r from-[#FFD300] to-[#E6BD00] text-[#0C0C0C] hover:from-[#E6BD00] hover:to-[#FFD300] shadow-md hover:shadow-lg transition-all duration-200 font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Usuário
              </Button>
            </div>
          </div>
        </div>

        {/* Card de Busca - simplificado */}
        <Card className="border-[#FFD300]/20 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="bg-gradient-to-r from-[#FFFDF0] to-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#FFD300]/20 rounded-lg">
                <Search className="h-5 w-5 text-[#0C0C0C]" />
              </div>
              <div>
                <CardTitle className="text-lg text-[#0C0C0C]">Buscar Usuários</CardTitle>
                <CardDescription className="text-gray-600">
                  Use os filtros para encontrar usuários específicos
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-end">
              {/* Campo de busca */}
              <div className="lg:col-span-5">
                <Label htmlFor="search" className="text-sm font-medium text-gray-700 mb-2 block">
                  Nome do Usuário
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Digite o nome do usuário..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11 border-gray-200 focus:border-[#FFD300] focus:ring-[#FFD300]/20 rounded-xl"
                    onKeyPress={(e) => e.key === 'Enter' && searchUsuarios()}
                  />
                </div>
              </div>
              
              {/* Botões de ação */}
              <div className="lg:col-span-7 flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-end">
                <Button
                  onClick={() => {
                    setHasSearched(true)
                    searchUsuarios()
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
                    setSearchTerm("")
                    setFilterRole('ALL')
                    loadUsuarios()
                  }}
                  disabled={loading}
                  variant="outline"
                  className="flex-1 h-11 border-[#FFD300]/50 hover:border-[#FFD300] hover:bg-[#FFFDF0] transition-all duration-200 rounded-xl"
                >
                  <Users className="w-4 h-4 mr-2 text-[#0C0C0C]" />
                  Todos
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card de Usuários - modificado */}
        <Card className="border-[#FFD300]/20 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-[#FFFDF0] to-white">
            <div className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#FFD300]/20 rounded-lg">
                  <Users className="h-5 w-5 text-[#0C0C0C]" />
                </div>
                <div>
                  <CardTitle className="text-lg text-[#0C0C0C]">
                    Usuários Encontrados ({usuarios.length})
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {usuarios.length === 1 ? 'usuário encontrado' : 'usuários no sistema'}
                  </CardDescription>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("")
                    setFilterRole('ALL')
                    loadUsuarios()
                  }}
                  className="border-[#FFD300]/50 hover:border-[#FFD300] hover:bg-[#FFFDF0] transition-all duration-200 rounded-xl"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {!hasSearched ? (
              <div className="py-16 px-6">
                <div className="text-center">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-[#FFD300]/20 to-[#FFD300]/10 rounded-full flex items-center justify-center mb-6">
                    <Search className="h-10 w-10 text-[#FFD300]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Use a busca ou os filtros</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Digite o nome do usuário ou use os filtros para visualizar usuários do sistema.
                  </p>
                  <Button
                    onClick={() => setShowCreateDialog(true)}
                    className="bg-gradient-to-r from-[#FFD300] to-[#E6BD00] text-[#0C0C0C] hover:from-[#E6BD00] hover:to-[#FFD300] shadow-md hover:shadow-lg transition-all duration-200 font-medium rounded-xl"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeiro Usuário
                  </Button>
                </div>
              </div>
            ) : loading ? (
              <div className="text-center py-8">Carregando usuários...</div>
            ) : usuarios.length === 0 ? (
              <div className="py-16 px-6">
                <div className="text-center">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-[#FFD300]/20 to-[#FFD300]/10 rounded-full flex items-center justify-center mb-6">
                    <Users className="h-10 w-10 text-[#FFD300]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum usuário encontrado</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Comece criando seu primeiro usuário no sistema.
                  </p>
                  <Button
                    onClick={() => setShowCreateDialog(true)}
                    className="bg-gradient-to-r from-[#FFD300] to-[#E6BD00] text-[#0C0C0C] hover:from-[#E6BD00] hover:to-[#FFD300] shadow-md hover:shadow-lg transition-all duration-200 font-medium rounded-xl"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Usuário
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Filtros Rápidos - Apenas quando há usuários */}
                {usuarios.length > 0 && (
                  <div className="space-y-4 px-6 pt-6 pb-4 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Filtros Rápidos</span>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 flex-1">
                        <div className="flex-1 min-w-0">
                          <Select
                            value={filterRole}
                            onValueChange={(value: 'ALL' | 'USER' | 'ADMIN') => {
                              setFilterRole(value)
                              filterUsuarios(value)
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Tipo de usuário" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ALL">Todos os tipos</SelectItem>
                              <SelectItem value="USER">Usuário</SelectItem>
                              <SelectItem value="ADMIN">Administrador</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tabela */}
                <div className="px-0 py-0">
                  {isMobile ? (
                    // Renderização mobile com cards
                    <div className="p-4 space-y-4">
                      {usuarios.map((usuario, index) => renderUsuarioCard(usuario, index))}
                    </div>
                  ) : (
                    // Renderização desktop com tabela
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-gray-50/50">
                          <TableRow className="hover:bg-gray-50/50">
                            <TableHead className="font-semibold text-gray-900 text-left min-w-[140px]">Nome</TableHead>
                            <TableHead className="font-semibold text-gray-900 text-left min-w-[120px] hidden md:table-cell">Email</TableHead>
                            <TableHead className="font-semibold text-gray-900 text-left min-w-[80px]">Tipo</TableHead>
                            <TableHead className="font-semibold text-gray-900 text-left min-w-[120px] hidden lg:table-cell">Data de Criação</TableHead>
                            <TableHead className="font-semibold text-gray-900 text-center min-w-[90px]">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {usuarios.map((usuario) => (
                            <TableRow key={usuario.id} className="border-b border-gray-100 hover:bg-gray-50/30 transition-colors">
                              <TableCell className="font-medium text-gray-900">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-gradient-to-br from-[#FFD300]/20 to-[#FFD300]/10 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-[#B8860B]" />
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900">{usuario.nome}</div>
                                    <div className="text-sm text-gray-500 md:hidden">{usuario.email}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-gray-600 hidden md:table-cell">{usuario.email}</TableCell>
                              <TableCell>
                                {getRoleBadge(usuario.role)}
                              </TableCell>
                              <TableCell className="text-gray-600 hidden lg:table-cell">
                                {(usuario.createdAt || usuario.dataCriacao)
                                  ? format(parseISO(usuario.createdAt || usuario.dataCriacao!), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                                  : "-"
                                }
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openViewDialog(usuario)}
                                    className="h-8 w-8 p-0 hover:bg-[#FFD300]/10"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openEditDialog(usuario)}
                                    className="h-8 w-8 p-0 hover:bg-[#FFD300]/10"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => usuario.id && handleDeleteUsuario(usuario.id)}
                                    className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Dialog para Criar Usuário */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl w-[95vw] sm:w-full border-[#FFD300]/20 shadow-xl rounded-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="bg-gradient-to-r from-[#FFFDF0] to-white p-4 sm:p-6 -m-4 sm:-m-6 mb-4 sm:mb-6 rounded-t-2xl border-b border-[#FFD300]/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#FFD300]/20 rounded-lg">
                  <Plus className="h-5 w-5 text-[#0C0C0C]" />
                </div>
                <div>
                  <DialogTitle className="text-xl text-[#0C0C0C]">Novo Usuário</DialogTitle>
                  <DialogDescription className="text-gray-600">
                    Cadastre um novo usuário no sistema
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome" className="text-sm font-medium text-gray-700 mb-2 block">Nome Completo *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  placeholder="Nome completo do usuário"
                  className="border-gray-200 focus:border-[#FFD300] focus:ring-[#FFD300]/20 rounded-xl"
                />
              </div>
              
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="email@exemplo.com"
                  className="border-gray-200 focus:border-[#FFD300] focus:ring-[#FFD300]/20 rounded-xl"
                />
              </div>
              
              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 mb-2 block">Senha *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Senha do usuário"
                  className="border-gray-200 focus:border-[#FFD300] focus:ring-[#FFD300]/20 rounded-xl"
                />
              </div>
              
              <div>
                <Label htmlFor="role" className="text-sm font-medium text-gray-700 mb-2 block">Tipo de Usuário</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: 'USER' | 'ADMIN') => setFormData({...formData, role: value})}
                >
                  <SelectTrigger className="border-gray-200 focus:border-[#FFD300] focus:ring-[#FFD300]/20 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">Usuário</SelectItem>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter className="flex-col sm:flex-row gap-3 bg-gray-50/50 p-4 sm:p-6 -m-4 sm:-m-6 mt-4 sm:mt-6 rounded-b-2xl border-t border-[#FFD300]/20">
              <Button 
                variant="outline" 
                onClick={() => setShowCreateDialog(false)}
                className="w-full sm:w-auto border-[#FFD300]/50 hover:border-[#FFD300] hover:bg-[#FFFDF0] transition-all duration-200 rounded-xl h-11"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateUsuario}
                disabled={!formData.nome.trim() || !formData.email.trim() || !formData.password.trim()}
                className="w-full sm:w-auto bg-gradient-to-r from-[#FFD300] to-[#E6BD00] text-[#0C0C0C] hover:from-[#E6BD00] hover:to-[#FFD300] shadow-md hover:shadow-lg transition-all duration-200 font-medium rounded-xl h-11"
              >
                Criar Usuário
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog para Editar Usuário */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl w-[95vw] sm:w-full border-[#FFD300]/20 shadow-xl rounded-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="bg-gradient-to-r from-[#FFFDF0] to-white p-4 sm:p-6 -m-4 sm:-m-6 mb-4 sm:mb-6 rounded-t-2xl border-b border-[#FFD300]/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#FFD300]/20 rounded-lg">
                  <Edit className="h-5 w-5 text-[#0C0C0C]" />
                </div>
                <div>
                  <DialogTitle className="text-xl text-[#0C0C0C]">Editar Usuário</DialogTitle>
                  <DialogDescription className="text-gray-600">
                    Altere as informações do usuário
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-nome" className="text-sm font-medium text-gray-700 mb-2 block">Nome Completo *</Label>
                <Input
                  id="edit-nome"
                  value={editFormData.nome}
                  onChange={(e) => setEditFormData({...editFormData, nome: e.target.value})}
                  placeholder="Nome completo do usuário"
                  className="border-gray-200 focus:border-[#FFD300] focus:ring-[#FFD300]/20 rounded-xl"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-email" className="text-sm font-medium text-gray-700 mb-2 block">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                  placeholder="email@exemplo.com"
                  className="border-gray-200 focus:border-[#FFD300] focus:ring-[#FFD300]/20 rounded-xl"
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="edit-role" className="text-sm font-medium text-gray-700 mb-2 block">Tipo de Usuário</Label>
                <Select
                  value={editFormData.role}
                  onValueChange={(value: 'USER' | 'ADMIN') => setEditFormData({...editFormData, role: value})}
                >
                  <SelectTrigger className="border-gray-200 focus:border-[#FFD300] focus:ring-[#FFD300]/20 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">Usuário</SelectItem>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter className="flex-col sm:flex-row gap-3 bg-gray-50/50 p-4 sm:p-6 -m-4 sm:-m-6 mt-4 sm:mt-6 rounded-b-2xl border-t border-[#FFD300]/20">
              <Button 
                variant="outline" 
                onClick={() => setShowEditDialog(false)}
                className="w-full sm:w-auto border-[#FFD300]/50 hover:border-[#FFD300] hover:bg-[#FFFDF0] transition-all duration-200 rounded-xl h-11"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleUpdateUsuario}
                disabled={!editFormData.nome.trim() || !editFormData.email.trim()}
                className="w-full sm:w-auto bg-gradient-to-r from-[#FFD300] to-[#E6BD00] text-[#0C0C0C] hover:from-[#E6BD00] hover:to-[#FFD300] shadow-md hover:shadow-lg transition-all duration-200 font-medium rounded-xl h-11"
              >
                Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog para Visualizar Usuário */}
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="max-w-2xl w-[95vw] sm:w-full border-[#FFD300]/20 shadow-xl rounded-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="bg-gradient-to-r from-[#FFFDF0] to-white p-4 sm:p-6 -m-4 sm:-m-6 mb-4 sm:mb-6 rounded-t-2xl border-b border-[#FFD300]/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#FFD300]/20 rounded-lg">
                  <Eye className="h-5 w-5 text-[#0C0C0C]" />
                </div>
                <div>
                  <DialogTitle className="text-xl text-[#0C0C0C]">Detalhes do Usuário</DialogTitle>
                </div>
              </div>
            </DialogHeader>
            
            {selectedUsuario && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-4 bg-gradient-to-r from-gray-50 to-white border-gray-200/50 rounded-xl">
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Nome</Label>
                    <p className="text-lg font-semibold text-gray-900">{selectedUsuario.nome}</p>
                  </Card>
                  
                  <Card className="p-4 bg-gradient-to-r from-gray-50 to-white border-gray-200/50 rounded-xl">
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Email</Label>
                    <p className="text-lg font-semibold text-gray-900">{selectedUsuario.email}</p>
                  </Card>
                  
                  <Card className="p-4 bg-gradient-to-r from-gray-50 to-white border-gray-200/50 rounded-xl">
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Tipo de Usuário</Label>
                    <div className="mt-2">
                      {getRoleBadge(selectedUsuario.role)}
                    </div>
                  </Card>
                  
                  {(selectedUsuario.createdAt || selectedUsuario.dataCriacao) && (
                    <Card className="p-4 bg-gradient-to-r from-gray-50 to-white border-gray-200/50 rounded-xl">
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">Data de Criação</Label>
                      <p className="text-lg font-semibold text-gray-900">
                        {format(parseISO(selectedUsuario.createdAt || selectedUsuario.dataCriacao!), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </Card>
                  )}
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowViewDialog(false)}
                className="w-full sm:w-auto border-[#FFD300]/50 hover:border-[#FFD300] hover:bg-[#FFFDF0] transition-all duration-200 rounded-xl"
              >
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      )}
    </AuthenticatedLayout>
  )
}
