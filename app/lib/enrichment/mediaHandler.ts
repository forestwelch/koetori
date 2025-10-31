import { MediaEnrichmentPayload } from "../pipeline/types";
import { EnrichmentJobResult, MediaItemDraft } from "./types";

const OMDB_ENDPOINT = "https://www.omdbapi.com/";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";
const TMDB_DEFAULT_REGION = process.env.TMDB_DEFAULT_REGION ?? "US";

interface TmdbSearchResult {
  id: number;
  media_type: "movie" | "tv" | "person" | string;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  popularity?: number;
}

interface TmdbSearchResponse {
  results?: TmdbSearchResult[];
}

interface TmdbGenre {
  name?: string;
}

interface TmdbProviderEntry {
  provider_name?: string;
}

interface TmdbProvidersRegion {
  flatrate?: TmdbProviderEntry[];
  ads?: TmdbProviderEntry[];
  rent?: TmdbProviderEntry[];
  buy?: TmdbProviderEntry[];
}

interface TmdbProvidersResponse {
  results?: Record<string, TmdbProvidersRegion>;
}

interface TmdbVideoEntry {
  site?: string;
  type?: string;
  key?: string;
}

interface TmdbVideosResponse {
  results?: TmdbVideoEntry[];
}

interface TmdbReleaseWindow {
  certification?: string;
}

interface TmdbReleaseEntry {
  iso_3166_1?: string;
  release_dates?: TmdbReleaseWindow[];
}

interface TmdbReleaseDatesResponse {
  results?: TmdbReleaseEntry[];
}

interface TmdbDetailResponse {
  id?: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  runtime?: number;
  episode_run_time?: number[];
  poster_path?: string;
  backdrop_path?: string;
  overview?: string;
  vote_average?: number;
  genres?: TmdbGenre[];
  external_ids?: { imdb_id?: string };
  videos?: TmdbVideosResponse;
  "watch/providers"?: TmdbProvidersResponse;
  release_dates?: TmdbReleaseDatesResponse;
}

export async function handleMediaTask(
  payload: MediaEnrichmentPayload
): Promise<EnrichmentJobResult> {
  const title = payload.probableTitle ?? deriveTitleFromHints(payload);

  if (!title) {
    return {
      status: "skipped",
      type: "media",
      reason: "Could not infer media title from memo extract.",
    };
  }

  const draft: MediaItemDraft = {
    title,
    releaseYear: payload.probableYear ?? null,
    overview: payload.transcriptExcerpt ?? null,
    mediaType: payload.probableMediaType ?? "unknown",
  };

  const tmdbResult = await fetchFromTmdb(title, payload);
  if (tmdbResult) {
    return {
      status: "completed",
      type: "media",
      draft: { ...draft, ...tmdbResult },
      payload,
    };
  }

  const omdbResult = await fetchFromOmdb(title, payload.probableYear);
  if (omdbResult) {
    return {
      status: "completed",
      type: "media",
      draft: { ...draft, ...omdbResult },
      payload,
    };
  }

  return {
    status: "completed",
    type: "media",
    draft,
    payload,
  };
}

