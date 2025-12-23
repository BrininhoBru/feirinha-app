-- Criar tabelas para o FeirinhaApp

-- Tabela de produtos (catálogo)
CREATE TABLE IF NOT EXISTS produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  categoria TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de histórico de preços
CREATE TABLE IF NOT EXISTS historico_precos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID REFERENCES produtos(id) ON DELETE CASCADE,
  marca TEXT,
  preco DECIMAL(10, 2) NOT NULL,
  user_id UUID NOT NULL,
  data_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de listas de compras
CREATE TABLE IF NOT EXISTS listas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL DEFAULT 'Nova Lista',
  user_id UUID NOT NULL,
  criada_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  concluida BOOLEAN DEFAULT FALSE
);

-- Tabela de itens da lista
CREATE TABLE IF NOT EXISTS itens_lista (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lista_id UUID REFERENCES listas(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos(id) ON DELETE CASCADE,
  quantidade DECIMAL(10, 2) NOT NULL DEFAULT 1,
  unidade TEXT DEFAULT 'un',
  marca TEXT,
  preco DECIMAL(10, 2),
  checked BOOLEAN DEFAULT FALSE,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_precos ENABLE ROW LEVEL SECURITY;
ALTER TABLE listas ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_lista ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para produtos (todos podem ler, qualquer usuário autenticado pode criar)
CREATE POLICY "Produtos são públicos para leitura" ON produtos FOR SELECT USING (true);
CREATE POLICY "Usuários autenticados podem criar produtos" ON produtos FOR INSERT WITH CHECK (true);

-- Políticas RLS para histórico de preços (usuários veem apenas seus próprios registros)
CREATE POLICY "Usuários veem seu próprio histórico" ON historico_precos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários criam seu próprio histórico" ON historico_precos FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para listas (usuários gerenciam apenas suas próprias listas)
CREATE POLICY "Usuários veem suas próprias listas" ON listas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários criam suas próprias listas" ON listas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários atualizam suas próprias listas" ON listas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuários deletam suas próprias listas" ON listas FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para itens da lista
CREATE POLICY "Usuários veem itens de suas listas" ON itens_lista FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM listas WHERE listas.id = itens_lista.lista_id AND listas.user_id = auth.uid()
  ));
  
CREATE POLICY "Usuários criam itens em suas listas" ON itens_lista FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM listas WHERE listas.id = itens_lista.lista_id AND listas.user_id = auth.uid()
  ));
  
CREATE POLICY "Usuários atualizam itens de suas listas" ON itens_lista FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM listas WHERE listas.id = itens_lista.lista_id AND listas.user_id = auth.uid()
  ));
  
CREATE POLICY "Usuários deletam itens de suas listas" ON itens_lista FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM listas WHERE listas.id = itens_lista.lista_id AND listas.user_id = auth.uid()
  ));

-- Criar índices para melhor performance
CREATE INDEX idx_historico_precos_produto ON historico_precos(produto_id);
CREATE INDEX idx_historico_precos_user ON historico_precos(user_id);
CREATE INDEX idx_listas_user ON listas(user_id);
CREATE INDEX idx_itens_lista_lista ON itens_lista(lista_id);
CREATE INDEX idx_itens_lista_produto ON itens_lista(produto_id);
