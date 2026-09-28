# On View

Virtual exhibition platform for independent curators and small galleries. Catalogue artworks, hang them in 3D gallery templates, and publish shareable online shows.

**Stack:** React · TypeScript · Tailwind CSS · Supabase · React Three Fiber

---

## Live demo

**Try it now — no account or setup required:**

|                     |                                                                                                                |
| ------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Demo exhibition** | [`/show/demo`](/show/demo) — walk the 3D gallery and browse the catalogue                                      |
| **Demo builder**    | [`/studio/demo/build`](/studio/demo/build) — hang works in 3D and preview your show (saved in the browser tab) |
| **Demo studio**     | [`/studio/demo`](/studio/demo) — hub for the builder and sample catalogue (no login)                           |
| **Local**           | Run `npm install && npm run dev`, then open [http://localhost:5173/show/demo](http://localhost:5173/show/demo) |
| **Deployed**        | After you deploy to Vercel, add your URL here: `https://your-app.vercel.app/show/demo`                         |

Visitors viewing the demo exhibition or demo studio **do not need Supabase** — demo data is bundled in the app.

Set `VITE_PUBLIC_DEMO_ONLY=true` on Vercel to hide sign-up and show demo-only navigation.

To create your own exhibitions (sign up, upload works, publish links), you need a hosted instance with Supabase configured — see **[SETUP.md](./SETUP.md)** for developers.

---

## Features

- **Demo exhibition** — public `/show/demo` with 3D gallery + catalogue (no login)
- **Demo studio** — public `/studio/demo` browse-only studio (no login, no Supabase)
- Auth (email/password via Supabase)
- Artwork catalogue with image upload, dimensions, medium, status, private condition notes
- Exhibitions with room templates: White Cube, Narrow Salon, Gallery Corridor, L-shaped Gallery, Two-room Suite
- 2D wall-plan editor and 3D gallery preview
- PDF catalogue export
- Install checklist per exhibition
- Publish public exhibition links (`/show/:slug`)

---

## Quick start (developers)

```bash
git clone https://github.com/JaseStrauss/on-view.git
cd on-view
npm install
cp .env.example .env   # add Supabase credentials for studio features
npm run dev
```

Full Supabase setup, database schema, storage policies, and deployment: **[SETUP.md](./SETUP.md)**

---

## Project structure

```
src/
  app.tsx
  components/       # gallery, editor, landing, studio, ui
  contexts/         # auth, theme
  data/             # demo exhibition + starter catalogue
  hooks/
  pages/
  rooms/            # gallery templates
  services/
supabase/schema.sql
api/                # Vercel serverless (social preview meta)
```

---

## Portfolio / OfferZen

**One-liner:** Fullstack exhibition platform — catalogue artworks, preview hangs in 3D, publish shareable show links. React, TypeScript, Tailwind, Supabase.

**Problem:** Small galleries and curators need to preview and share exhibitions online without enterprise CMS tooling.

**Solution:** On View — catalogue → wall editor → 3D preview → public link + PDF export.

**Live:** [Add deployed URL after Vercel deploy] · **GitHub:** [github.com/JaseStrauss/on-view](https://github.com/JaseStrauss/on-view)

---

## License

Private portfolio project — all rights reserved unless otherwise noted.
