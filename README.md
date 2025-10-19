# Insight Forge - Sistema de Gestão de Estoque

[![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC)](https://tailwindcss.com/)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB)](https://reactjs.org/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Components-black)](https://ui.shadcn.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)


Um sistema completo de inteligência empresarial (BI) para análise de estoque e projeções de vendas, desenvolvido com tecnologias modernas para oferecer uma experiência excepcional de gestão empresarial. O projeto implementa uma arquitetura robusta com App Router Next.js, autenticação JWT segura, responsividade adaptativa e componentes UI de alta qualidade.

## 📋 Sumário de Conteúdos

- [🚀 Funcionalidades](#-funcionalidades)
- [🛠️ Stack Tecnológico](#-stack-tecnológico)
- [📁 Estrutura do Projeto](#-estrutura-do-projeto)
- [🏗️ Arquitetura](#-arquitetura)
- [📦 Componentes Principais](#-componentes-principais)
- [🔐 Sistema de Autenticação](#-sistema-de-autenticação)
- [🚀 Instalação e Execução](#-instalação-e-execução)
- [🔧 Configuração](#-configuração)
- [📊 API Client](#-api-client)
- [📱 Responsividade](#-responsividade)
- [🎨 Design System](#-design-system)
- [🚀 Deploy](#-deploy)
- [❓ FAQ e Troubleshooting](#-faq-e-troubleshooting)

## 🚀 Funcionalidades

### 📊 Dashboard Analítico
- **Métricas em Tempo Real**: KPIs essenciais com indicadores dinâmicos
  - Valor total do estoque
  - Margem de lucro potencial
  - Produtos ativos e críticos
  - Movimentações do período
  - Receita e lucro totais
- **Gráficos Interativos**: Visualizações com Recharts (barras, linhas, compostas)
- **Tabelas Dinâmicas**: Dados com paginação, busca e filtros avançados
- **Cards Responsivos**: Adaptação automática para desktop/mobile

### 📦 Gestão de Produtos
- **CRUD Completo**: Criar, ler, atualizar e deletar produtos
- **Upload de Imagens**: Suporte com preview em tempo real
- **Categorização**: Organização por categorias pré-definidas
- **Controle de Estoque**: 
  - Monitoramento de quantidades
  - Alertas para produtos críticos (estoque ≤ 10)
  - Histórico de movimentações
- **Importação em Massa**: Upload de arquivos Excel
- **Exportação**: Download de dados em Excel com formatação

### 📤 Importação e Exportação
- **Importação em Massa**: Processamento de arquivos Excel (1000+ registros)
- **Validação Inteligente**: 
  - Verificação de tipos de dados
  - Tratamento de campos obrigatórios
  - Relatórios detalhados de erros
- **Templates**: Modelos Excel pré-formatados
- **Relatórios**: Feedback com produtos importados, ignorados, não encontrados

### 🏢 Gestão de Usuários
- **Controle de Acesso**: Roles (USER, ADMIN)
- **Gerenciamento de Contas**: CRUD de usuários
- **Registro e Autenticação**: Fluxo seguro com JWT
- **Proteção de Rotas**: Apenas admins acessam gestão de usuários

### 📊 Movimentações de Estoque
- **Rastreamento de Movimento**: Entrada, saída, ajuste
- **Filtros Avançados**:
  - Por tipo de movimentação
  - Por data (range customizável)
  - Por categoria de produto
  - Por produto específico
- **Histórico Completo**: Todas as alterações registradas

### 🔐 Sistema de Autenticação
- **Login/Registro Seguro**: Autenticação baseada em JWT
- **Proteção de Rotas**: Middleware Next.js validando tokens
- **Gerenciamento de Sessões**: Tokens com expiração automática
- **Logout Seguro**: Limpeza completa de dados de sessão
- **Validação de Token**: Endpoint `/api/auth/validate` para verificação backend

### 📱 Design Responsivo
- **Mobile-First**: Interface otimizada para dispositivos móveis
- **Breakpoints Unificados**: `md:` (768px) para transição desktop
- **Navegação Adaptativa**:
  - Mobile: Navbar fixo no rodapé com 5 botões principais
  - Desktop: Sidebar colapsível com navegação completa
- **Componentes Adaptativos**: Todos os elementos ajustam-se automaticamente
- **Experiência Consistente**: Design system unificado com shadcn/ui

## 🛠️ Stack Tecnológico

### Core Framework
| Tecnologia | Versão | Propósito |
|----------|--------|----------|
| **Next.js** | 15.5.2 | Framework React com App Router, Server Components, Middleware |
| **React** | 18.2.0 | Biblioteca UI com Hooks, Suspense, Server Components |
| **TypeScript** | 5.0 | Tipagem estática com strict mode ativado |
| **Tailwind CSS** | 3.4.17 | Framework CSS utilitário com temas customizados |

### Backend (Integração)
| Tecnologia | Versão | Propósito |
|----------|--------|----------|
| **Spring Boot** | 3.5.3 | Framework backend REST API |
| **Java** | 21 | Linguagem principal do backend |
| **MySQL** | 8.0+ | Banco de dados relacional |
| **JWT** | 0.11.5 | Autenticação stateless com tokens |

### UI/Componentes (Radix UI Base)
| Biblioteca | Versão | Componentes |
|----------|--------|----------|
| **shadcn/ui** | latest | 30+ componentes acessíveis (Button, Dialog, Form, Table, etc) |
| **@radix-ui/** | 1.1.4-2.2.4 | 25+ primitivos: Dialog, Select, Accordion, Dropdown, Switch, Radio, etc |
| **Lucide React** | 0.454.0 | 1500+ ícones otimizados |
| **Recharts** | latest | Gráficos compostos: BarChart, LineChart, PieChart |
| **Embla Carousel** | 8.5.1 | Carrossel/slider acessível |
| **Input OTP** | 1.4.1 | Componente OTP customizável |

### Formulários e Validação
| Biblioteca | Versão | Uso |
|----------|--------|-----|
| **React Hook Form** | 7.54.1 | Gerenciamento eficiente de estado de formulários |
| **Zod** | 3.24.1 | Validação de schemas TypeScript-first |
| **@hookform/resolvers** | 3.9.1 | Integração Zod com React Hook Form |

### Dados e Integração
| Biblioteca | Versão | Propósito |
|----------|--------|----------|
| **date-fns** | 2.29.3 | Manipulação de datas internacionalizadas |
| **ExcelJS** | 4.4.0 | Leitura/escrita de arquivos Excel (.xlsx) |
| **@types/exceljs** | 0.5.3 | Tipos TypeScript para ExcelJS |

### UX e Notificações
| Biblioteca | Versão | Função |
|----------|--------|---------|
| **Sonner** | 1.7.1 | Toast notifications configuráveis |
| **next-themes** | 0.4.4 | Gerenciamento de temas (light/dark) |
| **tailwindcss-animate** | 1.0.7 | Animações Tailwind CSS |
| **vaul** | 0.9.6 | Drawer/sidebar primitivos |

### Desenvolvimento
| Ferramenta | Versão | Propósito |
|----------|--------|----------|
| **TypeScript** | 5.0 | Tipos estáticos com strict mode |
| **ESLint** | latest | Linting de código |
| **PostCSS** | 8.5 | Processamento CSS |
| **Autoprefixer** | 10.4.20 | Prefixos CSS para compatibilidade |
| **Concurrently** | 9.2.1 | Rodar múltiplos npm scripts |

## 📁 Estrutura do Projeto

```
insight-forge-frontend/
├── app/                              # Next.js App Router (páginas)
│   ├── (routes)/
│   │   ├── dashboard/page.tsx        # Dashboard com métricas
│   │   ├── produtos/page.tsx         # Gestão de produtos 
│   │   ├── movimentacoes/page.tsx    # Rastreamento de movimentos 
│   │   ├── usuarios/page.tsx         # Gestão de usuários (admin-only)
│   │   ├── importar-dados/page.tsx   # Importação Excel
│   │   ├── login/page.tsx            # Página de login
│   │   ├── register/page.tsx         # Página de registro
│   │   └── unauthorized/page.tsx     # Página 403
│   ├── layout.tsx                    # Layout raiz com ThemeProvider
│   ├── page.tsx                      # Redirecionamento inicial
│   └── globals.css                   # Estilos globais + variables CSS
│
├── components/                       # Componentes React (client/server)
│   ├── ui/                           # Componentes shadcn/ui (30+)
│   │   ├── button.tsx                # Botão com variantes CVA
│   │   ├── dialog.tsx                # Modal
│   │   ├── form.tsx                  # Wrapper Form
│   │   ├── table.tsx                 # Tabela acessível
│   │   ├── card.tsx                  # Container card
│   │   ├── select.tsx                # Select dropdown
│   │   ├── input.tsx                 # Input customizado
│   │   ├── tabs.tsx                  # Tabs acessíveis
│   │   ├── chart.tsx                 # Wrapper Recharts
│   │   └── ... (25+ mais)
│   │
│   ├── authenticated-layout.tsx      # Layout para rotas autenticadas
│   ├── app-sidebar.tsx               # Sidebar desktop + navbar mobile
│   ├── page-header.tsx               # Header reutilizável
│   ├── metrics-grid.tsx              # Grid de métricas KPI 
│   ├── charts-grid.tsx               # Grid de gráficos
│   ├── data-table.tsx                # Tabela com paginação
│   ├── file-upload-zone.tsx          # Upload de arquivos
│   ├── image-upload-zone.tsx         # Upload de imagens
│   ├── import-form.tsx               # Formulário importação
│   └── ... (mais 7 componentes)
│
├── contexts/                         # Contextos React (state management)
│   ├── auth-context.tsx              # Autenticação e JWT
│   └── loading-context.tsx           # Loading global
│
├── hooks/                            # Custom hooks
│   ├── use-import.ts                 # Hook importação
│   ├── use-mobile.tsx                # Hook detecção mobile
│   └── use-page-loading.ts           # Hook loading de página
│
├── lib/                              # Utilitários e configurações
│   ├── api.ts                        # Cliente API
│   ├── categorias.ts                 # Constantes de categorias
│   ├── file-validation.ts            # Validação de arquivos
│   └── utils.ts                      # Funções utilitárias
│
├── types/                            # Tipos TypeScript
│   └── import.ts                     # Types para importação
│
├── public/                           # Arquivos estáticos
│
├── middleware.ts                     # Next.js middleware
├── next.config.mjs                   # Configuração Next.js
├── tsconfig.json                     # Configuração TypeScript
├── tailwind.config.ts                # Configuração Tailwind
├── components.json                   # Configuração shadcn/ui
├── postcss.config.mjs                # Configuração PostCSS
├── package.json                      # Dependências
└── README.md                         # Este arquivo
```

## 🏗️ Arquitetura

### Arquitetura de Camadas

```
┌─────────────────────────────────────────────────────────┐
│          Next.js App Router (Páginas)                   │
│  (login, dashboard, produtos, movimentacoes, etc)       │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│    React Components Layer                               │
│  (authenticated-layout, page-header, forms, tables)     │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│    Context + Hooks Layer                                │
│  (AuthContext, LoadingContext, useImport, useToast)     │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│    API Service Layer (lib/api.ts)                       │
│  (Endpoints, TypeScript interfaces, token management)   │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│    Backend API REST (Spring Boot 3.5.3 + Java 21)       │
│  (http://localhost:8080)                                │
│  - Autenticação JWT                                     │
│  - Gestão de Produtos                                   │
│  - Movimentações de Estoque                             │
│  - Gerenciamento de Usuários                            │
│  - Import/Export Excel                                  │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│    Banco de Dados (MySQL 8.0+)                          │
│  - insightforge_db                                      │
└─────────────────────────────────────────────────────────┘
```

### Flow de Autenticação

```
User Input (Login Form)
    ↓
AuthContext.login(email, password)
    ↓
ApiService.POST /api/auth/login
    ↓
Backend validates credentials → returns JWT token
    ↓
localStorage.setItem('token', token)
    ↓
AuthContext sets isAuthenticated = true
    ↓
Middleware validates token on protected routes
    ↓
Protected pages render with authenticated data
    ↓
On logout → token deleted, isAuthenticated = false
```

## 📦 Componentes Principais

### AuthenticatedLayout
Wrapper para páginas autenticadas com navegação responsiva
- Sidebar colapsível (desktop)
- Navbar fixo inferior (mobile)
- Header com dropdown de usuário
- Breakpoint: `md:` (768px)

### PageHeader ⭐ **NOVO**
Header reutilizável para todas as páginas
- Gradiente branco a #FFFDF0
- Badge dinâmica ('live' ou 'default')
- Ações customizáveis
- Consolidou ~150 linhas de código duplicado

### MetricsGrid
Grid de métricas KPI responsivo
- 8 métricas principais
- Cards com skeleton loading
- Indicadores de tendência (↑↓)
- Responsivo (1-4 colunas)

### DataTable
Tabela reusável com funcionalidades completas
- Paginação (10, 20, 50 itens)
- Sorting por coluna
- Busca em tempo real
- Colunas customizáveis

### API Service (lib/api.ts)
Cliente centralizado com type safety
- 36+ endpoints configurados
- Gerenciamento automático de tokens
- Type definitions (Usuario, Produto, Movimentacao)

## 🔐 Sistema de Autenticação

### JWT Flow

1. **Login**: Email + Password → Token JWT
2. **Storage**: localStorage e cookies
3. **Validation**: Token enviado em Authorization header
4. **Protection**: Middleware valida em rotas protegidas
5. **Logout**: Limpeza completa de dados

```typescript
const login = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  
  const data = await response.json()
  localStorage.setItem('token', data.token)
  setUser(data.user)
  setIsAuthenticated(true)
}
```

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js 18.0+
- npm 9.0+

### Passo a Passo

1. **Clone o repositório:**
```bash
git clone https://github.com/AlanMMachado/insight-forge-frontend.git
cd insight-forge-frontend
```

2. **Instale dependências:**
```bash
npm install
```

3. **Configure ambiente:**
```bash
echo 'NEXT_PUBLIC_API_BASE_URL=http://localhost:8080' > .env.local
```

4. **Execute em desenvolvimento:**
```bash
npm run dev
```

5. **Acesse em:**
```
http://localhost:3000
```

### Scripts Disponíveis

```bash
npm run dev              # Servidor dev (http://localhost:3000)
npm run dev:tunnel       # Dev com ngrok (acesso remoto)
npm run build            # Build otimizado para produção
npm run start            # Inicia servidor de produção
npm run lint             # Executa ESLint
npm run tunnel           # Cria túnel ngrok na porta 3000
```

## 🔧 Configuração

### Variáveis de Ambiente (`.env.local`)

```env
# Backend API URL (OBRIGATÓRIO)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

# Opcionais
NEXT_PUBLIC_THEME=light
NEXT_PUBLIC_DEBUG=false
```

### TypeScript (`tsconfig.json`)
- `"strict": true` - Tipagem rigorosa
- Path alias `@/*` mapeado para raiz
- Target ES6, module esnext

### Tailwind (`tailwind.config.ts`)
- Tema customizado com CSS variables
- Integração com shadcn/ui
- Animações habilitadas

## 📊 API Client

### Endpoints Principais

**Autenticação** (3 endpoints)
```
POST   /api/auth/login                  # Login com email/password
POST   /api/auth/register               # Registro de novo usuário
GET    /api/auth/validate               # Validação de token
```

**Produtos** (11 endpoints)
```
GET    /api/produtos/listarProdutos                    # Listar todos
POST   /api/produtos/criarProduto                      # Criar novo
GET    /api/produtos/buscarProdutoPorId/{id}          # Buscar por ID
PUT    /api/produtos/atualizarProduto/{id}            # Atualizar
DELETE /api/produtos/deletarProduto/{id}              # Deletar
GET    /api/produtos/buscarProdutoPorNome?nome=x      # Buscar por nome
GET    /api/produtos/buscarProdutoPorCategoria?cat=x  # Filtrar por categoria
GET    /api/produtos/buscarProdutosAtivos?ativo=true  # Filtrar ativos/inativos
GET    /api/produtos/listarCategorias                 # Listar categorias
POST   /api/produtos/importarProdutos                 # Importar Excel
GET    /api/produtos/exportarProdutos                 # Exportar Excel
```

**Movimentações** (14 endpoints)
```
GET    /api/movimentacoes/listarMovimentacoes                    # Listar todas
POST   /api/movimentacoes/criarMovimentacao                      # Criar nova
GET    /api/movimentacoes/buscarPorId/{id}                       # Buscar por ID
PUT    /api/movimentacoes/atualizarMovimentacao/{id}             # Atualizar
DELETE /api/movimentacoes/deletarMovimentacao/{id}               # Deletar
GET    /api/movimentacoes/filtrarPorTipo?tipo=VENDA              # Filtrar por tipo
GET    /api/movimentacoes/filtrarPorData?dataInicio=x&dataFim=y  # Filtrar por data
GET    /api/movimentacoes/filtrarPorProduto?produtoId=1          # Filtrar por produto
POST   /api/movimentacoes/importarMovimentacoes                  # Importar Excel
GET    /api/movimentacoes/exportarMovimentacoes                  # Exportar todas
GET    /api/movimentacoes/exportarMovimentacoesPorProduto?id=1   # Exportar por produto
GET    /api/movimentacoes/exportarMovimentacoesPorCategoria?cat=x# Exportar por categoria
GET    /api/movimentacoes/exportarMovimentacoesPorData?ini=x&fim=y# Exportar por data
GET    /api/movimentacoes/exportarMovimentacoesPorTipo?tipo=VENDA # Exportar por tipo
```

**Usuários** (6 endpoints - Admin)
```
GET    /api/usuarios                           # Listar todos
POST   /api/usuarios/registrarUser             # Registrar novo usuário
POST   /api/usuarios/registrarAdmin            # Registrar admin (admin only)
GET    /api/usuarios/buscarUsuario/{id}        # Buscar por ID
PUT    /api/usuarios/atualizarUsuario/{id}     # Atualizar
DELETE /api/usuarios/deletarUsuario/{id}       # Deletar (admin only)
```
**Health Check** (1 endpoint)
```
GET    /api/health                     # Status da API
```

### Type Definitions

```typescript
interface Usuario {
  id?: number
  nome: string
  email: string
  role: 'USER' | 'ADMIN'
  dataCriacao?: string
  createdAt?: string
}

interface Produto {
  id?: number
  nome: string
  categoria?: string
  preco?: number
  custo?: number
  quantidadeEstoque?: number
  ativo?: boolean
  descricao?: string
  fotoUrl?: string
  dataCriacao?: string
  dataAtualizacao?: string
}

interface Movimentacao {
  id?: number
  produto: {
    id: number
  }
  tipoMovimentacao: 'COMPRA' | 'VENDA'
  quantidadeMovimentada: number
  dataMovimentacao: string
  dataCriacao?: string
}

interface Fornecedor {
  id?: number
  nome: string
  cnpj?: string
  telefone?: string
  dataCadastro?: string
}
```

## 📱 Responsividade

### Breakpoints Utilizados

| Breakpoint | Pixels | Uso |
|-----------|--------|-----|
| sm: | 640px | Tablets pequenos |
| **md:** | **768px** | **Principal - Desktop** |
| lg: | 1024px | Desktop grande |
| xl: | 1280px | Monitores muito grandes |

### Estratégia Mobile-First

```tsx
// Base: mobile
<div className="p-4 text-sm">Mobile</div>

// Enhanced: desktop
<div className="p-4 md:p-8 text-sm md:text-lg">
  Adaptativo
</div>
```

### Componentes Responsivos

- **AuthenticatedLayout**: Navbar mobile ↔ Sidebar desktop
- **MetricsGrid**: 1 coluna (mobile) → 4 colunas (desktop)
- **DataTable**: Scroll horizontal → Tabela tradicional
- **Charts**: 300px (mobile) → 400px (desktop)

## 🎨 Design System

### Paleta de Cores

- **Primária**: #FFD300 (Amber)
- **Secundária**: #B8860B (Amber escuro)
- **Neutras**: Gray 50-900
- **Status**: Green, Amber, Red, Blue

### Tipografia

- **Headings**: font-weight 700-900
- **Body**: font-size 1rem, line-height 1.5
- **Mono**: font-family monospace para code

### Componentes UI

30+ componentes shadcn/ui disponíveis:
- Buttons, Forms, Dialogs
- Tables, Cards, Alerts
- Badges, Tabs, Pagination
- Tooltips, Dropdowns, Selects


## 👥 Autor
**Alan Machado**
- 🐙 GitHub: [@AlanMMachado](https://github.com/AlanMMachado)
- 💼 LinkedIn: [Alan Machado](https://linkedin.com/in/alanmmachado)