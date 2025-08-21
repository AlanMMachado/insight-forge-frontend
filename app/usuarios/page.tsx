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
import { Users, Search, Eye, Edit, Trash2, Plus, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ApiService, Usuario } from "@/lib/api"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import AuthenticatedLayout from "@/components/authenticated-layout"

export default function UsuariosPage() {
  const { toast } = useToast()
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  
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
        <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-white to-[#FFFDF0] p-6 rounded-2xl border border-[#FFD300]/20 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-[#FFD300] to-[#E6BD00] rounded-xl shadow-md">
                <Users className="h-8 w-8 text-[#0C0C0C]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#0C0C0C] mb-1">Usuários</h1>
                <p className="text-gray-600 flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#FFD300] rounded-full"></span>
                  Gerencie os usuários do sistema
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
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

        {/* Controles de Busca */}
        <Card className="border-[#FFD300]/20 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="bg-gradient-to-r from-[#FFFDF0] to-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#FFD300]/20 rounded-lg">
                <Search className="h-5 w-5 text-[#0C0C0C]" />
              </div>
              <div>
                <CardTitle className="text-lg text-[#0C0C0C]">Buscar Usuários</CardTitle>
                <CardDescription className="text-gray-600">
                  Use os filtros abaixo para encontrar usuários específicos
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 items-end">
              {/* Campo de busca por nome */}
              <div className="flex-1 max-w-xs">
                <Label htmlFor="search" className="text-sm font-medium text-gray-700 mb-2 block">Nome do Usuário</Label>
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
              
              {/* Botão de buscar */}
              <Button
                onClick={() => {
                  setHasSearched(true)
                  searchUsuarios()
                }}
                disabled={!searchTerm.trim() || loading}
                className="bg-gradient-to-r from-[#FFD300] to-[#E6BD00] text-[#0C0C0C] hover:from-[#E6BD00] hover:to-[#FFD300] shadow-md hover:shadow-lg transition-all duration-200 font-medium h-11 rounded-xl"
              >
                <Search className="w-4 h-4 mr-2" />
                {loading ? 'Buscando...' : 'Buscar'}
              </Button>
              {/* Botão de listar todos, posicionado à direita do Buscar */}
              <Button
                onClick={() => {
                  setHasSearched(true)
                  setSearchTerm("")
                  setFilterRole('ALL')
                  loadUsuarios()
                }}
                disabled={loading}
                variant="outline"
                className="h-11 border-[#FFD300]/50 hover:border-[#FFD300] hover:bg-[#FFFDF0] transition-all duration-200 rounded-xl shadow-sm hover:shadow-md"
              >
                <Users className="w-4 h-4 mr-2 text-[#0C0C0C]" />
                Todos os Usuários
              </Button>
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
              <div className="flex items-center gap-3">
                {/* Filtro por tipo de usuário */}
                <div className="w-48">
                  <Label htmlFor="filter-role" className="text-sm text-gray-700 mb-1 block">Filtrar por tipo</Label>
                  <Select
                    value={filterRole}
                    onValueChange={(value: 'ALL' | 'USER' | 'ADMIN') => {
                      setFilterRole(value)
                      filterUsuarios(value)
                    }}
                  >
                    <SelectTrigger className="h-9 border-gray-200 focus:border-[#FFD300] focus:ring-[#FFD300]/20 rounded-xl">
                      <SelectValue placeholder="Selecione um tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todos</SelectItem>
                      <SelectItem value="USER">Usuário</SelectItem>
                      <SelectItem value="ADMIN">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Use a busca para visualizar usuários</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Digite o nome do usuário ou clique em "Todos os Usuários" para listar todos.
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
              <div className="py-16">
                <div className="text-center">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-[#FFD300]/20 to-[#FFD300]/10 rounded-full flex items-center justify-center mb-6">
                    <Users className="h-10 w-10 text-[#FFD300]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum usuário encontrado</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Tente ajustar os filtros ou criar um novo usuário.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      onClick={() => setShowCreateDialog(true)}
                      className="bg-gradient-to-r from-[#FFD300] to-[#E6BD00] text-[#0C0C0C] hover:from-[#E6BD00] hover:to-[#FFD300] shadow-md hover:shadow-lg transition-all duration-200 font-medium rounded-xl"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Usuário
                    </Button>
                    <Button
                      onClick={() => {
                        setSearchTerm("")
                        setFilterRole('ALL')
                        loadUsuarios()
                      }}
                      variant="outline"
                      className="border-[#FFD300]/50 hover:border-[#FFD300] hover:bg-[#FFFDF0] transition-all duration-200 rounded-xl"
                    >
                      <Users className="w-4 h-4 mr-2 text-[#0C0C0C]" />
                      Limpar Filtros
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50 border-b-2 border-[#FFD300]/20">
                      <TableHead className="font-semibold text-gray-700">Nome</TableHead>
                      <TableHead className="font-semibold text-gray-700">Email</TableHead>
                      <TableHead className="font-semibold text-gray-700">Tipo</TableHead>
                      <TableHead className="font-semibold text-gray-700">Data de Criação</TableHead>
                      <TableHead className="text-center font-semibold text-gray-700">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usuarios.map((usuario, index) => (
                      <TableRow 
                        key={usuario.id}
                        className={`hover:bg-[#FFFDF0] transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                        }`}
                      >
                        <TableCell>
                          <div className="font-medium text-gray-900">{usuario.nome}</div>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-700">{usuario.email}</span>
                        </TableCell>
                        <TableCell>
                          {getRoleBadge(usuario.role)}
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-700">
                            {(usuario.createdAt || usuario.dataCriacao)
                              ? format(parseISO(usuario.createdAt || usuario.dataCriacao!), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                              : "-"
                            }
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openViewDialog(usuario)}
                              className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600 transition-colors rounded-lg"
                              title="Visualizar"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(usuario)}
                              className="h-8 w-8 p-0 hover:bg-yellow-100 hover:text-yellow-600 transition-colors rounded-lg"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => usuario.id && handleDeleteUsuario(usuario.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors rounded-lg"
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
            )}
          </CardContent>
        </Card>

        {/* Dialog para Criar Usuário */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl border-[#FFD300]/20 shadow-xl rounded-2xl">
            <DialogHeader className="bg-gradient-to-r from-[#FFFDF0] to-white p-6 -m-6 mb-6 rounded-t-2xl border-b border-[#FFD300]/20">
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
            
            <DialogFooter className="gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowCreateDialog(false)}
                className="border-[#FFD300]/50 hover:border-[#FFD300] hover:bg-[#FFFDF0] transition-all duration-200 rounded-xl"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateUsuario}
                disabled={!formData.nome.trim() || !formData.email.trim() || !formData.password.trim()}
                className="bg-gradient-to-r from-[#FFD300] to-[#E6BD00] text-[#0C0C0C] hover:from-[#E6BD00] hover:to-[#FFD300] shadow-md hover:shadow-lg transition-all duration-200 font-medium rounded-xl"
              >
                Criar Usuário
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog para Editar Usuário */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl border-[#FFD300]/20 shadow-xl rounded-2xl">
            <DialogHeader className="bg-gradient-to-r from-[#FFFDF0] to-white p-6 -m-6 mb-6 rounded-t-2xl border-b border-[#FFD300]/20">
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
            
            <DialogFooter className="gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowEditDialog(false)}
                className="border-[#FFD300]/50 hover:border-[#FFD300] hover:bg-[#FFFDF0] transition-all duration-200 rounded-xl"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleUpdateUsuario}
                disabled={!editFormData.nome.trim() || !editFormData.email.trim()}
                className="bg-gradient-to-r from-[#FFD300] to-[#E6BD00] text-[#0C0C0C] hover:from-[#E6BD00] hover:to-[#FFD300] shadow-md hover:shadow-lg transition-all duration-200 font-medium rounded-xl"
              >
                Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog para Visualizar Usuário */}
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="max-w-2xl border-[#FFD300]/20 shadow-xl rounded-2xl">
            <DialogHeader className="bg-gradient-to-r from-[#FFFDF0] to-white p-6 -m-6 mb-6 rounded-t-2xl border-b border-[#FFD300]/20">
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
                className="border-[#FFD300]/50 hover:border-[#FFD300] hover:bg-[#FFFDF0] transition-all duration-200 rounded-xl"
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
