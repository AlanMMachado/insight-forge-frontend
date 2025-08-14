import * as XLSX from 'xlsx'

// Utilitário para criar arquivos Excel template
export function createProdutosTemplate(): Blob {
  // Dados de exemplo para o template de produtos
  const data = [
    ['Nome', 'Preço', 'Custo', 'Descrição', 'Categoria', 'Quantidade Estoque'],
    ['Smartphone XYZ', 899.99, 799.99, 'Smartphone com 128GB de armazenamento', 'Eletrônicos', 50],
    ['Camiseta Básica', 29.90, 19.90, 'Camiseta 100% algodão tamanho M', 'Roupas', 120],
    ['Livro de Programação', 45.50, 35.50, 'Guia completo para desenvolvedores', 'Livros', 25],
    ['Notebook Gamer', 2499.99, 1999.99, 'Notebook para jogos com placa de vídeo dedicada', 'Eletrônicos', 10],
  ]

  // Criar worksheet
  const ws = XLSX.utils.aoa_to_sheet(data)
  
  // Definir larguras das colunas
  ws['!cols'] = [
    { wch: 30 }, // Nome
    { wch: 15 }, // Preço
    { wch: 15 }, // Custo
    { wch: 50 }, // Descrição
    { wch: 20 }, // Categoria
    { wch: 18 }  // Quantidade Estoque
  ]

  // Adicionar autofilter na primeira linha (cabeçalho)
  ws['!autofilter'] = { ref: 'A1:E1' }

  // Criar workbook
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Produtos')

  // Gerar arquivo Excel
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  
  return new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  })
}

export function createMovimentacoesTemplate(): Blob {
  // Dados de exemplo para o template de movimentações
  const data = [
    ['Nome do Produto', 'Quantidade Movimentada', 'Data da Movimentação', 'Tipo de Movimentação'],
    ['Smartphone XYZ', 10, '2025-01-15', 'Compra'],
    ['Camiseta Básica', 5, '2025-01-16', 'Venda'],
    ['Livro de Programação', 20, '2025-01-17', 'Compra'],
    ['Smartphone XYZ', 3, '2025-01-18', 'Venda'],
    ['Notebook Gamer', 2, '2025-01-19', 'Compra'],
  ]

  // Criar worksheet
  const ws = XLSX.utils.aoa_to_sheet(data)
  
  // Definir larguras das colunas
  ws['!cols'] = [
    { wch: 30 }, // Nome do Produto
    { wch: 22 }, // Quantidade Movimentada
    { wch: 22 }, // Data da Movimentação
    { wch: 22 }  // Tipo de Movimentação
  ]

  // Adicionar autofilter na primeira linha (cabeçalho)
  ws['!autofilter'] = { ref: 'A1:D1' }

  // Criar workbook
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Movimentações')

  // Gerar arquivo Excel
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  
  return new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  })
}

export function downloadFile(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}
