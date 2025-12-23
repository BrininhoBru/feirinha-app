# 🛒 FeirinhaApp

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

4. Execute o script SQL:
   - Acesse o SQL Editor do Supabase
   - Execute o conteúdo de `scripts/001_create_tables.sql`

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

6. Acesse [http://localhost:3000](http://localhost:3000)

## 🚀 Deploy

O projeto está pronto para deploy na [Vercel](https://vercel.com/):

1. Clique no botão "Publish" no v0.dev, ou
2. Conecte seu repositório GitHub na Vercel
3. Configure as variáveis de ambiente do Supabase
4. Deploy automático!

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
