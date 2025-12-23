-- Adicionar compartilhamento de listas
-- Este script adiciona a funcionalidade de compartilhar listas entre usuários

-- Adicionar coluna criador_id à tabela listas para rastrear o proprietário original
ALTER TABLE listas ADD COLUMN IF NOT EXISTS criador_id UUID;

-- Atualizar listas existentes para definir criador_id igual a user_id
UPDATE listas SET criador_id = user_id WHERE criador_id IS NULL;

-- Tornar criador_id obrigatório
ALTER TABLE listas ALTER COLUMN criador_id SET NOT NULL;

-- Criar tabela de compartilhamentos
CREATE TABLE IF NOT EXISTS lista_compartilhamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lista_id UUID REFERENCES listas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  compartilhada_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(lista_id, user_id)
);

-- Habilitar Row Level Security
ALTER TABLE lista_compartilhamentos ENABLE ROW LEVEL SECURITY;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_compartilhamentos_lista ON lista_compartilhamentos(lista_id);
CREATE INDEX IF NOT EXISTS idx_compartilhamentos_user ON lista_compartilhamentos(user_id);

-- Remover políticas antigas de listas
DROP POLICY IF EXISTS "Usuários veem suas próprias listas" ON listas;
DROP POLICY IF EXISTS "Usuários criam suas próprias listas" ON listas;
DROP POLICY IF EXISTS "Usuários atualizam suas próprias listas" ON listas;
DROP POLICY IF EXISTS "Usuários deletam suas próprias listas" ON listas;

-- Novas políticas para listas (permitir acesso do criador e usuários com quem foi compartilhado)
CREATE POLICY "Usuários veem suas listas e listas compartilhadas" ON listas FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    auth.uid() = criador_id OR
    EXISTS (
      SELECT 1 FROM lista_compartilhamentos 
      WHERE lista_compartilhamentos.lista_id = listas.id 
      AND lista_compartilhamentos.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários criam suas próprias listas" ON listas FOR INSERT 
  WITH CHECK (auth.uid() = user_id AND auth.uid() = criador_id);

CREATE POLICY "Usuários e compartilhados atualizam listas" ON listas FOR UPDATE 
  USING (
    auth.uid() = user_id OR 
    auth.uid() = criador_id OR
    EXISTS (
      SELECT 1 FROM lista_compartilhamentos 
      WHERE lista_compartilhamentos.lista_id = listas.id 
      AND lista_compartilhamentos.user_id = auth.uid()
    )
  );

CREATE POLICY "Apenas criadores deletam listas" ON listas FOR DELETE 
  USING (auth.uid() = criador_id);

-- Remover políticas antigas de itens_lista
DROP POLICY IF EXISTS "Usuários veem itens de suas listas" ON itens_lista;
DROP POLICY IF EXISTS "Usuários criam itens em suas listas" ON itens_lista;
DROP POLICY IF EXISTS "Usuários atualizam itens de suas listas" ON itens_lista;
DROP POLICY IF EXISTS "Usuários deletam itens de suas listas" ON itens_lista;

-- Novas políticas para itens_lista (permitir acesso para criador e usuários compartilhados)
CREATE POLICY "Usuários veem itens de suas listas e compartilhadas" ON itens_lista FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM listas 
      WHERE listas.id = itens_lista.lista_id 
      AND (
        listas.user_id = auth.uid() OR 
        listas.criador_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM lista_compartilhamentos 
          WHERE lista_compartilhamentos.lista_id = listas.id 
          AND lista_compartilhamentos.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Usuários criam itens em suas listas e compartilhadas" ON itens_lista FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM listas 
      WHERE listas.id = itens_lista.lista_id 
      AND (
        listas.user_id = auth.uid() OR 
        listas.criador_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM lista_compartilhamentos 
          WHERE lista_compartilhamentos.lista_id = listas.id 
          AND lista_compartilhamentos.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Usuários atualizam itens de suas listas e compartilhadas" ON itens_lista FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM listas 
      WHERE listas.id = itens_lista.lista_id 
      AND (
        listas.user_id = auth.uid() OR 
        listas.criador_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM lista_compartilhamentos 
          WHERE lista_compartilhamentos.lista_id = listas.id 
          AND lista_compartilhamentos.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Usuários deletam itens de suas listas e compartilhadas" ON itens_lista FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM listas 
      WHERE listas.id = itens_lista.lista_id 
      AND (
        listas.user_id = auth.uid() OR 
        listas.criador_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM lista_compartilhamentos 
          WHERE lista_compartilhamentos.lista_id = listas.id 
          AND lista_compartilhamentos.user_id = auth.uid()
        )
      )
    )
  );

-- Políticas para lista_compartilhamentos
CREATE POLICY "Criadores veem compartilhamentos de suas listas" ON lista_compartilhamentos FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM listas 
      WHERE listas.id = lista_compartilhamentos.lista_id 
      AND listas.criador_id = auth.uid()
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Criadores gerenciam compartilhamentos" ON lista_compartilhamentos FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM listas 
      WHERE listas.id = lista_compartilhamentos.lista_id 
      AND listas.criador_id = auth.uid()
    )
  );

CREATE POLICY "Criadores removem compartilhamentos" ON lista_compartilhamentos FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM listas 
      WHERE listas.id = lista_compartilhamentos.lista_id 
      AND listas.criador_id = auth.uid()
    )
  );

-- Criar view para facilitar consultas de listas com informações de compartilhamento
CREATE OR REPLACE VIEW listas_com_compartilhamento AS
SELECT 
  l.*,
  CASE 
    WHEN l.criador_id = l.user_id THEN true 
    ELSE false 
  END as e_criador,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM lista_compartilhamentos lc 
      WHERE lc.lista_id = l.id
    ) THEN true 
    ELSE false 
  END as esta_compartilhada
FROM listas l;
