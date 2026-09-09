CREATE TABLE public.items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Other',
  location TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Lost',
  photo_url TEXT,
  contact TEXT NOT NULL DEFAULT '',
  posted_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.items TO authenticated;
GRANT ALL ON public.items TO service_role;

ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view items" ON public.items FOR SELECT USING (true);
CREATE POLICY "Anyone can post items" ON public.items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update items" ON public.items FOR UPDATE USING (true) WITH CHECK (true);

INSERT INTO public.items (title, description, category, location, status, contact, created_at) VALUES
('Blue Hydro Flask water bottle', '32oz blue bottle with a robotics club sticker on the side. Left it after lecture.', 'Other', 'Science Building, Room 204', 'Lost', 'maya.r@campus.edu', now() - interval '26 hours'),
('AirPods Pro case (no earbuds)', 'White charging case found under a bench near the quad. Has a small scratch on the lid.', 'Electronics', 'Central Quad, east benches', 'Found', '555-0142', now() - interval '50 hours'),
('Green campus hoodie, size M', 'University hoodie with a small coffee stain on the cuff. Turned in at the front desk.', 'Clothing', 'Student Center front desk', 'Found', 'frontdesk@campus.edu', now() - interval '70 hours'),
('Student ID card — J. Park', 'Found on the floor near the library printers. Can verify with student number.', 'Documents', 'Library, 2nd floor', 'Claimed', 'lib-desk@campus.edu', now() - interval '96 hours'),
('Silver Casio watch', 'Metal band, slightly worn. Lost somewhere between the gym and the parking lot.', 'Accessories', 'Gym / Lot C', 'Lost', 'd.osei@campus.edu', now() - interval '8 hours');