# On View

**Plan the hang. Preview in 3D. Share the show.** On View is a personal side project for independent curators and small galleries: catalogue artworks, lay out walls, preview exhibitions in 3D, and publish shareable links (plus PDF catalogues). v0.1, active development.

Live demo: [on-view-seven.vercel.app/show/demo](https://on-view-seven.vercel.app/show/demo)

---

## Live demo

**Try it now (no account or setup):**

|                     |                                                                                                                                                                     |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Demo exhibition** | [on-view-seven.vercel.app/show/demo](https://on-view-seven.vercel.app/show/demo): walk the 3D gallery and browse the catalogue                                      |
| **Demo builder**    | [on-view-seven.vercel.app/studio/demo/build](https://on-view-seven.vercel.app/studio/demo/build): hang works in 3D and preview your show (saved in the browser tab) |
| **Demo studio**     | [on-view-seven.vercel.app/studio/demo](https://on-view-seven.vercel.app/studio/demo): hub for the builder and sample catalogue (no login)                           |
| **Local**           | Run `npm install && npm run dev`, then open [http://localhost:5173/show/demo](http://localhost:5173/show/demo)                                                      |

Visitors on the demo exhibition or demo studio **do not need Supabase**. Demo data is bundled in the app.

The app defaults to demo-only navigation (no sign-up in the header). Set `VITE_PUBLIC_DEMO_ONLY=false` in `.env` or on the host when you run or deploy the full studio with Supabase.

To create your own exhibitions (sign up, upload works, publish links), configure Supabase on your host. See **[SETUP.md](./SETUP.md)**.

---

## Features

- **Demo exhibition**: public `/show/demo` with 3D gallery and catalogue (no login)
- **Demo studio**: public `/studio/demo` browse-only studio (no login, no Supabase)
- Auth (email/password via Supabase)
- Artwork catalogue with image upload, dimensions, medium, status, private condition notes
- Exhibitions with room templates: White Cube, Narrow Salon, Gallery Corridor, L-shaped Gallery, Two-room Suite
- 2D wall-plan editor and 3D gallery preview
- PDF catalogue export
- Install checklist per exhibition
- Publish public exhibition links (`/show/:slug`)

---

## Tech stack

| Part    | What it uses                                                         |
| ------- | -------------------------------------------------------------------- |
| App     | React 19, TypeScript, Vite, React Router                             |
| UI      | Tailwind CSS, shadcn-style components, lucide icons                  |
| 3D      | React Three Fiber, drei, three.js                                    |
| Backend | Supabase (Postgres, Auth, Storage)                                   |
| PDF     | jsPDF                                                                |
| Hosting | Vercel (`vercel.json` SPA routing + edge meta for shared show links) |

---

## Quick start (developers)

Prerequisites: Node.js 20+, npm. Full studio setup also needs a Supabase project (see SETUP.md).

```bash
git clone https://github.com/JaseStrauss/on-view.git
cd on-view
npm install
cp .env.example .env   # add Supabase credentials for studio features
npm run dev
```

| Command           | What it does                              |
| ----------------- | ----------------------------------------- |
| `npm run dev`     | Start the dev server                      |
| `npm run build`   | Typecheck and production build to `dist/` |
| `npm run preview` | Serve the production build locally        |

### Environment (studio only)

Copy `.env.example` → `.env`. Values are public (embedded in the client); no secrets in this file.

| Variable                 | Where to find it                                                                   |
| ------------------------ | ---------------------------------------------------------------------------------- |
| `VITE_SUPABASE_URL`      | Supabase → Project Settings → API                                                  |
| `VITE_SUPABASE_ANON_KEY` | Same page (`anon` key)                                                             |
| `VITE_PUBLIC_DEMO_ONLY`  | Optional; defaults to demo-only nav. Set `false` for full studio (local or hosted) |

### How it fits together

- **Demo** (`/show/demo`, `/studio/demo`): bundled data in `src/data/` (no Supabase).
- **Studio**: Postgres + Auth + Storage via Supabase; run **`supabase/schema.sql`** once on a new project.
- **Public shows** (`/show/:slug`): React SPA for visitors; link previews use **`api/show-meta`** (bot user-agents only, via `vercel.json`).

Schema, storage policies, deploy, troubleshooting: **[SETUP.md](./SETUP.md)**

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

## License

Personal project. All rights reserved unless otherwise noted.
