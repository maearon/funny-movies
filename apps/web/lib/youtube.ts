const ID_RE = "[a-zA-Z0-9_-]{11}"

/**
 * Extract YouTube video id from watch, embed, shorts, youtu.be, or live URLs.
 */
export function extractYoutubeVideoId(raw: string): string | null {
  if (!raw?.trim()) return null
  const url = raw.trim()

  const tryPatterns: RegExp[] = [
    new RegExp(`(?:youtube\\.com\\/watch\\?[^#]*\\bv=)(${ID_RE})`),
    new RegExp(`youtu\\.be\\/(${ID_RE})`),
    new RegExp(`youtube\\.com\\/embed\\/(${ID_RE})`),
    new RegExp(`youtube\\.com\\/shorts\\/(${ID_RE})`),
    new RegExp(`youtube\\.com\\/live\\/(${ID_RE})`),
    new RegExp(`youtube\\.com\\/v\\/(${ID_RE})`),
  ]

  for (const re of tryPatterns) {
    const m = url.match(re)
    if (m?.[1]) return m[1]
  }

  try {
    const u = new URL(url)
    if (u.hostname.includes("youtube.com") && u.searchParams.get("v")) {
      const v = u.searchParams.get("v")
      if (v && new RegExp(`^${ID_RE}$`).test(v)) return v
    }
  } catch {
    return null
  }

  return null
}

export function embedUrlFromVideoId(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`
}
