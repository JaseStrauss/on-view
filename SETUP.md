# On View: local development setup

This guide is for **developers** who want to run the full app locally (sign up, studio, uploads, publish exhibitions).

**Visitors** trying the product do not need this. Open [`/show/demo`](./README.md#live-demo) in the hosted or local app with no Supabase setup.

---

## Prerequisites

- Node.js 20+
- npm
- A [Supabase](https://supabase.com) project (free tier is fine)

---

## 1. Clone and install

```bash
git clone https://github.com/JaseStrauss/on-view.git
cd on-view
npm install
```

---

## 2. Environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Find both values in Supabase → **Project Settings → API**.

> **Note:** Without valid env vars, `/show/demo` still works. Studio features (login, artworks, exhibitions) require Supabase.

---

## 3. Database schema

In the Supabase **SQL editor**, run **`supabase/schema.sql`** once (select all → Run).

---

## 4. Storage bucket

1. Supabase → **Storage** → create a **public** bucket named `artwork-images`
2. Run these policies in the SQL editor:

```sql
create policy "Authenticated users upload own images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'artwork-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Public read artwork images"
on storage.objects for select
to public
using (bucket_id = 'artwork-images');
```

---

## 5. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

| Route                      | Requires Supabase?              |
| -------------------------- | ------------------------------- |
| `/`                        | No (landing page)               |
| `/show/demo`               | **No**: static demo exhibition  |
| `/studio/demo`             | **No**: browse-only demo studio |
| `/signup`, `/studio`, etc. | **Yes**                         |

---

## 6. Typical workflow

1. **Sign up** → add artworks in **Studio**
2. Create an exhibition, pick a room template
3. **Editor** → hang works, use checklist, **Publish**, export PDF
4. Share `/show/your-slug` with visitors

New accounts can seed sample data from the starter catalogue in the studio.

---

## 7. Deploy (Vercel)

```bash
npm run build
```

1. Import the repo in [Vercel](https://vercel.com)
2. Add the same env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
3. Deploy. `vercel.json` handles SPA routing and social preview meta for `/show/:slug`

After deploy, update the **Live demo** URL in [README.md](./README.md).

---

## Troubleshooting

| Issue                   | Fix                                                                |
| ----------------------- | ------------------------------------------------------------------ |
| Studio login fails      | Check `.env` values and that `schema.sql` ran                      |
| Image upload fails      | Confirm `artwork-images` bucket + storage policies                 |
| Public show 404         | Exhibition must be **published** and slug must match               |
| Demo show broken images | Confirm `public/demo/samples/*.jpg` exists in your deploy artifact |

---

## What runs without Supabase

The **demo exhibition** (`/show/demo`) uses in-app demo data from `src/data/demo-exhibition.ts`. Sample images are static files under `public/demo/samples/`. No database or storage is required, so visitors can try the product without any setup.
