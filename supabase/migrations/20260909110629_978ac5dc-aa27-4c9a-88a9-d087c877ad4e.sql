DROP POLICY IF EXISTS "Signed-in users can post items" ON public.items;
DROP POLICY IF EXISTS "Signed-in users can claim items" ON public.items;

GRANT SELECT, INSERT, UPDATE ON public.items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.items TO authenticated;
GRANT ALL ON public.items TO service_role;

CREATE POLICY "Anyone can post items"
ON public.items FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can claim items"
ON public.items FOR UPDATE
TO anon, authenticated
USING (status <> 'Claimed')
WITH CHECK (status = 'Claimed');