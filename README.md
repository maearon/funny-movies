# YouTube Video Sharing App

## Introduction

This project is a full-stack web application for sharing YouTube videos with  all users logged in online.

**Purpose:** registered users paste a normal YouTube URL (watch, shorts, embed, or `youtu.be`). The app resolves the video ID, loads the title via **YouTube Data API v3**, stores the **original URL**, **title**, and **`youtube_id`** in PostgreSQL, and shows the video in an embed iframe. **Google OAuth** is used only for the YouTube **rate (like/dislike)** API, which requires a user access token.

**Key features**

- JWT-based registration/login (Rails API + Next.js client).
- Feed of shared videos with pagination (Micropost list).
- **Real-time notifications:** when a user shares a video, other logged-in clients receive a WebSocket message (Action Cable) and a **toast** (react-toastify / `flashMessages`).
- Background job (`NotifyUsersJob`) broadcasts the notification after the micropost is saved (Solid Queue in production).
- Unit tests: Vitest (URL parsing) and Rails minitest (micropost create + job broadcast).

**Repository layout**

| Path | Stack | Role |
|------|--------|------|
| `apps/web` | Next.js 16, React 19, Bootstrap 3 (CSS), Redux | Frontend |
| `apps/service` | Rails 8 API, PostgreSQL, Action Cable, Solid Queue/Cable | Backend |

**Deployed (example)**

- Frontend: Vercel — `https://funny-movies-pied.vercel.app`
- Backend: Render — `https://funny-movies-b3dt.onrender.com`

Configure the frontend with `NEXT_PUBLIC_BACKEND_ORIGIN` pointing at your Rails host so REST and WebSockets use the same origin.

---

## Prerequisites

| Tool | Notes |
|------|--------|
| Git | Frequent commits expected by the brief |
| Node.js | e.g. v22+ (project tested with modern LTS) |
| npm | Package manager for `apps/web` |
| Ruby / Rails | Ruby 4.x, Rails 8.1.x for `apps/service` |
| PostgreSQL | Local or hosted (e.g. Neon); DB URL via env |
| Docker (optional) | For containerized local run if you add/keep compose |

---

## Installation & configuration

### Clone

```bash
git clone git@github.com:maearon/funny-movies.git
cd funny-movies
```

### Backend (`apps/service`)

```bash
cd apps/service
bundle install
```

Copy environment template (create `.env` or use hosting env vars). Required concepts:

- `POSTGRES_*` (`POSTGRES_DATABASE`, `POSTGRES_HOST`, `POSTGRES_USER`, `POSTGRES_PASSWORD`) or `POSTGRES_URL` / `DATABASE_URL` — database connection.
- `RAILS_MASTER_KEY` or credentials for `secret_key_base` (JWT signing).
- `FRONTEND_URL` for use in mail templates.
- Optional: `SMTP_*` (`SMTP_USERNAME`, `SMTP_PASSWORD`) vars for mailers.

### Frontend (`apps/web`)

```bash
cd apps/web
npm install
```

Create `.env.local` (never commit secrets). Typical variables:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_BACKEND_ORIGIN` | Rails base URL, e.g. `http://localhost:3000` or your Render URL |
| `NEXT_PUBLIC_API_KEY` | YouTube Data API key (snippet lookup when sharing) |
| `NEXT_PUBLIC_CLIENT_ID` | Google OAuth Web client ID (YouTube rating scope) |
| `NEXT_PUBLIC_REDIRECT_URI` | Must match Google Cloud Console (e.g. `http://localhost:3001/` for dev) |
| `NEXT_PUBLIC_SCOPE` | Optional; defaults to `https://www.googleapis.com/auth/youtube.force-ssl` in code |
| `GOOGLE_CLIENT_ID` | Same as `NEXT_PUBLIC_CLIENT_ID` (used by `/api/google-token`) |
| `GOOGLE_CLIENT_SECRET` | Web client secret — **server only** |
| `GOOGLE_OAUTH_REDIRECT_URI` | Same as `NEXT_PUBLIC_REDIRECT_URI` |

Token exchange runs through **`POST /api/google-token`** so the client secret is not exposed in the browser.

---

## Database setup

The canonical schema for local use should live in `apps/service/db/schema.rb` after migrations. This repo also keeps **`db/migrate_old`** and SQL notes where the hosted DB was altered manually (e.g. adding `title`, `youtube_id` on `microposts`, and `VIDEO_SHARED` on `NotificationType`) when migrations were not run against Neon.

1. Create a PostgreSQL database (local or Neon).
2. Set `DATABASE_URL` / `POSTGRES_URL` / per-field `POSTGRES_*` as in `config/database.yml`.
3. When possible, run:

