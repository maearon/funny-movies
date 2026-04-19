const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID
const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI
const SCOPE =
  process.env.NEXT_PUBLIC_SCOPE ??
  "https://www.googleapis.com/auth/youtube.force-ssl"

export function buildGoogleOAuthUrl(): string | null {
  if (!CLIENT_ID || !REDIRECT_URI) return null
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    scope: SCOPE,
  })
  return `https://accounts.google.com/o/oauth2/auth?${params.toString()}`
}

export function redirectToGoogleOAuth(): void {
  const url = buildGoogleOAuthUrl()
  if (!url) return
  window.location.href = url
}
