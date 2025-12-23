-- Fix infinite recursion in RLS policies
-- This migration resolves circular dependency between listas and lista_compartilhamentos policies
-- by denormalizing the lista_criador_id into lista_compartilhamentos table

-- Step 1: Add lista_criador_id column to lista_compartilhamentos
-- This denormalizes the creator information to avoid circular policy checks
-- Note: Column is added as nullable initially to allow safe population
ALTER TABLE lista_compartilhamentos ADD COLUMN IF NOT EXISTS lista_criador_id UUID;

-- Step 2: Populate lista_criador_id from existing listas data
-- Note: This UPDATE is efficient because idx_compartilhamentos_lista index already exists on lista_id
-- The 'IS NULL' condition makes this migration idempotent (safe to run multiple times)
UPDATE lista_compartilhamentos 
SET lista_criador_id = listas.criador_id
FROM listas
WHERE lista_compartilhamentos.lista_id = listas.id
AND lista_compartilhamentos.lista_criador_id IS NULL;

-- Step 3: Make lista_criador_id NOT NULL after population
-- This will fail if there are orphaned rows (compartilhamentos without valid lista_id)
-- which correctly exposes data integrity issues that need to be fixed
ALTER TABLE lista_compartilhamentos ALTER COLUMN lista_criador_id SET NOT NULL;

-- Step 4: Create trigger function to keep lista_criador_id synchronized
-- This ensures new compartilhamentos always have the correct lista_criador_id
-- Note: SECURITY DEFINER is required so the trigger can read from listas table
-- even when the calling user doesn't have direct read access to all listas rows
CREATE OR REPLACE FUNCTION sync_lista_criador_id()
RETURNS TRIGGER AS $$
DECLARE
  v_criador_id UUID;
BEGIN
  -- On INSERT or UPDATE (when lista_id changes), set lista_criador_id from listas table
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.lista_id IS DISTINCT FROM OLD.lista_id) THEN
    SELECT criador_id INTO v_criador_id
    FROM listas
    WHERE id = NEW.lista_id;
    
    -- Check if the lista was found using FOUND variable (automatically set by SELECT INTO)
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Lista with id % does not exist', NEW.lista_id;
    END IF;
    
    IF v_criador_id IS NULL THEN
      RAISE EXCEPTION 'Lista with id % has NULL criador_id', NEW.lista_id;
    END IF;
    
    NEW.lista_criador_id := v_criador_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create trigger to automatically populate lista_criador_id on INSERT and UPDATE
DROP TRIGGER IF EXISTS sync_lista_criador_id_trigger ON lista_compartilhamentos;
CREATE TRIGGER sync_lista_criador_id_trigger
  BEFORE INSERT OR UPDATE ON lista_compartilhamentos
  FOR EACH ROW
  EXECUTE FUNCTION sync_lista_criador_id();

-- Step 6: Drop old policies that cause circular dependency
DROP POLICY IF EXISTS "Criadores veem compartilhamentos de suas listas" ON lista_compartilhamentos;
DROP POLICY IF EXISTS "Criadores gerenciam compartilhamentos" ON lista_compartilhamentos;
DROP POLICY IF EXISTS "Criadores removem compartilhamentos" ON lista_compartilhamentos;

-- Step 7: Create new policies using lista_criador_id directly (no subqueries to listas)
-- This eliminates the circular dependency by using the denormalized column

-- Policy for SELECT: Creators see shares of their lists, users see their own shares
CREATE POLICY "Criadores veem compartilhamentos de suas listas" ON lista_compartilhamentos
  FOR SELECT
  USING (lista_criador_id = auth.uid() OR user_id = auth.uid());

-- Policy for INSERT: Only creators can create shares for their lists
CREATE POLICY "Criadores gerenciam compartilhamentos" ON lista_compartilhamentos
  FOR INSERT
  WITH CHECK (lista_criador_id = auth.uid());

-- Policy for UPDATE: Only creators can update shares for their lists
CREATE POLICY "Criadores atualizam compartilhamentos" ON lista_compartilhamentos
  FOR UPDATE
  USING (lista_criador_id = auth.uid());

-- Policy for DELETE: Only creators can remove shares for their lists
CREATE POLICY "Criadores removem compartilhamentos" ON lista_compartilhamentos
  FOR DELETE
  USING (lista_criador_id = auth.uid());

-- Step 8: Create index for performance on the new column
CREATE INDEX IF NOT EXISTS idx_compartilhamentos_criador ON lista_compartilhamentos(lista_criador_id);

-- Add comment to document the denormalization
COMMENT ON COLUMN lista_compartilhamentos.lista_criador_id IS 'Denormalized creator ID from listas table to avoid circular RLS policy dependency';
