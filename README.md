# Insight Forge - Sistema de Gestão de Estoque

[![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-latest-black)](https://ui.shadcn.com/)

Um sistema completo de apoio à decisão para análise de estoque e projeções de vendas, desenvolvido com tecnologias modernas para oferecer uma experiência excepcional de gestão empresarial.

## 🚀 Funcionalidades

### 📊 Dashboard Analítico
- **Métricas em Tempo Real**: Visualização de KPIs essenciais como valor total do estoque, margem de lucro potencial, produtos ativos e críticos
- **Gráficos Interativos**: Análises visuais com Recharts para melhor compreensão dos dados
- **Tabelas Dinâmicas**: Visualização organizada dos dados com funcionalidades de busca e filtro

### 📦 Gestão de Produtos
- **CRUD Completo**: Criar, ler, atualizar e deletar produtos
- **Upload de Imagens**: Suporte para imagens de produtos com preview
- **Categorização**: Organização por categorias pré-definidas
- **Controle de Estoque**: Monitoramento de quantidades e alertas para produtos críticos

### 📤 Importação e Exportação
- **Importação em Massa**: Upload de arquivos Excel para produtos e movimentações
- **Validação Inteligente**: Verificação de dados e tratamento de erros
- **Exportação**: Download de dados em formato Excel
- **Relatórios de Importação**: Feedback detalhado sobre o processo

### 🔐 Sistema de Autenticação
- **Login Seguro**: Autenticação baseada em JWT
- **Proteção de Rotas**: Middleware para controle de acesso
- **Gerenciamento de Sessões**: Controle automático de expiração

### 📱 Design Responsivo
- **Mobile-First**: Interface otimizada para dispositivos móveis
- **Componentes Adaptativos**: Layout responsivo com Tailwind CSS
- **Experiência Consistente**: Design system unificado com shadcn/ui

## 🛠️ Tecnologias Utilizadas

### Frontend
- **[Next.js 15.5.2](https://nextjs.org/)** - Framework React com App Router
- **[TypeScript 5.0](https://www.typescriptlang.org/)** - Tipagem estática
- **[React 18.2.0](https://reactjs.org/)** - Biblioteca para interfaces
- **[Tailwind CSS 3.4.17](https://tailwindcss.com/)** - Framework CSS utilitário

### UI/UX
- **[shadcn/ui](https://ui.shadcn.com/)** - Componentes acessíveis e customizáveis
- **[Radix UI](https://www.radix-ui.com/)** - Primitivos para componentes acessíveis
- **[Lucide React](https://lucide.dev/)** - Ícones modernos e consistentes
- **[Recharts](https://recharts.org/)** - Biblioteca de gráficos para React

### Formulários e Validação
- **[React Hook Form](https://react-hook-form.com/)** - Gerenciamento de formulários
- **[Zod](https://zod.dev/)** - Validação de schemas TypeScript
- **[@hookform/resolvers](https://github.com/react-hook-form/resolvers)** - Integração Zod com React Hook Form

### Utilitários
- **[date-fns](https://date-fns.org/)** - Manipulação de datas
- **[ExcelJS](https://github.com/exceljs/exceljs)** - Processamento de arquivos Excel
- **[Sonner](https://sonner.emilkowal.ski/)** - Notificações toast
- **[next-themes](https://github.com/pacocoursey/next-themes)** - Suporte a temas

### Desenvolvimento
- **[ESLint](https://eslint.org/)** - Linting de código
- **[PostCSS](https://postcss.org/)** - Processamento CSS
- **[Autoprefixer](https://autoprefixer.github.io/)** - Prefixos CSS automáticos

## 📁 Estrutura do Projeto

```
insight-forge-frontend/
├── app/                          # Páginas Next.js (App Router)
│   ├── dashboard/               # Página do dashboard
│   ├── importar-dados/          # Página de importação
│   ├── login/                   # Página de login
│   ├── produtos/                # Página de produtos
│   ├── register/                # Página de registro
│   ├── globals.css              # Estilos globais
│   ├── layout.tsx               # Layout raiz
│   └── page.tsx                 # Página inicial
├── components/                  # Componentes React
│   ├── ui/                      # Componentes shadcn/ui
│   ├── api-loading-setup.tsx    # Configuração de loading da API
│   ├── authenticated-layout.tsx # Layout para páginas autenticadas
│   ├── charts-grid.tsx          # Grid de gráficos
│   ├── dashboard-header.tsx     # Cabeçalho do dashboard
│   ├── data-table.tsx           # Tabela de dados
│   ├── file-upload-zone.tsx     # Upload de arquivos
│   ├── image-upload-zone.tsx    # Upload de imagens
│   ├── import-form.tsx          # Formulário de importação
│   ├── loading-indicator.tsx    # Indicador de carregamento
│   ├── metrics-grid.tsx         # Grid de métricas
│   ├── mobile-data-card.tsx     # Cards para mobile
│   ├── quick-product-registration.tsx # Cadastro rápido
│   └── theme-provider.tsx       # Provedor de tema
├── contexts/                    # Contextos React
│   ├── auth-context.tsx         # Contexto de autenticação
│   └── loading-context.tsx      # Contexto de loading
├── hooks/                       # Hooks customizados
│   ├── use-import.ts            # Hook para importação
│   ├── use-mobile.tsx           # Hook para detecção mobile
│   ├── use-page-loading.ts      # Hook para loading de página
│   └── use-toast.ts             # Hook para notificações
├── lib/                         # Utilitários e configurações
│   ├── api.ts                   # Cliente da API
│   ├── categorias.ts            # Categorias de produtos
│   ├── file-validation.ts       # Validação de arquivos
│   ├── templates.ts             # Templates de dados
│   └── utils.ts                 # Funções utilitárias
├── public/                      # Arquivos estáticos
├── types/                       # Tipos TypeScript
│   └── import.ts                # Tipos para importação
├── middleware.ts                # Middleware Next.js
├── next.config.mjs             # Configuração Next.js
├── tailwind.config.ts          # Configuração Tailwind
├── tsconfig.json               # Configuração TypeScript
├── components.json             # Configuração shadcn/ui
└── package.json                # Dependências e scripts
```

## 🚀 Instalação e Execução

### Pré-requisitos

- **Node.js** 18.0 ou superior
- **npm** ou **yarn** ou **pnpm**
- **Backend API** rodando (porta 8080 por padrão)

### Instalação

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/AlanMMachado/insight-forge-frontend.git
   cd insight-forge-frontend
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   # ou
   yarn install
   # ou
   pnpm install
   ```

3. **Configure as variáveis de ambiente:**
   ```bash
   cp .env.example .env.local
   ```

   Edite o arquivo `.env.local`:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
   ```

4. **Execute o projeto:**
   ```bash
   npm run dev
   ```

5. **Acesse a aplicação:**
   - Frontend: [http://localhost:3000](http://localhost:3000)

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia o servidor de desenvolvimento
npm run dev:tunnel       # Inicia com ngrok para desenvolvimento remoto

# Build e Produção
npm run build            # Build para produção
npm run start            # Inicia o servidor de produção
npm run lint             # Executa o linter

# Utilitários
npm run tunnel           # Cria túnel ngrok na porta 3000
```

## 🔧 Configuração

### API Backend

O frontend se conecta a uma API backend. Configure a URL base no arquivo `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

### Configurações do Next.js

O arquivo `next.config.mjs` contém configurações importantes:

- **Imagens**: Configuração para upload de imagens
- **CORS**: Headers para desenvolvimento
- **TypeScript/ESLint**: Ignorar erros durante build

### Tema e UI

O projeto utiliza shadcn/ui com configuração customizada:

- **Tema**: Sistema de cores baseado em CSS variables
- **Componentes**: Radix UI como base para acessibilidade
- **Ícones**: Lucide React para consistência visual

## 📊 Funcionalidades Detalhadas

### Dashboard
- **Métricas Principais**:
  - Valor total do estoque
  - Margem de lucro potencial
  - Produtos ativos
  - Produtos críticos (estoque ≤ 10)
  - Movimentações do mês
  - Receita total
  - Lucro total
  - Entradas do mês

- **Visualizações**:
  - Gráficos de barras e linhas
  - Tabelas com paginação
  - Cards responsivos

### Gestão de Produtos
- **Campos**: Nome, categoria, preço, custo, descrição, quantidade
- **Imagens**: Upload com preview e validação
- **Filtros**: Por nome e categoria
- **Ações**: Visualizar, editar, excluir

### Importação de Dados
- **Formatos Suportados**: Excel (.xlsx, .xls)
- **Validações**: Tipos de dados, campos obrigatórios
- **Relatórios**: Produtos importados, ignorados, não encontrados

## 🔒 Segurança

- **Autenticação JWT**: Tokens seguros para sessões
- **Middleware**: Proteção de rotas autenticadas
- **Validação**: Schemas Zod para entrada de dados
- **Sanitização**: Prevenção de XSS e injeção

## 📱 Responsividade

- **Breakpoints**: Mobile-first com Tailwind CSS
- **Componentes**: Adaptáveis para desktop e mobile
- **Navegação**: Sidebar colapsível em desktop, drawer em mobile

## 🧪 Testes

O projeto atualmente não possui testes automatizados, mas a estrutura está preparada para implementação futura com:

- **Jest**: Framework de testes
- **React Testing Library**: Testes de componentes
- **Playwright**: Testes end-to-end

## 🚀 Deploy

### Vercel (Recomendado)

1. **Conecte o repositório** no Vercel
2. **Configure variáveis de ambiente**
3. **Deploy automático** a cada push

### Outras Plataformas

Compatível com qualquer plataforma que suporte Next.js:
- **Netlify**
- **Railway**
- **Render**
- **Self-hosted** com Docker

## 🤝 Contribuição

1. **Fork** o projeto
2. **Crie uma branch** para sua feature (`git checkout -b feature/nova-feature`)
3. **Commit** suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. **Push** para a branch (`git push origin feature/nova-feature`)
5. **Abra um Pull Request**

### Padrões de Código

- **ESLint**: Seguir regras configuradas
- **Prettier**: Formatação automática
- **TypeScript**: Tipagem estrita
- **Conventional Commits**: Padrão para mensagens de commit

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autor

**Alan Machado**
- GitHub: [@AlanMMachado](https://github.com/AlanMMachado)
- LinkedIn: [Seu LinkedIn]

## 🙏 Agradecimentos

- [shadcn](https://twitter.com/shadcn) - Por criar uma biblioteca de componentes incrível
- [Next.js Team](https://nextjs.org/) - Pelo framework excepcional
- [Vercel](https://vercel.com/) - Pela plataforma de deploy
- Comunidade Open Source - Por todas as bibliotecas utilizadas

---

<div align="center">
  <p>Feito com ❤️ usando Next.js e TypeScript</p>
  <p>
    <a href="#insight-forge---sistema-de-gestão-de-estoque">Voltar ao topo</a>
  </p>
</div></content>
<parameter name="filePath">d:\Programacao\Projetos\insight-forge-frontend\README.md