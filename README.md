# 🛒 FeirinhaApp

> 🌐 **Aplicação em Produção:** [[https://feirinha-app.vercel.app](https://v0-feirinhapp.vercel.app/)]

Um aplicativo de lista de compras inteligente que ajuda você a controlar seus gastos e acompanhar a variação de preços dos produtos ao longo do tempo.

## 📋 Sobre o Projeto

O FeirinhaApp é uma solução moderna para gerenciar suas compras de supermercado e feira. Com ele, você pode criar listas de compras organizadas, adicionar produtos com quantidade, unidade, marca e preço, além de acompanhar automaticamente se os produtos aumentaram ou diminuíram de valor em relação às compras anteriores.

Este projeto foi desenvolvido com finalidade **pessoal e de portfólio**, demonstrando habilidades em desenvolvimento full-stack com tecnologias modernas.

## ✨ Funcionalidades

- 🔐 **Autenticação de usuários** com Supabase
- 📝 **Criação e gerenciamento de múltiplas listas** de compras
- ✅ **Checkboxes interativos** para marcar produtos já coletados
- 🔢 **Controle de quantidade e unidade** (kg, litros, unidades, etc.)
- 🏷️ **Registro de marca e preço** de cada produto
- 📊 **Comparação automática de preços** entre compras
- 📈 **Indicadores visuais** mostrando aumento ou redução de preços
- 💰 **Cálculo automático do total** estimado da lista
- 📱 **Design responsivo** para uso em qualquer dispositivo

## 🚀 Tecnologias Utilizadas

- **[Next.js 16](https://nextjs.org/)** - Framework React com App Router
- **[React 19](https://react.dev/)** - Biblioteca para interfaces de usuário
- **[TypeScript](https://www.typescriptlang.org/)** - JavaScript tipado
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Framework CSS utility-first
- **[Supabase](https://supabase.com/)** - Backend as a Service (autenticação e banco de dados PostgreSQL)
- **[shadcn/ui](https://ui.shadcn.com/)** - Componentes de UI reutilizáveis
- **[SWR](https://swr.vercel.app/)** - Hooks React para data fetching

## 🏗️ Estrutura do Projeto

```
FeirinhaApp/
├── app/                      # Páginas e rotas do Next.js App Router
│   ├── auth/                 # Páginas de autenticação
│   ├── listas/               # Páginas de gerenciamento de listas
│   └── page.tsx              # Página inicial
├── components/               # Componentes React reutilizáveis
│   ├── ui/                   # Componentes de UI (shadcn)
│   └── lista-detalhes.tsx    # Componente principal da lista
├── lib/                      # Utilitários e configurações
│   └── supabase/             # Configuração do Supabase
├── scripts/                  # Scripts SQL para banco de dados
└── proxy.ts                  # Middleware de autenticação
```

## 🗄️ Banco de Dados

O projeto utiliza PostgreSQL através do Supabase com as seguintes tabelas:

- **shopping_lists** - Armazena as listas de compras
- **list_items** - Itens de cada lista
- **price_history** - Histórico de preços para comparação

Todas as tabelas possuem **Row Level Security (RLS)** habilitado para garantir que cada usuário acesse apenas seus próprios dados.

## 🛠️ Como Executar Localmente

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/FeirinhaApp.git
cd FeirinhaApp
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
   - Crie um projeto no [Supabase](https://supabase.com/)
   - Configure as variáveis de ambiente necessárias no Vercel ou arquivo `.env.local`

4. Configure os secrets do GitHub para migrações automáticas:
   - `SUPABASE_ACCESS_TOKEN`: Token de acesso do Supabase
     - Obtenha em: https://supabase.com/dashboard/account/tokens
   - `SUPABASE_PROJECT_ID`: ID do projeto Supabase
     - Encontre na URL do dashboard: `https://supabase.com/dashboard/project/[PROJECT_ID]`
   - `SUPABASE_DB_PASSWORD`: Senha do banco de dados
     - Encontre em: Project Settings → Database → Database password
   - Configure em: Settings → Secrets and variables → Actions → New repository secret

5. Execute as migrações do banco de dados:
   - **Opção A (Automática)**: As migrações em `supabase/migrations/` são executadas automaticamente via GitHub Actions ao fazer push na branch `main`
   - **Opção B (Manual)**: Acesse o SQL Editor do Supabase e execute os arquivos da pasta `supabase/migrations/` em ordem

6. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

7. Acesse [http://localhost:3000](http://localhost:3000)

## 🔄 Migrações do Banco de Dados

As migrações do banco de dados são gerenciadas pelo Supabase CLI e executadas automaticamente via GitHub Actions:

- **Localização**: `supabase/migrations/`
- **Execução automática**: Push na branch `main` com alterações em `supabase/migrations/**`
- **Workflow**: `.github/workflows/supabase-migrations.yml`

### Estrutura de Migrações

```
supabase/
├── config.toml                                    # Configuração do Supabase
└── migrations/
    ├── 20231001000000_create_tables.sql          # Criação das tabelas iniciais
    └── 20231002000000_add_sharing.sql            # Funcionalidade de compartilhamento
```

### Secrets Necessários no GitHub

Para que as migrações automáticas funcionem, configure os seguintes secrets no repositório:

1. **SUPABASE_ACCESS_TOKEN**
   - Token de acesso pessoal do Supabase
   - Obtenha em: https://supabase.com/dashboard/account/tokens
   - Permissões necessárias: Acesso ao projeto

2. **SUPABASE_PROJECT_ID**
   - ID de referência do projeto Supabase
   - Formato: `abcdefghijklmnop` (16 caracteres)
   - Encontre na URL: `https://supabase.com/dashboard/project/[PROJECT_ID]`

3. **SUPABASE_DB_PASSWORD**
   - Senha do banco de dados do projeto Supabase
   - Encontre em: Project Settings → Database → Database password
   - Necessária para vincular o projeto via CLI

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

Desenvolvido como projeto pessoal e de portfólio para demonstrar habilidades em:
- Desenvolvimento Full-Stack
- Next.js e React
- TypeScript
- Banco de dados e autenticação
- UI/UX Design

---

⭐ Se este projeto foi útil para você, considere dar uma estrela no repositório!
