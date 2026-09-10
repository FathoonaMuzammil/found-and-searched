DROP POLICY IF EXISTS "Authenticated users can claim items" ON public.items;
DROP POLICY IF EXISTS "Anyone can claim items" ON public.items;
DROP POLICY IF EXISTS "Owners can edit their items" ON public.items;
DROP POLICY IF EXISTS "Owners can delete their items" ON public.items;
DROP POLICY IF EXISTS "Anyone can delete items" ON public.items;

CREATE POLICY "Owners can edit their items"
ON public.items FOR UPDATE TO authenticated
USING (posted_by = auth.uid())
WITH CHECK (posted_by = auth.uid());

CREATE POLICY "Owners can delete their items"
ON public.items FOR DELETE TO authenticated
USING (posted_by = auth.uid());