interface IgdbTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface IgdbGame {
  id: number;
  name: string;
  summary?: string;
  cover?: { image_id?: string };
  platforms?: Array<{ name?: string } & { id?: number }>;
  release_dates?: Array<{ y?: number }>;
  rating?: number;
  slug?: string;
  videos?: Array<{ video_id?: string }>;
  websites?: Array<{ url?: string; category?: number }>;
  genres?: Array<{ name?: string }>;
}

interface IgdbTimeToBeat {
  game: number;
  hastily?: number;
  normally?: number;
  completely?: number;
}

const IGDB_IMAGE_BASE = "https://images.igdb.com/igdb/image/upload";

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getIgdbToken(): Promise<string | null> {
  const clientId = process.env.IGDB_CLIENT_ID;
  const clientSecret = process.env.IGDB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return null;
  }

  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60_000) {
    return cachedToken.token;
  }

  const response = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    { method: "POST" }
  );

  if (!response.ok) {
    console.warn("[igdb] token request failed", await response.text());
    return null;
  }

  const body = (await response.json()) as IgdbTokenResponse;
  cachedToken = {
    token: body.access_token,
    expiresAt: now + body.expires_in * 1000,
  };

  return cachedToken.token;
}

export async function searchIgdbGames(
  query: string,
  options?: { limit?: number }
): Promise<IgdbGame[]> {
  const token = await getIgdbToken();
  const clientId = process.env.IGDB_CLIENT_ID;
  if (!token || !clientId) {
    return [];
  }

  const limit = options?.limit ?? 10;

  const body = `search "${query}";
fields name,summary,cover.image_id,platforms.name,release_dates.y,rating,slug,videos.video_id,websites.url,websites.category,genres.name;
limit ${limit};`;

  const response = await fetch("https://api.igdb.com/v4/games", {
    method: "POST",
    headers: {
      "Client-ID": clientId,
      Authorization: `Bearer ${token}`,
      "Content-Type": "text/plain",
    },
    body,
  });

  if (!response.ok) {
    console.warn("[igdb] search failed", await response.text());
    return [];
  }

  const data = (await response.json()) as IgdbGame[];
  const results = Array.isArray(data) ? data : [];

  // Debug logging for summary field
  if (results.length > 0) {
    console.debug("[igdb] search results", {
      query,
      count: results.length,
      firstGame: {
        name: results[0]?.name,
        hasSummary: !!results[0]?.summary,
        summaryLength: results[0]?.summary?.length ?? 0,
        summaryPreview: results[0]?.summary?.slice(0, 100) ?? null,
      },
    });
  }

  return results;
}

export function igdbCoverUrl(
  imageId: string,
  size: "cover_big" | "screenshot_big" = "cover_big"
) {
  return `${IGDB_IMAGE_BASE}/t_${size}/${imageId}.jpg`;
}

export async function fetchIgdbTimeToBeat(
  gameId: number
): Promise<IgdbTimeToBeat | null> {
  const token = await getIgdbToken();
  const clientId = process.env.IGDB_CLIENT_ID;
  if (!token || !clientId) {
    return null;
  }

  const body = `fields game_id,hastily,normally,completely,count,updated_at; where game_id = ${gameId}; limit 1;`;

  const response = await fetch("https://api.igdb.com/v4/game_time_to_beats", {
    method: "POST",
    headers: {
      "Client-ID": clientId,
      Authorization: `Bearer ${token}`,
      "Content-Type": "text/plain",
    },
    body,
  });

  if (!response.ok) {
    console.warn("[igdb] time-to-beat fetch failed", await response.text());
    return null;
  }

  const data = (await response.json()) as IgdbTimeToBeat[];
  if (!Array.isArray(data) || data.length === 0) {
    console.debug("[igdb] time-to-beat empty", { gameId, data });
    return null;
  }

  console.debug("[igdb] time-to-beat", { gameId, record: data[0] });
  return data[0] ?? null;
}
