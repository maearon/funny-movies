import { NextResponse } from "next/server"

/**
 * Exchange OAuth authorization code for tokens without exposing the client secret to the browser.
 */
export async function POST(request: Request) {
  let body: { code?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const code = body.code
  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 })
  }

  const clientId = process.env.GOOGLE_CLIENT_ID ?? process.env.NEXT_PUBLIC_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET ?? process.env.CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json(
      { error: "Server missing Google OAuth configuration" },
      { status: 500 },
    )
  }

  const params = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  })

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  })

  const data = await tokenRes.json().catch(() => ({}))
  if (!tokenRes.ok) {
    return NextResponse.json(
      { error: data.error_description ?? data.error ?? "Token exchange failed" },
      { status: tokenRes.status },
    )
  }

  return NextResponse.json(data)
}