function deriveTitleFromHints(payload: MediaEnrichmentPayload) {
  if (payload.extracted) {
    const candidate = payload.extracted.title ?? payload.extracted.name;
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  if (payload.tags) {
    const taggedTitle = payload.tags.find((tag) => tag.length > 3);
    if (taggedTitle) {
      return taggedTitle;
    }
  }

  if (payload.rawTextHints) {
    const hint = payload.rawTextHints.find((text) => text.length > 3);
    if (hint) {
      return hint;
    }
  }

  return null;
}

function parseRuntime(runtime?: string | null): number | null {
  if (!runtime || runtime === "N/A") return null;
  const match = /(\d+)\s*min/i.exec(runtime);
  if (match?.[1]) {
    const minutes = Number.parseInt(match[1], 10);
    return Number.isNaN(minutes) ? null : minutes;
  }
  return null;
}

async function fetchFromOmdb(
  title: string,
  year?: number | null
): Promise<Partial<MediaItemDraft> | null> {
  const apiKey = process.env.OMDB_API_KEY;
  if (!apiKey) return null;

  try {
    const detail = await fetchOmdbDetails(apiKey, title, year);
    if (!detail) return null;

    return {
      title: detail.Title ?? title,
      releaseYear: detail.Year
        ? Number.parseInt(detail.Year, 10)
        : (year ?? null),
      runtimeMinutes: parseRuntime(detail.Runtime),
      posterUrl:
        detail.Poster && detail.Poster !== "N/A" ? detail.Poster : null,
      overview: detail.Plot && detail.Plot !== "N/A" ? detail.Plot : undefined,
      trailerUrl:
        detail.Website && detail.Website !== "N/A" ? detail.Website : undefined,
      ratings: Array.isArray(detail.Ratings)
        ? detail.Ratings.map((rating) => ({
            source: rating.Source,
            value: rating.Value,
          }))
        : undefined,
      platforms: undefined,
      providers: undefined,
      imdbId: detail.imdbID ?? null,
    } satisfies Partial<MediaItemDraft>;
  } catch (error) {
    console.warn("[enrichment:media] omdb-fallback-failed", {
      title,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

async function fetchFromTmdb(
  title: string,
  payload: MediaEnrichmentPayload
): Promise<Partial<MediaItemDraft> | null> {
  const token = process.env.TMDB_READ_ACCESS_TOKEN;
  const apiKey = process.env.TMDB_API_KEY;
  if (!token && !apiKey) {
    return null;
  }

  const headers: Record<string, string> = {
    accept: "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const searchUrl = buildTmdbUrl("/search/multi", apiKey, {
    query: title,
    include_adult: "false",
    language: "en-US",
  });

  const searchResp = await fetch(searchUrl, { headers });
  if (!searchResp.ok) {
    return null;
  }

  const searchBody = (await searchResp.json()) as TmdbSearchResponse;

  const results = (searchBody.results ?? []).filter(
    (result) => result.media_type === "movie" || result.media_type === "tv"
  );
  if (results.length === 0) {
    return null;
  }

  const preferredType = payload.probableMediaType;
  const sorted = results.sort((a, b) => {
    const scoreA = scoreSearchResult(a, preferredType, payload.probableYear);
    const scoreB = scoreSearchResult(b, preferredType, payload.probableYear);
    return scoreB - scoreA;
  });

  const target = sorted[0];
  if (!target) return null;

  const detailUrl = buildTmdbUrl(`/${target.media_type}/${target.id}`, apiKey, {
    append_to_response: "external_ids,watch/providers,videos,release_dates",
    language: "en-US",
  });

  const detailResp = await fetch(detailUrl, { headers });
  if (!detailResp.ok) {
    return null;
  }

  const detail = (await detailResp.json()) as TmdbDetailResponse;

  const releaseDate = detail.release_date ?? detail.first_air_date ?? null;
  const releaseYear = releaseDate
    ? Number.parseInt(releaseDate.slice(0, 4), 10)
    : null;
  const runtimeMinutes = detail.runtime
    ? Number(detail.runtime)
    : Array.isArray(detail.episode_run_time) &&
        detail.episode_run_time.length > 0
      ? Number(detail.episode_run_time[0])
      : null;

  const posterUrl = detail.poster_path
    ? `${TMDB_IMAGE_BASE}/w342${detail.poster_path}`
    : null;
  const backdropUrl = detail.backdrop_path
    ? `${TMDB_IMAGE_BASE}/w780${detail.backdrop_path}`
    : null;
  const trailerUrl = extractTrailer(detail?.videos);
  const providers = extractProviders(detail?.["watch/providers"]);
  const genres = Array.isArray(detail?.genres)
    ? detail.genres
        .map((genre: { name?: string }) => genre?.name)
        .filter(
          (name: unknown): name is string =>
            typeof name === "string" && name.length > 0
        )
    : undefined;

  const ratings = buildRatings(detail);

  return {
    title: detail.title ?? detail.name ?? title,
    releaseYear,
    runtimeMinutes,
    posterUrl,
    backdropUrl,
    overview: detail.overview ?? payload.transcriptExcerpt ?? null,
    trailerUrl,
    providers,
    platforms: providers,
    genres,
    ratings,
    tmdbId: detail.id ? String(detail.id) : undefined,
    imdbId: detail.external_ids?.imdb_id ?? null,
    mediaType:
      target.media_type === "movie" || target.media_type === "tv"
        ? target.media_type
        : (payload.probableMediaType ?? "unknown"),
  } satisfies Partial<MediaItemDraft>;
}

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

function scoreSearchResult(
  result: {
    media_type: string;
    popularity?: number;
    release_date?: string;
    first_air_date?: string;
  },
  preferredType: MediaEnrichmentPayload["probableMediaType"],
  probableYear?: number | null
): number {
  let score = result.popularity ?? 0;
  const normalizedPreferred =
    preferredType === "movie" || preferredType === "tv"
      ? preferredType
      : undefined;
  if (normalizedPreferred && result.media_type === normalizedPreferred) {
    score += 50;
  }
  const release = result.release_date ?? result.first_air_date ?? "";
  if (probableYear && release.startsWith(String(probableYear))) {
    score += 25;
  }
  return score;
}

function extractTrailer(videos: TmdbVideosResponse | undefined): string | null {
  if (!videos || !Array.isArray(videos.results)) return null;
  const trailers = (videos.results as TmdbVideoEntry[]).filter(
    (video: TmdbVideoEntry) =>
      video.site?.toLowerCase() === "youtube" &&
      (video.type === "Trailer" || video.type === "Teaser") &&
      Boolean(video.key)
  );
  if (trailers.length === 0) return null;
  return `https://www.youtube.com/watch?v=${trailers[0].key}`;
}

function extractProviders(
  providersResponse: TmdbProvidersResponse | undefined
): string[] | undefined {
  const results = providersResponse?.results;
  if (!results) return undefined;

  const regionEntry =
    results[TMDB_DEFAULT_REGION] ?? results[Object.keys(results)[0]];
  if (!regionEntry) return undefined;

  const sections = ["flatrate", "ads", "rent", "buy"];
  const providerNames: string[] = [];

  for (const section of sections) {
    const providers = regionEntry[section as keyof TmdbProvidersRegion];
    if (Array.isArray(providers)) {
      for (const provider of providers) {
        if (provider?.provider_name) {
          providerNames.push(provider.provider_name);
        }
      }
    }
  }

  const unique = Array.from(new Set(providerNames));
  return unique.length > 0 ? unique : undefined;
}

function buildRatings(
  detail: TmdbDetailResponse
): Array<{ source: string; value: string }> | undefined {
  const ratings: Array<{ source: string; value: string }> = [];
  if (typeof detail.vote_average === "number" && detail.vote_average > 0) {
    ratings.push({
      source: "TMDB",
      value: `${detail.vote_average.toFixed(1)}/10`,
    });
  }

  const certification = extractCertification(detail?.["release_dates"]);
  if (certification) {
    ratings.push({ source: "Certification", value: certification });
  }

  return ratings.length > 0 ? ratings : undefined;
}

function extractCertification(
  releaseDates: TmdbReleaseDatesResponse | undefined
): string | null {
  if (!releaseDates?.results) return null;
  const regionEntry =
    releaseDates.results.find(
      (entry: TmdbReleaseEntry) => entry.iso_3166_1 === TMDB_DEFAULT_REGION
    ) ?? releaseDates.results[0];
  if (!regionEntry || !Array.isArray(regionEntry.release_dates)) return null;
  const first = regionEntry.release_dates.find((release: TmdbReleaseWindow) =>
    Boolean(release.certification)
  );
  return first?.certification ?? null;
}

interface OmdbResponse {
  Title?: string;
  Year?: string;
  Runtime?: string;
  Poster?: string;
  Plot?: string;
  Ratings?: Array<{ Source: string; Value: string }>;
  Website?: string;
  Response?: "True" | "False";
  Error?: string;
  imdbID?: string;
}

interface OmdbSearchResponse {
  Search?: Array<{ Title: string; Year?: string; imdbID: string }>;
  Response?: "True" | "False";
  Error?: string;
}

async function fetchOmdbDetails(
  apiKey: string,
  title: string,
  year?: number | null
): Promise<OmdbResponse | null> {
  const params = new URLSearchParams({ apikey: apiKey, t: title });
  if (year) params.set("y", String(year));

  const direct = await fetch(`${OMDB_ENDPOINT}?${params.toString()}`);
  if (direct.ok) {
    const body = (await direct.json()) as OmdbResponse;
    if (body.Response !== "False") {
      return body;
    }
  }

  const searchParams = new URLSearchParams({ apikey: apiKey, s: title });
  if (year) searchParams.set("y", String(year));
  const searchResp = await fetch(`${OMDB_ENDPOINT}?${searchParams.toString()}`);
  if (!searchResp.ok) {
    return null;
  }

  const searchBody = (await searchResp.json()) as OmdbSearchResponse;
  if (searchBody.Response === "False" || !searchBody.Search?.length) {
    return null;
  }

  const firstResult = searchBody.Search[0];
  if (!firstResult?.imdbID) {
    return null;
  }

  const detailParams = new URLSearchParams({
    apikey: apiKey,
    i: firstResult.imdbID,
  });
  const detailResp = await fetch(`${OMDB_ENDPOINT}?${detailParams.toString()}`);
  if (!detailResp.ok) {
    return null;
  }

  const detailBody = (await detailResp.json()) as OmdbResponse;
  if (detailBody.Response === "False") {
    return null;
  }

  return detailBody;
}
