# 🎧 BEAT PULSE

> A full-stack music streaming web app with adaptive visuals, synced lyrics, and a smart auto-queue — built on React, Supabase, and Jamendo's Creative Commons catalog.

![BEAT PULSE](https://img.shields.io/badge/status-active-00FF66?style=flat-square)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=flat-square&logo=supabase)

---

## 📖 Overview

BEAT PULSE is a production-ready music streaming interface built entirely on free and open tools. It streams millions of independent, Creative Commons tracks from Jamendo's public API, layered with a modern dark UI, adaptive ambient backgrounds, synchronized lyrics, and per-user libraries backed by Supabase.

**Live features**:

- 🎵 Streaming from Jamendo's 600k+ track catalog
- 🎨 Adaptive ambient backgrounds extracted from album art (ColorThief)
- 📊 Real-time frequency visualizer (Web Audio API)
- 🎤 Synced lyrics with line-by-line highlighting (LRCLIB)
- 🧠 Smart auto-queue that fills your queue based on genre + history
- ❤️ Liked songs, custom playlists, listening history — all persistent
- 🎯 Full-screen Focus Mode with large artwork and lyrics
- 📱 Responsive mobile layout with drawer sidebar and bottom sheet player
- ⌨️ Keyboard shortcuts + Media Session API (lock-screen controls)
- 📲 PWA-ready — installable, offline shell, cached assets

> **Note on catalog**: Jamendo carries **independent and Creative Commons music only**. There is no mainstream commercial music (Spotify/Apple catalog) and no global "Top Charts" from the mainstream music industry. The Trends page shows Jamendo's own popularity rankings.

---

## 🛠️ Tech Stack

### Frontend

| Layer | Technology |
|-------|-----------|
| Framework | **React 19** |
| Build tool | **Vite 6** |
| Styling | **Tailwind CSS v4** (with custom `@theme` tokens) |
| Animations | **Framer Motion** |
| Icons | **Lucide React** |
| Routing | **React Router v7** |
| State management | **Zustand** (with persist middleware) |
| Audio engine | **HTMLAudioElement + Web Audio API** |
| Color extraction | **ColorThief v3** |
| Lyrics | **LRCLIB API** + custom LRC parser |

### Backend

| Layer | Technology |
|-------|-----------|
| Database | **Supabase Postgres** |
| Auth | **Supabase Auth** (email/password) |
| Realtime | **Supabase Realtime** (likes + playlists cross-tab sync) |
| Storage | **Supabase Storage** (avatars, playlist covers) |
| Serverless | **Supabase Edge Functions** (Deno) |
| RLS | **Row Level Security** on every user-owned table |

### External APIs

| Service | Purpose |
|---------|---------|
| **Jamendo API v3.0** | Music catalog + streaming URLs |
| **LRCLIB** | Free synced lyrics (no API key) |

### Deployment

- **Vercel** — frontend (global CDN, auto-deploys from GitHub)
- **Supabase Cloud** — database, auth, storage, Edge Functions

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │   React UI   │  │   Zustand    │  │   Audio Engine        │  │
│  │              │◄─┤    Stores    ├──┤ (singleton, outside   │  │
│  │  - 3-col     │  │              │  │  React, owns <audio>) │  │
│  │  - FocusMode │  │  - player    │  │                       │  │
│  │  - PWA shell │  │  - library   │  │  MediaElementSource   │  │
│  │              │  │  - auth      │  │    → AnalyserNode     │  │
│  └──────┬───────┘  └──────┬───────┘  │    → GainNode         │  │
│         │                 │          │    → destination       │  │
│         │                 │          └───────────┬───────────┘  │
│         │                 │                      │              │
│         │        ┌────────▼────────┐             │              │
│         │        │  Supabase SDK   │             │              │
│         │        └────────┬────────┘             │              │
│         │                 │                      │              │
└─────────┼─────────────────┼──────────────────────┼──────────────┘
          │                 │                      │
          │ HTTP/WS         │ HTTPS                │ Audio Stream
          │                 │                      │
┌─────────▼─────────────────▼─────────┐   ┌────────▼────────────┐
│         SUPABASE CLOUD              │   │   JAMENDO CDN       │
│                                     │   │                     │
│  ┌───────────────────────────────┐  │   │  Direct MP3 stream  │
│  │  Postgres                     │  │   │  (with CORS)        │
│  │  - profiles                   │  │   └─────────────────────┘
│  │  - tracks (cached Jamendo)    │  │
│  │  - liked_songs                │  │   ┌─────────────────────┐
│  │  - playlists                  │  │   │   LRCLIB API        │
│  │  - playlist_tracks            │  │◄──┤  Synced lyrics      │
│  │  - listening_history          │  │   └─────────────────────┘
│  │  - daily_mixes                │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  Edge Functions (Deno)        │  │
│  │  - jamendo-proxy   ← CORS fix │  │
│  │  - search-tracks              │  │
│  │  - auto-queue                 │  │
│  │  - build-daily-mix (cron)     │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  Realtime (WS)                │  │
│  │  - liked_songs changes        │  │
│  │  - playlists changes          │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  Storage                      │  │
│  │  - avatars/                   │  │
│  │  - playlist-covers/           │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Key architectural decisions

**1. Audio engine lives outside React**
Web Audio's `createMediaElementSource` can only be called **once per element**. Creating it inside a component would break on re-render. Instead, a module-level singleton owns the `<audio>` element, subscribes to Zustand, and pushes playback state back into the store.

**2. All Jamendo traffic goes through an Edge Function**
Jamendo's API doesn't send CORS headers, so browsers block direct requests. `jamendo-proxy` forwards calls server-side, attaches the client ID from Supabase secrets, and returns JSON with proper CORS headers.

**3. Server state vs client state is split**
- **Server state**: liked songs, playlists, history, daily mixes → Supabase, synced via React Query-style manual fetches
- **Client state**: current track, queue, playback position, volume → Zustand with `persist` (only volume, repeat, shuffle survive reloads)

**4. Tracks are cached locally**
Every Jamendo fetch upserts into the `tracks` table. Auto-queue and search query the local cache first, hitting Jamendo only when the cache is thin. This keeps the app fast and reduces API calls.

**5. RLS on every table, always**
Every user-owned table (liked_songs, playlists, playlist_tracks, listening_history) has RLS enabled with `auth.uid() = user_id` policies. The `tracks` table is public read, authenticated write.

**6. Guest mode**
Unauthenticated users can browse and play any track. Every gated feature (like, playlist, history) opens an auth modal instead of silently failing.

---

## 📁 Project Structure

```
beat-pulse/
├── public/
│   ├── favicon.svg
│   ├── favicon.ico
│   ├── apple-touch-icon.png
│   ├── manifest.webmanifest
│   └── icons/
│       ├── icon-192.png
│       └── icon-512.png
├── src/
│   ├── components/
│   │   ├── auth/          # AuthModal
│   │   ├── cards/         # PlaylistCard, TrackRow
│   │   ├── layout/        # Sidebar, MainView, RightPanel, RightPanelSheet
│   │   ├── library/       # LikedButton, AddToPlaylistMenu
│   │   ├── player/        # PlayerBar, PlayerSheet, FocusMode, Visualizer, ProgressBar, LyricsPanel, QueuePanel
│   │   └── ui/            # Toast, Skeleton, NotificationsBell
│   ├── hooks/
│   │   ├── useAdaptivePalette.js
│   │   ├── useAutoQueue.js
│   │   ├── useKeyboardShortcuts.js
│   │   ├── useListeningHistory.js
│   │   ├── useMediaQuery.js
│   │   ├── useMediaSession.js
│   │   ├── useRealtimeSync.js
│   │   └── useSearch.js
│   ├── lib/
│   │   ├── audioEngine.js       # Singleton <audio> + Web Audio graph
│   │   ├── autoQueue.js         # Queue refill logic
│   │   ├── colorExtractor.js    # ColorThief wrapper
│   │   ├── jamendo.js           # Jamendo API client
│   │   ├── library.js           # Supabase query helpers
│   │   ├── lrc.js               # LRC parser + LRCLIB fetch
│   │   ├── search.js            # Search pipeline
│   │   ├── supabaseClient.js
│   │   ├── syncTracks.js
│   │   └── transformers.js      # Jamendo ↔ DB ↔ UI shapes
│   ├── pages/
│   │   ├── FavoriteArtists.jsx
│   │   ├── Library.jsx
│   │   ├── LikedSongs.jsx
│   │   ├── Playlists.jsx
│   │   ├── Profile.jsx
│   │   ├── Search.jsx
│   │   └── Trends.jsx
│   ├── store/
│   │   ├── authStore.js
│   │   ├── libraryStore.js
│   │   ├── playerStore.js
│   │   └── selectors.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── supabase/
│   └── functions/
│       ├── jamendo-proxy/index.ts
│       ├── search-tracks/index.ts
│       ├── auto-queue/index.ts
│       └── build-daily-mix/index.ts
├── .env.local               # NOT committed
├── vercel.json              # SPA rewrite rules
├── vite.config.js
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20 LTS or newer
- **npm** 10+
- A **Supabase** account (free tier is fine)
- A **Jamendo** developer account ([developer.jamendo.com](https://developer.jamendo.com))
- **Supabase CLI** (`npm install -g supabase`)

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/beat-pulse.git
cd beat-pulse
npm install
```

### 2. Environment variables

Create `.env.local` in the project root:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxxxxxx
VITE_JAMENDO_CLIENT_ID=your-jamendo-client-id
```

### 3. Set up Supabase

Run the SQL migrations in order in the Supabase SQL Editor:

1. `supabase/migrations/001_initial_schema.sql` — profiles, tracks, liked_songs, playlists, playlist_tracks, listening_history
2. `supabase/migrations/002_rls_policies.sql` — RLS on every table
3. `supabase/migrations/003_library.sql` — daily_mixes, user_top_artists view
4. `supabase/migrations/004_realtime_search.sql` — realtime publication, full-text search

Or push all migrations at once:

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

### 4. Set Edge Function secrets

```bash
supabase secrets set JAMENDO_CLIENT_ID=your-jamendo-client-id
```

### 5. Deploy Edge Functions

```bash
supabase functions deploy jamendo-proxy
supabase functions deploy search-tracks
supabase functions deploy auto-queue
supabase functions deploy build-daily-mix
```

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### 7. Build for production

```bash
npm run build
npm run preview
```

---

## 🔑 Environment Variables Reference

| Variable | Where | Purpose |
|----------|-------|---------|
| `VITE_SUPABASE_URL` | `.env.local` + Vercel | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `.env.local` + Vercel | Public anon key for client |
| `VITE_JAMENDO_CLIENT_ID` | `.env.local` only | Local fallback for Jamendo calls |
| `JAMENDO_CLIENT_ID` | Supabase secrets | Used by Edge Functions |
| `SUPABASE_URL` | Auto-injected in Edge Functions | Runtime-only |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-injected in Edge Functions | Runtime-only |

---

## 🗄️ Database Schema

```
profiles                → user metadata (extends auth.users)
tracks                  → cached Jamendo metadata
liked_songs             → many-to-many user ↔ tracks
playlists               → user-created playlists
playlist_tracks         → ordered junction table
listening_history       → playback log (30s+ threshold)
daily_mixes             → generated mixes (refreshed by cron)
user_top_artists (view) → aggregated artist play counts
```

Full schema is in `supabase/migrations/`.

### RLS policy summary

| Table | Select | Insert | Update | Delete |
|-------|--------|--------|--------|--------|
| `profiles` | Public | Trigger on signup | Own | — |
| `tracks` | Public | Authenticated | Authenticated | — |
| `liked_songs` | Own | Own | — | Own |
| `playlists` | Own + public | Own | Own | Own |
| `playlist_tracks` | Via playlist access | Via playlist ownership | Via playlist ownership | Via playlist ownership |
| `listening_history` | Own | Own | Own | — |
| `daily_mixes` | Own | Service role (cron) | — | — |

---

## 🎨 Design System

Custom Tailwind v4 theme tokens defined in `src/index.css`:

| Token | Value | Usage |
|-------|-------|-------|
| `--color-base` | `#0B0B0E` | App background |
| `--color-surface` | `#121216` | Sidebar, panel surfaces |
| `--color-card` | `#1A1A22` | Elevated cards, hover states |
| `--color-accent` | `#00FF66` | Neon mint — buttons, active states |
| `--color-text-primary` | `#FFFFFF` | Titles, primary text |
| `--color-text-secondary` | `#A1A1AA` | Body text, labels |
| `--color-text-muted` | `#71717A` | Metadata, timestamps |

Font: **Plus Jakarta Sans** (Google Fonts), weights 400–800.

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play / pause |
| `→` / `←` | Seek ±5s |
| `Shift + →` | Next track |
| `Shift + ←` | Previous track |
| `↑` / `↓` | Volume ±5% |
| `M` | Mute |
| `F` | Focus Mode |
| `S` | Shuffle |
| `R` | Cycle repeat |
| `/` | Focus search |
| `Esc` | Exit Focus Mode |

---

## 🧪 Testing

```bash
# Unit tests (Vitest)
npm run test

# E2E tests (Playwright)
npm run test:e2e

# Type check
npm run typecheck

# Lint
npm run lint
```

---

## 🚢 Deployment

### Frontend (Vercel)

1. Push to GitHub
2. Import repo at [vercel.com/new](https://vercel.com/new)
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in environment variables
4. Deploy

`vercel.json` contains the SPA rewrite rule so client-side routes don't 404 on refresh.

### Backend (Supabase)

```bash
supabase link --project-ref YOUR_REF
supabase db push
supabase functions deploy
supabase secrets set JAMENDO_CLIENT_ID=xxx
```

### Auth redirects

Add your production domain to Supabase → **Authentication → URL Configuration → Redirect URLs**.

---

## ⚠️ Known Limitations

- **No mainstream music**: Jamendo is a Creative Commons platform. Mainstream artists (Spotify/Apple catalog) are not available. Trends reflects Jamendo's own popularity, not global charts.
- **Free-tier rate limits**: Jamendo caps free non-commercial apps at 35,000 requests/month. Track caching mitigates this.
- **Lyrics coverage**: LRCLIB has synced lyrics for a fraction of Jamendo's catalog. Many tracks fall back to "No synced lyrics available".
- **Artist image lookup**: Jamendo's `namesearch` matches on exact strings. Artists with inconsistent naming across tracks may show a fallback initial circle.
- **Realtime channels**: Each browser tab opens one channel per user. Heavy tab counts (> 20) can approach Supabase free-tier connection limits.
- **Cron for daily mixes**: Requires enabling `pg_cron` and `pg_net` extensions plus manual schedule setup in Supabase. Without it, mixes only generate when manually triggered.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the `LICENSE` file for details.

Music content is provided by [Jamendo](https://www.jamendo.com) under their respective Creative Commons licenses. Lyrics are provided by [LRCLIB](https://lrclib.net). Neither is covered by this project's license.

---

## 🙏 Acknowledgments

- [Jamendo](https://developer.jamendo.com) — free Creative Commons music API
- [Supabase](https://supabase.com) — backend infrastructure
- [LRCLIB](https://lrclib.net) — free synced lyrics
- [Lucide](https://lucide.dev) — icon set
- [Framer Motion](https://www.framer.com/motion/) — animation library
- [Tailwind CSS](https://tailwindcss.com) — utility-first styling

---

## 📬 Contact

**Your Name** — [@yourhandle](https://twitter.com/yourhandle)
Project Link: [https://github.com/YOUR_USERNAME/beat-pulse](https://github.com/YOUR_USERNAME/beat-pulse)

---

<p align="center">
  Built with ❤️ and a lot of <code>console.log()</code>
</p>