-- Remove the open anonymous write policies
DROP POLICY IF EXISTS "Anyone can post items" ON public.items;
DROP POLICY IF EXISTS "Anyone can delete items" ON public.items;
DROP POLICY IF EXISTS "Anyone can claim items" ON public.items;

REVOKE INSERT, UPDATE, DELETE ON public.items FROM anon;
GRANT SELECT ON public.items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.items TO authenticated;
GRANT ALL ON public.items TO service_role;

-- Signed-in users may post, and the row must be owned by them
CREATE POLICY "Authenticated users can post items"
ON public.items FOR INSERT TO authenticated
WITH CHECK (posted_by = auth.uid());

-- Any signed-in user may claim an item that is not yet claimed
CREATE POLICY "Authenticated users can claim items"
ON public.items FOR UPDATE TO authenticated
USING (status <> 'Claimed')
WITH CHECK (status = 'Claimed' AND claimed_by = auth.uid());
