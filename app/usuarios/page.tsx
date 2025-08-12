"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Users, Search, Eye, Edit, Trash2, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ApiService, Usuario } from "@/lib/api"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import AuthenticatedLayout from "@/components/authenticated-layout"

export default function UsuariosPage() {
  const { toast } = useToast()
  const { user, isLoading: authLoading } = useAuth()
  
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
        description: `ID: ${response.id} - Criado em: ${new Date(response.createdAt).toLocaleString('pt-BR')}`
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

  const filterUsuarios = async () => {
    try {
      setLoading(true)
      const data = await ApiService.listarUsuarios()
      const filteredData = filterRole !== 'ALL' ? data.filter(usuario => usuario.role === filterRole) : data
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
    if (!authLoading) {
      loadUsuarios()
    }
  }, [authLoading])

  return (
    <AuthenticatedLayout>
      {/* Verificação de carregamento */}
      {authLoading && (
        <div className="p-6 flex justify-center items-center">
          <div>Carregando...</div>
        </div>
      )}

      {/* Conteúdo da página - acessível para todos os usuários autenticados */}
      {!authLoading && (
        <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Users className="h-6 w-6 mr-2 text-[#FFD300]" />
            <div>
              <h1 className="text-3xl font-bold text-[#000000]">Gerenciar Usuários</h1>
              <p className="text-[#9A9A9A] mt-2">Gerencie os usuários do sistema</p>
            </div>
          </div>
          
          <Button onClick={() => setShowCreateDialog(true)} className="bg-[#FFD300] text-[#0C0C0C] hover:bg-[#E6BD00]">
            <Plus className="w-4 h-4 mr-2" />
            Novo Usuário
          </Button>
        </div>

        {/* Controles de Busca */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Buscar Usuários</CardTitle>
            <CardDescription>Use os filtros abaixo para encontrar usuários específicos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
              {/* Campo de busca por nome */}
              <div className="lg:col-span-8">
                <Label htmlFor="search">Nome do Usuário</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Digite o nome do usuário..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 h-10"
                    onKeyPress={(e) => e.key === 'Enter' && searchUsuarios()}
                  />
                </div>
              </div>
              
              {/* Filtro por tipo de usuário */}
              <div className="lg:col-span-4">
                <Label htmlFor="filter-role">Tipo de Usuário</Label>
                <Select
                  value={filterRole}
                  onValueChange={(value: 'ALL' | 'USER' | 'ADMIN') => setFilterRole(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos</SelectItem>
                    <SelectItem value="USER">Usuário</SelectItem>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Botões de ação */}
              <div className="lg:col-span-4 flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
                <Button
                  onClick={() => {
                    setHasSearched(true)
                    searchUsuarios()
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
                    setSearchTerm("")
                    loadUsuarios()
                  }}
                  disabled={loading}
                  variant="outline"
                  className="flex-1 h-10"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Todos
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Usuários */}
        <Card>
          <CardHeader>
            <CardTitle>Usuários ({usuarios.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {!hasSearched ? (
              <div className="text-center py-8">
                <Search className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Use a busca para visualizar usuários</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Digite o nome do usuário ou clique em "Todos" para listar todos.
                </p>
              </div>
            ) : loading ? (
              <div className="text-center py-8">Carregando usuários...</div>
            ) : usuarios.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum usuário encontrado</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Tente ajustar os filtros ou criar um novo usuário.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Data de Criação</TableHead>
                      <TableHead className="text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usuarios.map((usuario) => (
                      <TableRow key={usuario.id}>
                        <TableCell>
                          <div className="font-medium">{usuario.nome}</div>
                        </TableCell>
                        <TableCell>
                          {usuario.email}
                        </TableCell>
                        <TableCell>
                          {getRoleBadge(usuario.role)}
                        </TableCell>
                        <TableCell>
                          {(usuario.createdAt || usuario.dataCriacao)
                            ? format(parseISO(usuario.createdAt || usuario.dataCriacao!), "dd/MM/yyyy", { locale: ptBR })
                            : "-"
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openViewDialog(usuario)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(usuario)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => usuario.id && handleDeleteUsuario(usuario.id)}
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
            )}
          </CardContent>
        </Card>

        {/* Dialog para Criar Usuário */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Novo Usuário</DialogTitle>
              <DialogDescription>
                Cadastre um novo usuário no sistema
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  placeholder="Nome completo do usuário"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="email@exemplo.com"
                />
              </div>
              
              <div>
                <Label htmlFor="password">Senha *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Senha do usuário"
                />
              </div>
              
              <div>
                <Label htmlFor="role">Tipo de Usuário</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: 'USER' | 'ADMIN') => setFormData({...formData, role: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">Usuário</SelectItem>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateUsuario}
                disabled={!formData.nome.trim() || !formData.email.trim() || !formData.password.trim()}
                className="bg-[#FFD300] text-[#0C0C0C] hover:bg-[#E6BD00]"
              >
                Criar Usuário
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog para Editar Usuário */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Usuário</DialogTitle>
              <DialogDescription>
                Altere as informações do usuário
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-nome">Nome Completo *</Label>
                <Input
                  id="edit-nome"
                  value={editFormData.nome}
                  onChange={(e) => setEditFormData({...editFormData, nome: e.target.value})}
                  placeholder="Nome completo do usuário"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                  placeholder="email@exemplo.com"
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="edit-role">Tipo de Usuário</Label>
                <Select
                  value={editFormData.role}
                  onValueChange={(value: 'USER' | 'ADMIN') => setEditFormData({...editFormData, role: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">Usuário</SelectItem>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleUpdateUsuario}
                disabled={!editFormData.nome.trim() || !editFormData.email.trim()}
                className="bg-[#FFD300] text-[#0C0C0C] hover:bg-[#E6BD00]"
              >
                Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog para Visualizar Usuário */}
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes do Usuário</DialogTitle>
            </DialogHeader>
            
            {selectedUsuario && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Nome</Label>
                    <p className="text-sm text-gray-900">{selectedUsuario.nome}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Email</Label>
                    <p className="text-sm text-gray-900">{selectedUsuario.email}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Tipo de Usuário</Label>
                    <div className="mt-1">
                      {getRoleBadge(selectedUsuario.role)}
                    </div>
                  </div>
                  
                  {(selectedUsuario.createdAt || selectedUsuario.dataCriacao) && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Data de Criação</Label>
                      <p className="text-sm text-gray-900">
                        {format(parseISO(selectedUsuario.createdAt || selectedUsuario.dataCriacao!), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  )}
                </div>
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
      )}
    </AuthenticatedLayout>
  )
}
