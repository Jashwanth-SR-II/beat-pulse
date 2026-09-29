-- Allow authenticated users to insert tracks (from Jamendo sync)
create policy "Authenticated users can insert tracks"
  on public.tracks for insert
  to authenticated
  with check (true);

-- Allow authenticated users to update track metadata
create policy "Authenticated users can update tracks"
  on public.tracks for update
  to authenticated
  using (true)
  with check (true);

-- Add a full-text index for search later
create index if not exists tracks_title_search_idx
  on public.tracks using gin (to_tsvector('english', title || ' ' || artist));
