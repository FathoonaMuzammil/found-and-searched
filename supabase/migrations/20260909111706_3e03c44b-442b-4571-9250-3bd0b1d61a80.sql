GRANT DELETE ON public.items TO anon;
DROP POLICY IF EXISTS "Anyone can delete items" ON public.items;
CREATE POLICY "Anyone can delete items" ON public.items FOR DELETE TO anon, authenticated USING (true);