import * as ExcelJS from 'exceljs'

// Utilitário para criar arquivos Excel template
export async function createProdutosTemplate(): Promise<Blob> {
  // Dados de exemplo para o template de produtos
  const data = [
    ['Nome', 'Preço', 'Custo', 'Descrição', 'Categoria', 'Quantidade Estoque'],
    ['Smartphone XYZ', 899.99, 799.99, 'Smartphone com 128GB de armazenamento', 'Eletrônicos', 50],
    ['Camiseta Básica', 29.90, 19.90, 'Camiseta 100% algodão tamanho M', 'Roupas', 120],
    ['Livro de Programação', 45.50, 35.50, 'Guia completo para desenvolvedores', 'Livros', 25],
    ['Notebook Gamer', 2499.99, 1999.99, 'Notebook para jogos com placa de vídeo dedicada', 'Eletrônicos', 10],
  ]

  // Criar workbook e worksheet
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Produtos')

  // Adicionar dados
  worksheet.addRows(data)
  
  // Definir larguras das colunas
  worksheet.columns = [
    { width: 30 }, // Nome
    { width: 15 }, // Preço
    { width: 15 }, // Custo
    { width: 50 }, // Descrição
    { width: 20 }, // Categoria
    { width: 18 }  // Quantidade Estoque
  ]

  // Adicionar autofilter na primeira linha (cabeçalho)
  worksheet.autoFilter = 'A1:F1'

  // Gerar buffer e retornar Blob
  const buffer = await workbook.xlsx.writeBuffer()
  
  return new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  })
}

export async function createMovimentacoesTemplate(): Promise<Blob> {
  // Dados de exemplo para o template de movimentações
  const data = [
    ['Nome do Produto', 'Quantidade Movimentada', 'Data da Movimentação', 'Tipo de Movimentação'],
    ['Smartphone XYZ', 10, '2025-08-15', 'Compra'],
    ['Camiseta Básica', 5, '2025-08-16', 'Venda'],
    ['Livro de Programação', 20, '2025-07-17', 'Compra'],
    ['Smartphone XYZ', 3, '2025-07-18', 'Venda'],
    ['Notebook Gamer', 2, '2025-08-19', 'Compra'],
  ]

  // Criar workbook e worksheet
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Movimentações')

  // Adicionar dados
  worksheet.addRows(data)
  
  // Definir larguras das colunas
  worksheet.columns = [
    { width: 30 }, // Nome do Produto
    { width: 22 }, // Quantidade Movimentada
    { width: 22 }, // Data da Movimentação
    { width: 22 }  // Tipo de Movimentação
  ]

  // Adicionar autofilter na primeira linha (cabeçalho)
  worksheet.autoFilter = 'A1:D1'

  // Gerar buffer e retornar Blob
  const buffer = await workbook.xlsx.writeBuffer()
  
  return new Blob([buffer], { 
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
