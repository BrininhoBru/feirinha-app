-- Fix UPDATE policy for listas table
-- Only the creator should be able to edit the list name (according to business rules)
-- Shared users can only add/edit/delete items, not modify the list itself

-- Drop the old policy that allowed shared users to update lists
DROP POLICY IF EXISTS "Usuários e compartilhados atualizam listas" ON listas;

-- Create new policy: Only the creator can update the list
CREATE POLICY "Apenas criadores atualizam listas" ON listas FOR UPDATE 
  USING (auth.uid() = criador_id);
