# Sonzai

AI music studio UI — country accent, genre, lyrics → song.

## Deploy the website (Vercel)

1. Import [idrisadebayoiaq/sonzai](https://github.com/idrisadebayoiaq/sonzai) into Vercel.
2. Set **Root Directory** to `apps/frontend`.
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy.

Auth and the create/library UI talk to Supabase directly. Song generation worker / ACE-Step come later.

## Local frontend

```bash
cd apps/frontend
cp .env.local.example .env.local
# fill anon key
npm install
npm run dev
```

Open http://localhost:3000

## Repo layout

- `apps/frontend` — Next.js site (deploy this)
- `services/api` — FastAPI (optional later)
- `services/worker` — GPU / demo worker (later)
- `packages/style-packs` — country/genre prompt packs
- `doc/` — build guides