```bash
git config --global core.autocrlf input
sudo apt update
sudo apt install dos2unix
find . -type f -exec dos2unix {} +
git add --renormalize .
git commit -m "Normalize line endings to LF"
cd apps/service
rails db:schema:dump
bin/rails db:setup
bin/rails db:prepare
```

If you only use a remote DB that already has tables, point Rails at that URL and avoid destructive commands.

---

## Running the application

**Docker**

```bash
docker compose up --build
```

**Ports (default in this repo)**

- Rails API + Action Cable: **3000**
- Next.js: **3001** (`npm run dev` in `apps/web`)

**Rails**

```bash
cd apps/service
bin/rails server -p 3000
```

**Next.js**

```bash
cd apps/web
npm run dev
```

Open `http://localhost:3001`.

**CORS** is configured in `apps/service/config/initializers/cors.rb` for `http://localhost:3001` and the Vercel app origin.

**Action Cable**

- Browser connects to `{NEXT_PUBLIC_BACKEND_ORIGIN}/cable?token=<JWT>`.
- Connection rejects guests without a valid JWT.

**Background jobs (notifications)**

- In production, Solid Queue processes `NotifyUsersJob`. Ensure a **worker process** runs (e.g. Render background worker or `bin/jobs`) so broadcasts are not stuck in the queue.

---

## Docker deployment (optional)

Add or adjust `docker-compose` at the repo root so reviewers can run API + web + DB with one command. Build images from `apps/service` (Dockerfile if present) and `apps/web`, pass env files, and publish ports 3000 / 3001.

---

## Usage (for reviewers)

1. Register and log in.
2. On **Home** or **Share a movie**, paste a YouTube URL such as  
   `https://www.youtube.com/watch?v=pRdv7lDoqIo&list=...`  
   The app extracts the id, fetches the title from YouTube Data API v3, and saves **original URL + title + youtube_id**.
3. The feed shows the embed (`/embed/{youtube_id}`) and a link to the **original** URL.
4. Click **Like / Dislike** (Font Awesome icons): if not connected to Google for YouTube, you are redirected through OAuth; tokens are stored as `youtube_oauth_token` (separate from the app JWT).
5. With two browsers/sessions, share a video as user A: user B should see a **toast** with sharer name and video title (Action Cable + `NotifyUsersJob`).

---

## Testing

**Frontend (Vitest)**

```bash
cd apps/web
npm test
```

Covers YouTube URL parsing (`lib/youtube.test.ts`).

**Backend (Rails)**

Install PostgreSQL 18 installer (Windows)

```bash
cd apps/service
RAILS_ENV=test bin/rails db:drop db:create db:migrate
bin/rails g migration AddRefreshTokenToUsers refresh_token:string refresh_token_expiration_at:datetime
RAILS_ENV=test bin/rails db:migrate
bin/rails routes | grep microposts
bin/rails test test/controllers/api/microposts_controller_test.rb
bin/rails test test/controllers/api/sessions_controller_test.rb
bin/rails test test/controllers/api/relationships_controller.rb
bin/rails test test/controllers/api/users_controller.rb
bin/rails test
bin/rails test test/models/user_test.rb
bin/rails test test/models/micropost_test.rb
bin/rails test test/models/relationship_test.rb
```

Includes integration tests for authenticated micropost creation and job broadcast (see `test/controllers/api/microposts_controller_test.rb`, `test/jobs/notify_users_job_test.rb`).

---

## Troubleshooting

| Issue | What to try |
|-------|-------------|
| WebSocket fails on Vercel → Render | Set `NEXT_PUBLIC_BACKEND_ORIGIN` to the Render HTTPS URL; ensure Render allows your Vercel origin in `config/environments/production.rb` (`action_cable.allowed_request_origins`). |
| Notifications only after refresh | Run Solid Queue worker / `bin/jobs` so `NotifyUsersJob` executes. |
| FormData micropost errors | Axios must not force `application/json` on multipart bodies (handled in `components/shared/api/index.tsx`). |
| OAuth redirect mismatch | `NEXT_PUBLIC_REDIRECT_URI` / `GOOGLE_OAUTH_REDIRECT_URI` must exactly match Google Cloud Console. |
| JWT/Cable disconnect | Token must be passed as `token` query param; use the same access token as the REST API. |

---

## Production architecture notes (free tier friendly)

- **Solid Cable** (Rails 8) can use PostgreSQL for Cable traffic — fits **Neon** free tier without adding Redis.
- **Solid Queue** uses PostgreSQL — no **Redis** required for this stack on Render’s free/hobby tier.
- If you later switch to **Sidekiq** or Redis Action Cable, **Upstash Redis** has a usable free tier and works with TLS from Render/Vercel-style hosting.
