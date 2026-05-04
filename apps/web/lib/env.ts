/**
 * Central place for backend URLs (Rails API + Action Cable).
 * Set NEXT_PUBLIC_BACKEND_ORIGIN in .env for local/prod overrides.
 */
export const backendOrigin =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN ??
  (process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://funny-movies-b3dt.onrender.com")

export const apiBaseUrl = `${backendOrigin}/api`
