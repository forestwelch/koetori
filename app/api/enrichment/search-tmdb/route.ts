import { NextRequest, NextResponse } from "next/server";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

function buildTmdbUrl(
  path: string,
  apiKey: string | undefined,
  params: Record<string, string | number | undefined>
): string {
  const url = new URL(`${TMDB_BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    url.searchParams.set(key, String(value));
  }
  if (!process.env.TMDB_READ_ACCESS_TOKEN && apiKey) {
    url.searchParams.set("api_key", apiKey);
  }
  return url.toString();
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const year = searchParams.get("year");
  const mediaType = searchParams.get("type"); // 'movie' or 'tv'

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  const token = process.env.TMDB_READ_ACCESS_TOKEN;
  const apiKey = process.env.TMDB_API_KEY;
  if (!token && !apiKey) {
    return NextResponse.json(
      { error: "TMDb API credentials not configured" },
      { status: 500 }
    );
  }

  const headers: Record<string, string> = {
    accept: "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    // Use specific endpoint if media type is known, otherwise use multi search
    let searchPath = "/search/multi";
    if (mediaType === "movie") {
      searchPath = "/search/movie";
    } else if (mediaType === "tv") {
      searchPath = "/search/tv";
    }

    const params: Record<string, string | number | undefined> = {
      query: query.trim(),
      include_adult: "false",
      language: "en-US",
    };

    if (year) {
      const yearNum = Number.parseInt(year, 10);
      if (!Number.isNaN(yearNum) && yearNum >= 1900 && yearNum <= 2099) {
        params.year = yearNum;
      }
    }

    const searchUrl = buildTmdbUrl(searchPath, apiKey, params);
    const searchResp = await fetch(searchUrl, { headers });

    if (!searchResp.ok) {
      console.error(
        "TMDb search error:",
        searchResp.status,
        searchResp.statusText
      );
      return NextResponse.json({ results: [] });
    }

    const searchBody = (await searchResp.json()) as {
      results?: Array<{
        id: number;
        media_type?: string;
        title?: string;
        name?: string;
        release_date?: string;
        first_air_date?: string;
        popularity?: number;
        poster_path?: string;
      }>;
    };

    const results = (searchBody.results ?? [])
      .filter((result) => {
        // Filter to only movies/TV shows
        const type = result.media_type || mediaType || "movie";
        return type === "movie" || type === "tv";
      })
      .slice(0, 10) // Limit to top 10 results
      .map((result) => {
        const releaseDate = result.release_date ?? result.first_air_date ?? "";
        const releaseYear = releaseDate
          ? Number.parseInt(releaseDate.slice(0, 4), 10)
          : null;

        return {
          id: result.id,
          title: result.title ?? result.name ?? "",
          releaseYear: Number.isNaN(releaseYear) ? null : releaseYear,
          mediaType: (result.media_type || mediaType || "movie") as
            | "movie"
            | "tv",
          posterUrl: result.poster_path
            ? `https://image.tmdb.org/t/p/w92${result.poster_path}`
            : null,
          popularity: result.popularity ?? 0,
        };
      });

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error searching TMDb:", error);
    return NextResponse.json(
      { error: "Failed to search TMDb" },
      { status: 500 }
    );
  }
}
