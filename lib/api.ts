// Configuração da API
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

// Endpoints de produtos
export const PRODUTOS_ENDPOINTS = {
  importar: '/api/produtos/importarProdutos',
  exportar: '/api/produtos/exportarProdutos',
  listar: '/api/produtos/listarProdutos',
  criar: '/api/produtos/criarProduto',
  buscarPorId: '/api/produtos/buscarProdutoPorId',
  buscarPorCategoria: '/api/produtos/buscarProdutoPorCategoria',
  buscarPorNome: '/api/produtos/buscarProdutoPorNome',
  buscarAtivos: '/api/produtos/buscarProdutosAtivos',
  atualizar: '/api/produtos/atualizarProduto',
  deletar: '/api/produtos/deletarProduto',
} as const

// Endpoints de movimentações
export const MOVIMENTACOES_ENDPOINTS = {
  importar: '/api/movimentacoes/importarMovimentacoes',
  exportarPorProduto: '/api/movimentacoes/exportarMovimentacoesPorProduto',
  exportarPorTipo: '/api/movimentacoes/exportarMovimentacoesPorTipo',
  exportarPorData: '/api/movimentacoes/exportarMovimentacoesPorData',
  listar: '/api/movimentacoes/listarMovimentacoes',
  criar: '/api/movimentacoes/criarMovimentacao',
  buscarPorId: '/api/movimentacoes/buscarPorId',
  filtrarPorTipo: '/api/movimentacoes/filtrarPorTipo',
  filtrarPorData: '/api/movimentacoes/filtrarPorData',
  filtrarPorProduto: '/api/movimentacoes/filtrarPorProduto',
  atualizar: '/api/movimentacoes/atualizarMovimentacao',
  deletar: '/api/movimentacoes/deletarMovimentacao',
} as const

// Tipos para as entidades
export interface Produto {
  id?: number
  nome: string
  categoria?: string
  preco?: number
  quantidadeEstoque?: number
  ativo?: boolean
  descricao?: string
  dataCriacao?: string
  dataAtualizacao?: string
}

export interface Movimentacao {
  id?: number
  produto: {
    id: number
  }
  tipoMovimentacao: 'COMPRA' | 'VENDA'
  quantidadeMovimentada: number
  dataMovimentacao: string
  motivo?: string
  observacoes?: string
  dataCriacao?: string
}

