# On View

Catalogue artworks and publish shareable virtual exhibitions.

## Stack

- React + TypeScript + Vite
- Tailwind CSS v4
- shadcn/ui + Lucide icons
- Supabase (Auth, PostgreSQL, Storage)

## Getting started

```bash
npm install
cp .env.example .env
npm run dev
```

### Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Add your URL and anon key to `.env`
3. Run `supabase/schema.sql` in the SQL editor
4. Create a public storage bucket named `artwork-images`
5. Run the storage policies at the bottom of `schema.sql`

## Project location

`c:\Users\strau\on-view`
