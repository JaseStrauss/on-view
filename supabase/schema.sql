-- On View — run this in the Supabase SQL editor

create extension if not exists "pgcrypto";

-- Artworks catalogue (per user)
create table public.artworks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  artist text not null default '',
  year integer,
  medium text,
  width_cm numeric(8, 2) not null,
  height_cm numeric(8, 2) not null,
  status text not null default 'available'
    check (status in ('available', 'sold', 'on_loan', 'reserved')),
  condition_notes text,
  description text,
  image_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Exhibitions
create table public.exhibitions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  slug text not null,
  room_template_id text not null default 'white-cube',
  room_config jsonb not null default '{}',
  featuring_override text,
  is_published boolean not null default false,
  opens_at date,
  closes_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, slug)
);

-- Artwork placements on gallery walls
create table public.placements (
  id uuid primary key default gen_random_uuid(),
  exhibition_id uuid not null references public.exhibitions (id) on delete cascade,
  artwork_id uuid not null references public.artworks (id) on delete cascade,
  wall_id text not null,
  position_x numeric(6, 3) not null default 0,
  position_y numeric(6, 3) not null default 1.2,
  scale numeric(6, 3) not null default 1,
  rotation_deg numeric(6, 2) not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (exhibition_id, artwork_id)
);

-- Install checklist per exhibition
create table public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  exhibition_id uuid not null references public.exhibitions (id) on delete cascade,
  label text not null,
  is_done boolean not null default false,
  sort_order integer not null default 0
);

-- Works assigned to an exhibition catalogue (not yet hung, or returned from a wall)
create table public.exhibition_catalogue (
  exhibition_id uuid not null references public.exhibitions (id) on delete cascade,
  artwork_id uuid not null references public.artworks (id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (exhibition_id, artwork_id)
);

-- User profiles for studio settings (display name, studio name)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  studio_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index artworks_user_id_idx on public.artworks (user_id);
create index exhibitions_user_id_idx on public.exhibitions (user_id);
create index exhibitions_slug_idx on public.exhibitions (slug) where is_published = true;
create index placements_exhibition_id_idx on public.placements (exhibition_id);
create index exhibition_catalogue_exhibition_id_idx
  on public.exhibition_catalogue (exhibition_id);

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger artworks_updated_at
  before update on public.artworks
  for each row execute function public.set_updated_at();

create trigger exhibitions_updated_at
  before update on public.exhibitions
  for each row execute function public.set_updated_at();

-- Row Level Security
alter table public.artworks enable row level security;
alter table public.exhibitions enable row level security;
alter table public.placements enable row level security;
alter table public.checklist_items enable row level security;
alter table public.exhibition_catalogue enable row level security;
alter table public.profiles enable row level security;

-- Artworks: owner only
create policy "Users manage own artworks"
  on public.artworks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Public can view artworks in published exhibitions"
  on public.artworks for select
  using (
    exists (
      select 1 from public.placements pl
      join public.exhibitions e on e.id = pl.exhibition_id
      where pl.artwork_id = artworks.id and e.is_published = true
    )
  );

-- Exhibitions: owner manages; public can read published
create policy "Users manage own exhibitions"
  on public.exhibitions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Public can view published exhibitions"
  on public.exhibitions for select
  using (is_published = true);

-- Placements: owner via exhibition; public read for published shows
create policy "Users manage placements for own exhibitions"
  on public.placements for all
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

create policy "Public can view placements for published exhibitions"
  on public.placements for select
  using (
    exists (
      select 1 from public.exhibitions e
      where e.id = exhibition_id and e.is_published = true
    )
  );

-- Checklist: owner only
create policy "Users manage checklist for own exhibitions"
  on public.checklist_items for all
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

-- Exhibition catalogue
create policy "Users manage catalogue for own exhibitions"
  on public.exhibition_catalogue for all
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

create policy "Public can view catalogue for published exhibitions"
  on public.exhibition_catalogue for select
  using (
    exists (
      select 1 from public.exhibitions e
      where e.id = exhibition_id and e.is_published = true
    )
  );

-- Profiles
create policy "Users manage own profile"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Public can read presenter profiles"
  on public.profiles for select
  using (
    exists (
      select 1
      from public.exhibitions e
      where e.user_id = profiles.id
        and e.is_published = true
    )
  );
