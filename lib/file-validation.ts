import * as XLSX from 'xlsx'

// Utilitário para validação de arquivos de importação
export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = () => reject(reader.error)
    reader.readAsArrayBuffer(file)
  })
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}

// Função para extrair headers de um arquivo
export async function extractFileHeaders(file: File): Promise<string[]> {
  const extension = file.name.toLowerCase().split('.').pop()
  
  if (extension === 'csv') {
    const text = await readFileAsText(file)
    const lines = text.split('\n')
    if (lines.length === 0) return []
    
    // Pega a primeira linha e divide por vírgula ou ponto-e-vírgula
    const headers = lines[0].split(/[,;]/).map(h => h.trim().replace(/"/g, ''))
    return headers
  } 
  
  if (extension === 'xlsx' || extension === 'xls') {
    const buffer = await readFileAsArrayBuffer(file)
    const workbook = XLSX.read(buffer, { type: 'array' })
    const firstSheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[firstSheetName]
    
    // Converte para JSON para pegar os headers
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
    if (jsonData.length === 0) return []
    
    const headers = (jsonData[0] as string[]) || []
    return headers.map(h => String(h).trim())
  }
  
  return []
}

// Headers esperados para cada tipo de importação
export const EXPECTED_HEADERS = {
  produtos: [
    'nome',
    'categoria', 
    'preco',
    'custo',
    'descricao',
    'quantidade'
  ],
  movimentacoes: [
    'nome',
    'produto',
    'quantidade',
    'data',
    'tipo'
  ]
} as const

export function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
}

export function validateFileHeaders(headers: string[], expectedType: 'produtos' | 'movimentacoes'): {
  isValid: boolean
  matchedHeaders: string[]
  missingHeaders: string[]
  confidence: number
  detectedType: 'produtos' | 'movimentacoes' | 'unknown'
} {
  const normalizedHeaders = headers.map(normalizeHeader)
  
  // Mapeamento mais flexível de headers para movimentações
  const movimentacaoMappings = {
    produto: ['nome', 'produto', 'nomedoproduto', 'nomeproduto'],
    quantidade: ['quantidade', 'qtd', 'qtde'],
    data: ['data', 'dataoperacao', 'datamovimento'],
    tipo: ['tipo', 'tipomovimentacao', 'tipooperacao', 'operacao']
  }
  
  // Mapeamento mais flexível de headers para produtos
  const produtoMappings = {
    nome: ['nome', 'produto', 'nomeproduto'],
    categoria: ['categoria', 'cat'],
    preco: ['preco', 'valor', 'price', 'valorunitario'],
    custo: ['custo', 'custounitario'],
    descricao: ['descricao', 'desc', 'description'],
    quantidade: ['quantidade', 'qtd', 'qtde', 'estoque']
  }
  
  const checkHeaderMatch = (expectedHeader: string, mappings: Record<string, string[]>) => {
    const variations = mappings[expectedHeader] || [expectedHeader]
    return normalizedHeaders.some(header => 
      variations.some(variation => 
        header.includes(variation) || variation.includes(header)
      )
    )
  }
  
  // Calcular score para cada tipo
  const produtosScore = Object.keys(produtoMappings).reduce((score, expected) => {
    return checkHeaderMatch(expected, produtoMappings) ? score + 1 : score
  }, 0)
  
  const movimentacoesScore = Object.keys(movimentacaoMappings).reduce((score, expected) => {
    return checkHeaderMatch(expected, movimentacaoMappings) ? score + 1 : score
  }, 0)
  
  const detectedType: 'produtos' | 'movimentacoes' | 'unknown' = 
    produtosScore > movimentacoesScore ? 'produtos' :
    movimentacoesScore > produtosScore ? 'movimentacoes' : 'unknown'
  
  // Usar o mapeamento correto baseado no tipo esperado
  const mappings = expectedType === 'produtos' ? produtoMappings : movimentacaoMappings
  const expectedHeaders = Object.keys(mappings)
  
  const matchedHeaders = expectedHeaders.filter(expected => 
    checkHeaderMatch(expected, mappings)
  )
  
  const missingHeaders = expectedHeaders.filter(expected => 
    !checkHeaderMatch(expected, mappings)
  )
  
  const confidence = matchedHeaders.length / expectedHeaders.length
  
  return {
    isValid: confidence >= 0.6 && detectedType === expectedType, // Aumentei para 60% para maior precisão
    matchedHeaders,
    missingHeaders,
    confidence,
    detectedType
  }
}

// Função principal para validar arquivo
export async function validateImportFile(
  file: File, 
  expectedType: 'produtos' | 'movimentacoes'
): Promise<{
  isValid: boolean
  error?: string
  detectedType?: 'produtos' | 'movimentacoes' | 'unknown'
  confidence?: number
  suggestions?: string[]
}> {
  try {
    const headers = await extractFileHeaders(file)
    
    if (headers.length === 0) {
      return {
        isValid: false,
        error: 'Arquivo vazio ou sem headers válidos'
      }
    }
    
    const validation = validateFileHeaders(headers, expectedType)
    
    if (!validation.isValid) {
      let errorMessage = ''
      let suggestions: string[] = []
      
      if (validation.detectedType !== expectedType && validation.detectedType !== 'unknown') {
        errorMessage = `Este arquivo parece ser de ${validation.detectedType === 'produtos' ? 'produtos' : 'movimentações'}, mas você selecionou importação de ${expectedType === 'produtos' ? 'produtos' : 'movimentações'}.`
        suggestions.push(`Altere o tipo de importação para "${validation.detectedType === 'produtos' ? 'produtos' : 'movimentações'}"`)
        suggestions.push('Ou verifique se o arquivo está correto')
      } else if (validation.confidence < 0.4) {
        errorMessage = `O arquivo não parece ter a estrutura correta para importação de ${expectedType}.`
        suggestions.push('Verifique se os headers estão corretos')
        suggestions.push('Use o template fornecido como referência')
      }
      
      return {
        isValid: false,
        error: errorMessage,
        detectedType: validation.detectedType,
        confidence: validation.confidence,
        suggestions
      }
    }
    
    return {
      isValid: true,
      detectedType: validation.detectedType,
      confidence: validation.confidence
    }
    
  } catch (error) {
    return {
      isValid: false,
      error: `Erro ao ler arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    }
  }
}
