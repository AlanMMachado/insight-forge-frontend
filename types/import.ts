export interface ProdutoNaoEncontrado {
  nomeProduto: string
  linha: number
  quantidadeMovimentada: number
  dataMovimentacao: string
  tipoMovimentacao: string // Mais flexível para aceitar "Compra"/"Venda" e "COMPRA"/"VENDA"
}

export interface ImportMovimentacoesResponse {
  movimentacoesImportadas: number
  movimentacoesIgnoradas: number
  mensagem: string
  produtosNaoEncontrados: ProdutoNaoEncontrado[]
}

export interface ImportProdutosResponse {
  produtosImportados: number
  mensagem: string
}

export type ImportResponse = ImportMovimentacoesResponse | ImportProdutosResponse

export interface ImportResult {
  success: boolean
  isPartialSuccess?: boolean
  data?: ImportResponse
  error?: string
}

export interface ProdutoParaCadastro {
  nome: string
  categoria?: string
  preco?: number
  custo?: number
  descricao?: string
  quantidadeInicial?: number
}

export type ImportStatus = 'idle' | 'uploading' | 'success' | 'partial' | 'error'
