import flashMessage from "@/components/shared/flashMessages"

const API_KEY = process.env.NEXT_PUBLIC_API_KEY

export interface YoutubeSnippetDetails {
  title: string
  description: string
  videoId: string
  channelTitle: string
}

/**
 * Public YouTube Data API v3 — uses API key only (no OAuth).
 */
export async function fetchYoutubeVideoDetails(
  videoId: string,
): Promise<YoutubeSnippetDetails | null> {
  if (!API_KEY) {
    flashMessage("error", "Missing NEXT_PUBLIC_API_KEY for YouTube Data API")
    return null
  }

  const url = `https://www.googleapis.com/youtube/v3/videos?id=${encodeURIComponent(videoId)}&key=${encodeURIComponent(API_KEY)}&part=snippet`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`YouTube API HTTP ${response.status}`)
    }
    const data = await response.json()
    const item = data.items?.[0]?.snippet
    if (!item) {
      flashMessage("warning", "Video not found or unavailable")
      return null
    }

    const desc: string = item.description ?? ""
    return {
      title: item.title,
      description: desc.length > 240 ? `${desc.substring(0, 240)}…` : desc,
      videoId,
      channelTitle: item.channelTitle ?? "",
    }
  } catch {
    flashMessage("error", "Could not load video details from YouTube")
    return null
  }
}
