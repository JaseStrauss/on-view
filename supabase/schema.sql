-- On View — run this in the Supabase SQL editor

-- Artworks
create table if not exists public.artworks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade not null,
  title text not null,
  artist_name text,
  year integer,
  medium text,
  dimensions text,
  status text not null default 'available'
    check (status in ('available', 'sold', 'on_loan', 'in_storage')),
  condition_notes text,
  image_path text,
  created_at timestamptz not null default now()
);

-- Exhibitions (for a later session)
create table if not exists public.exhibitions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade not null,
  title text not null,
  description text,
  slug text unique not null,
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.exhibition_artworks (
  exhibition_id uuid references public.exhibitions (id) on delete cascade,
  artwork_id uuid references public.artworks (id) on delete cascade,
  position integer not null,
  primary key (exhibition_id, artwork_id)
);

-- Row level security
alter table public.artworks enable row level security;
alter table public.exhibitions enable row level security;
alter table public.exhibition_artworks enable row level security;

create policy "Users manage own artworks"
  on public.artworks
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own exhibitions"
  on public.exhibitions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own exhibition artworks"
  on public.exhibition_artworks
  for all
  using (
    exists (
      select 1 from public.exhibitions e
      where e.id = exhibition_id and e.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.exhibitions e
      where e.id = exhibition_id and e.user_id = auth.uid()
    )
  );

-- Public exhibitions readable by anyone (for share links — wire up in a later session)
create policy "Public exhibitions are viewable"
  on public.exhibitions
  for select
  using (is_public = true);

-- Storage: create a bucket named "artwork-images" in the Supabase dashboard (public read).
-- Then run:
--
-- create policy "Users upload own artwork images"
--   on storage.objects for insert
--   with check (bucket_id = 'artwork-images' and auth.uid()::text = (storage.foldername(name))[1]);
--
-- create policy "Users update own artwork images"
--   on storage.objects for update
--   using (bucket_id = 'artwork-images' and auth.uid()::text = (storage.foldername(name))[1]);
--
-- create policy "Users delete own artwork images"
--   on storage.objects for delete
--   using (bucket_id = 'artwork-images' and auth.uid()::text = (storage.foldername(name))[1]);
--
-- create policy "Artwork images are publicly readable"
--   on storage.objects for select
--   using (bucket_id = 'artwork-images');
