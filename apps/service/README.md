# Rails API (`apps/service`)

Rails 8 API-only app: JWT sessions, microposts (YouTube shares), relationships, mailers.

## Stack highlights

- **PostgreSQL** — primary DB (e.g. Neon).
- **Action Cable** — mounted at `/cable`; clients authenticate with `?token=<JWT>` (see `app/channels/application_cable/connection.rb`).
- **Solid Queue / Solid Cable** — jobs and Cable backed by DB in production (`config/cable.yml`, queue config).

## Generated artifacts (reference)

```bash
rails g model Micropost content:string title:string youtube_id:string user:references --skip-migration
rails g job notify_users
rails g channel notification
```

## Tests

```bash
bin/rails test
```

Focus areas for this project: `test/controllers/api/microposts_controller_test.rb`, `test/jobs/notify_users_job_test.rb`.

## Deployment

Ensure **both** web and **job worker** processes run when using `NotifyUsersJob` + Solid Queue (e.g. Render **Background Worker** running `bin/jobs` or equivalent).

See the repository root `README.md` for full setup, env vars, and reviewer instructions.
