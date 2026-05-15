import { NextRequest, NextResponse } from "next/server";

// 1x1 transparent GIF
const EMPTY_GIF = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64",
);

const noImageCache = new Set<string>();
const hasImageCache = new Set<string>();

export async function GET(req: NextRequest) {
  const playerId = req.nextUrl.searchParams.get("id");
  if (!playerId)
    return new NextResponse(EMPTY_GIF, {
      headers: { "Content-Type": "image/gif" },
    });

  if (noImageCache.has(playerId)) {
    return new NextResponse(EMPTY_GIF, {
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "public, max-age=86400",
      },
    });
  }

  if (hasImageCache.has(playerId)) {
    const res = await fetch(
      `https://sleepercdn.com/content/nfl/players/thumb/${playerId}.jpg`,
    );
    const buffer = await res.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  }

  try {
    const res = await fetch(
      `https://sleepercdn.com/content/nfl/players/thumb/${playerId}.jpg`,
      { signal: AbortSignal.timeout(3000) },
    );

    if (!res.ok) {
      noImageCache.add(playerId);
      return new NextResponse(EMPTY_GIF, {
        headers: {
          "Content-Type": "image/gif",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    hasImageCache.add(playerId);
    const buffer = await res.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    noImageCache.add(playerId);
    return new NextResponse(EMPTY_GIF, {
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "public, max-age=86400",
      },
    });
  }
}
