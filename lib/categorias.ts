export const CATEGORIAS_PRODUTOS = [
  { value: "Eletrônicos", label: "Eletrônicos" },
  { value: "Roupas", label: "Roupas" },
  { value: "Casa e Jardim", label: "Casa e Jardim" },
  { value: "Esporte", label: "Esporte" },
  { value: "Livros", label: "Livros" },
  { value: "Alimentação", label: "Alimentação" },
  { value: "Beleza", label: "Beleza" },
  { value: "Automóveis", label: "Automóveis" },
  { value: "Geral", label: "Geral" },
] as const

export type CategoriasProdutos = typeof CATEGORIAS_PRODUTOS[number]["value"]