// Funções de API
export class ApiService {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || `HTTP error! status: ${response.status}`)
    }

    // Para respostas de texto simples
    if (response.headers.get('content-type')?.includes('text/plain')) {
      return (await response.text()) as T
    }

    // Para respostas JSON
    if (response.headers.get('content-type')?.includes('application/json')) {
      return await response.json()
    }

    // Para arquivos binários
    return response as T
  }

  // Produtos
  static async importarProdutos(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE_URL}${PRODUTOS_ENDPOINTS.importar}`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText)
    }

    return await response.text()
  }

  static async exportarProdutos(): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}${PRODUTOS_ENDPOINTS.exportar}`)
    
    if (!response.ok) {
      throw new Error('Erro ao exportar produtos')
    }

    return await response.blob()
  }

  static async listarProdutos(): Promise<Produto[]> {
    return this.request<Produto[]>(PRODUTOS_ENDPOINTS.listar)
  }

  static async criarProduto(produto: Produto): Promise<Produto> {
    return this.request<Produto>(PRODUTOS_ENDPOINTS.criar, {
      method: 'POST',
      body: JSON.stringify(produto),
    })
  }

  static async buscarProdutoPorId(id: number): Promise<Produto> {
    return this.request<Produto>(`${PRODUTOS_ENDPOINTS.buscarPorId}/${id}`)
  }

  static async buscarProdutoPorCategoria(categoria: string): Promise<Produto[]> {
    return this.request<Produto[]>(`${PRODUTOS_ENDPOINTS.buscarPorCategoria}/${categoria}?categoria=${categoria}`)
  }

  static async buscarProdutoPorNome(nome: string): Promise<Produto[]> {
    return this.request<Produto[]>(`${PRODUTOS_ENDPOINTS.buscarPorNome}/${nome}?nome=${nome}`)
  }

  static async buscarProdutosAtivos(ativo: boolean): Promise<Produto[]> {
    return this.request<Produto[]>(`${PRODUTOS_ENDPOINTS.buscarAtivos}?ativo=${ativo}`)
  }

  static async atualizarProduto(id: number, produto: Produto): Promise<Produto> {
    return this.request<Produto>(`${PRODUTOS_ENDPOINTS.atualizar}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(produto),
    })
  }

  static async deletarProduto(id: number): Promise<void> {
    return this.request<void>(`${PRODUTOS_ENDPOINTS.deletar}/${id}`, {
      method: 'DELETE',
    })
  }

  // Movimentações
  static async importarMovimentacoes(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE_URL}${MOVIMENTACOES_ENDPOINTS.importar}`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText)
    }

    return await response.text()
  }

  static async exportarMovimentacoesPorProduto(produtoId: number): Promise<Blob> {
    const response = await fetch(
      `${API_BASE_URL}${MOVIMENTACOES_ENDPOINTS.exportarPorProduto}?produtoId=${produtoId}`
    )
    
    if (!response.ok) {
      throw new Error('Erro ao exportar movimentações por produto')
    }

    return await response.blob()
  }

  static async exportarMovimentacoesPorTipo(tipo: 'COMPRA' | 'VENDA'): Promise<Blob> {
    const response = await fetch(
      `${API_BASE_URL}${MOVIMENTACOES_ENDPOINTS.exportarPorTipo}?tipo=${tipo}`
    )
    
    if (!response.ok) {
      throw new Error('Erro ao exportar movimentações por tipo')
    }

    return await response.blob()
  }

  static async exportarMovimentacoesPorData(dataInicio: string, dataFim: string): Promise<Blob> {
    const response = await fetch(
      `${API_BASE_URL}${MOVIMENTACOES_ENDPOINTS.exportarPorData}?dataInicio=${dataInicio}&dataFim=${dataFim}`
    )
    
    if (!response.ok) {
      throw new Error('Erro ao exportar movimentações por data')
    }

    return await response.blob()

    return await response.blob()
  }

  static async listarMovimentacoes(): Promise<Movimentacao[]> {
    return this.request<Movimentacao[]>(MOVIMENTACOES_ENDPOINTS.listar)
  }

  static async criarMovimentacao(movimentacao: Movimentacao): Promise<Movimentacao> {
    return this.request<Movimentacao>(MOVIMENTACOES_ENDPOINTS.criar, {
      method: 'POST',
      body: JSON.stringify(movimentacao),
    })
  }

  static async buscarMovimentacaoPorId(id: number): Promise<Movimentacao> {
    return this.request<Movimentacao>(`${MOVIMENTACOES_ENDPOINTS.buscarPorId}/${id}`)
  }

  static async filtrarPorTipo(tipo: 'COMPRA' | 'VENDA'): Promise<Movimentacao[]> {
    return this.request<Movimentacao[]>(`${MOVIMENTACOES_ENDPOINTS.filtrarPorTipo}?tipo=${tipo}`)
  }

  static async filtrarPorData(dataInicio: string, dataFim: string): Promise<Movimentacao[]> {
    return this.request<Movimentacao[]>(
      `${MOVIMENTACOES_ENDPOINTS.filtrarPorData}?dataInicio=${dataInicio}&dataFim=${dataFim}`
    )
  }

  static async filtrarPorProduto(produtoId: number): Promise<Movimentacao[]> {
    return this.request<Movimentacao[]>(
      `${MOVIMENTACOES_ENDPOINTS.filtrarPorProduto}?produtoId=${produtoId}`
    )
  }

  static async atualizarMovimentacao(id: number, movimentacao: Movimentacao): Promise<Movimentacao> {
    return this.request<Movimentacao>(`${MOVIMENTACOES_ENDPOINTS.atualizar}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(movimentacao),
    })
  }

  static async deletarMovimentacao(id: number): Promise<void> {
    return this.request<void>(`${MOVIMENTACOES_ENDPOINTS.deletar}/${id}`, {
      method: 'DELETE',
    })
  }
}
