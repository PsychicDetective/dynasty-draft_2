// ─── YouTube highlight search ─────────────────────────────────────────────────

export interface VideoResult {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  channelTitle: string;
}

// Cache in-process to avoid quota burn for the same player
const videoCache = new Map<string, VideoResult | null>();

export async function findHighlightVideo(
  playerName: string,
  college: string,
  position: string
): Promise<VideoResult | null> {
  const cacheKey = `${playerName}::${college}`;
  if (videoCache.has(cacheKey)) return videoCache.get(cacheKey)!;

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.warn("[youtube] No API key configured");
    return null;
  }

  // Try college highlights first, fall back to NFL/general
  const queries = [
    `${playerName} ${college} highlights`,
    `${playerName} ${position} highlights`,
    `${playerName} NFL highlights`,
  ];

  for (const q of queries) {
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("key", apiKey);
    url.searchParams.set("q", q);
    url.searchParams.set("part", "snippet");
    url.searchParams.set("type", "video");
    url.searchParams.set("maxResults", "5");
    url.searchParams.set("videoDuration", "medium");
    url.searchParams.set("order", "relevance");

    try {
      const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
      if (!res.ok) continue;
      const data = await res.json();
      const items = data.items ?? [];

      // Filter out reaction/commentary videos
      const highlight = items.find((item: { id: { videoId: string }; snippet: { title: string; channelTitle: string; thumbnails: { medium: { url: string } } } }) => {
        const title: string = item.snippet.title.toLowerCase();
        return (
          !title.includes("reaction") &&
          !title.includes("review") &&
          !title.includes("mock draft") &&
          item.id.videoId
        );
      });

      if (highlight) {
        const result: VideoResult = {
          videoId: highlight.id.videoId,
          title: highlight.snippet.title,
          thumbnailUrl: highlight.snippet.thumbnails?.medium?.url ?? "",
          channelTitle: highlight.snippet.channelTitle,
        };
        videoCache.set(cacheKey, result);
        return result;
      }
    } catch (err) {
      console.error("[youtube] Search error:", err);
    }
  }

  videoCache.set(cacheKey, null);
  return null;
}
