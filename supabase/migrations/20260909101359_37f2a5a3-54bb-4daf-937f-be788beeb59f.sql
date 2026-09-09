ALTER TABLE public.items
  ADD COLUMN IF NOT EXISTS claimed_by uuid,
  ADD COLUMN IF NOT EXISTS claimed_at timestamptz;

DROP POLICY IF EXISTS "Anyone can post items" ON public.items;
DROP POLICY IF EXISTS "Anyone can update items" ON public.items;
DROP POLICY IF EXISTS "Anyone can view items" ON public.items;

GRANT SELECT ON public.items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.items TO authenticated;
GRANT ALL ON public.items TO service_role;

CREATE POLICY "Items are publicly viewable"
  ON public.items FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Signed-in users can post items"
  ON public.items FOR INSERT
  TO authenticated
  WITH CHECK (posted_by = auth.uid());

CREATE POLICY "Owners can edit their items"
  ON public.items FOR UPDATE
  TO authenticated
  USING (posted_by = auth.uid())
  WITH CHECK (posted_by = auth.uid());

CREATE POLICY "Signed-in users can claim items"
  ON public.items FOR UPDATE
  TO authenticated
  USING (status <> 'Claimed')
  WITH CHECK (status = 'Claimed' AND claimed_by = auth.uid());

CREATE POLICY "Owners can delete their items"
  ON public.items FOR DELETE
  TO authenticated
  USING (posted_by = auth.uid());