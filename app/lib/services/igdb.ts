interface IgdbTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface IgdbImage {
  image_id: string;
}

interface IgdbGame {
  id: number;
  name: string;
  summary?: string;
  cover?: IgdbImage;
  platforms?: Array<{ name?: string } & { id?: number }>;
  release_dates?: Array<{ y?: number }>;
  rating?: number;
  slug?: string;
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
fields name,summary,cover.image_id,platforms.name,release_dates.y,rating,slug;
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
  return Array.isArray(data) ? data : [];
}

export function igdbCoverUrl(
  imageId: string,
  size: "cover_big" | "screenshot_big" = "cover_big"
) {
  return `${IGDB_IMAGE_BASE}/t_${size}/${imageId}.jpg`;
}
