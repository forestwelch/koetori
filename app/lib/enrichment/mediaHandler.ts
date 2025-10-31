import { MediaEnrichmentPayload } from "../pipeline/types";
import { EnrichmentJobResult, MediaItemDraft } from "./types";
import {
  searchIgdbGames,
  igdbCoverUrl,
  fetchIgdbTimeToBeat,
} from "../services/igdb";

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
  const baseTitle =
    payload.overrideTitle ??
    payload.probableTitle ??
    deriveTitleFromHints(payload);

  if (!baseTitle) {
    return {
      status: "skipped",
      type: "media",
      reason: "Could not infer media title from memo extract.",
    };
  }

  const targetMediaType =
    payload.overrideMediaType ?? payload.probableMediaType ?? "unknown";

  const searchDebug: Record<string, unknown> = {
    probableTitle: payload.probableTitle,
    overrideTitle: payload.overrideTitle,
    probableYear: payload.probableYear,
    overrideYear: payload.overrideYear,
    probableMediaType: payload.probableMediaType,
    overrideMediaType: payload.overrideMediaType,
    rawTextHints: payload.rawTextHints,
  };

  const draft: MediaItemDraft = {
    title: baseTitle,
    releaseYear: payload.overrideYear ?? payload.probableYear ?? null,
    overview: payload.transcriptExcerpt ?? null,
    mediaType: targetMediaType,
    autoTitle: baseTitle,
    customTitle: payload.overrideTitle ?? null,
    autoReleaseYear: payload.overrideYear ?? payload.probableYear ?? null,
    customReleaseYear: payload.overrideYear ?? null,
    searchDebug: searchDebug,
    source: undefined,
    externalUrl: null,
    timeToBeatMinutes: null,
  };

  const results: Array<Partial<MediaItemDraft>> = [];
  const preferIgdb = targetMediaType === "game";
  let igdbResult: Partial<MediaItemDraft> | null = null;

  if (preferIgdb) {
    igdbResult = await fetchFromIgdb(baseTitle, payload);
    if (igdbResult) {
      results.push(igdbResult);
      searchDebug["igdb"] = igdbResult.searchDebug ?? null;
    }
  }

  if (!preferIgdb || !igdbResult) {
    const tmdb = await fetchFromTmdb(baseTitle, payload);
    if (tmdb) {
      results.push(tmdb);
      searchDebug["tmdb"] = tmdb.searchDebug ?? null;
    }
  }

  if (results.length === 0) {
    const omdb = await fetchFromOmdb(
      baseTitle,
      payload.overrideYear ?? payload.probableYear ?? null
    );
    if (omdb) {
      results.push(omdb);
      searchDebug["omdb"] = omdb.searchDebug ?? null;
    }
  }

  if (results.length === 0 && !igdbResult) {
    igdbResult = await fetchFromIgdb(baseTitle, payload);
    if (igdbResult) {
      results.push(igdbResult);
      searchDebug["igdb"] = igdbResult.searchDebug ?? null;
    }
  }

  for (const result of results) {
    if (!result) continue;
    if (result.title) {
      draft.autoTitle = result.title;
      draft.title = result.title;
    }
    if (result.autoTitle) {
      draft.autoTitle = result.autoTitle;
    }
    if (result.autoReleaseYear !== undefined) {
      draft.autoReleaseYear = result.autoReleaseYear ?? null;
    }
    draft.releaseYear =
      payload.overrideYear ?? result.releaseYear ?? draft.releaseYear;
    draft.runtimeMinutes =
      draft.runtimeMinutes ?? result.runtimeMinutes ?? null;
    draft.posterUrl = draft.posterUrl ?? result.posterUrl ?? null;
    draft.backdropUrl = draft.backdropUrl ?? result.backdropUrl ?? null;
    draft.overview = draft.overview ?? result.overview ?? null;
    draft.trailerUrl = draft.trailerUrl ?? result.trailerUrl ?? null;
    draft.platforms = draft.platforms ?? result.platforms ?? undefined;
    draft.providers = draft.providers ?? result.providers ?? undefined;
    draft.genres = draft.genres ?? result.genres ?? undefined;
    draft.tmdbId = draft.tmdbId ?? result.tmdbId ?? null;
    draft.imdbId = draft.imdbId ?? result.imdbId ?? null;
    draft.mediaType = result.mediaType ?? draft.mediaType;
    draft.ratings = draft.ratings ?? result.ratings ?? undefined;
    if (!draft.source && result.source) {
      draft.source = result.source;
    }
    if (!draft.externalUrl && result.externalUrl) {
      draft.externalUrl = result.externalUrl;
    }
    if (result.timeToBeatMinutes !== undefined) {
      draft.timeToBeatMinutes =
        result.timeToBeatMinutes ?? draft.timeToBeatMinutes;
    }
  }

  draft.autoTitle = draft.autoTitle ?? draft.title;
  draft.autoReleaseYear =
    draft.autoReleaseYear ??
    payload.overrideYear ??
    payload.probableYear ??
    null;
  draft.customTitle = payload.overrideTitle ?? draft.customTitle ?? null;
  draft.customReleaseYear =
    payload.overrideYear ?? draft.customReleaseYear ?? null;
  draft.title = draft.autoTitle ?? draft.title;
  draft.releaseYear = draft.autoReleaseYear ?? draft.releaseYear ?? null;
  draft.searchDebug = searchDebug;

  if (!draft.posterUrl && draft.tmdbId) {
    // ensure we have at least placeholders if TMDb provided id but no poster
    draft.posterUrl = null;
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
      searchDebug: {
        source: "omdb",
        title: detail.Title ?? title,
        year: detail.Year ?? year,
      },
      source: "omdb",
      externalUrl: detail.imdbID
        ? `https://www.imdb.com/title/${detail.imdbID}`
        : null,
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
  const externalUrl =
    target.media_type === "tv" || target.media_type === "movie"
      ? `https://www.themoviedb.org/${
          target.media_type === "tv" ? "tv" : "movie"
        }/${target.id}`
      : undefined;

  return {
    title: detail.title ?? detail.name ?? title,
    releaseYear,
    runtimeMinutes,
    posterUrl,
    backdropUrl,
    overview: detail.overview ?? payload.transcriptExcerpt ?? null,
    trailerUrl,
    providers,
    platforms: undefined,
    genres,
    ratings,
    tmdbId: detail.id ? String(detail.id) : undefined,
    imdbId: detail.external_ids?.imdb_id ?? null,
    mediaType:
      target.media_type === "movie" || target.media_type === "tv"
        ? target.media_type
        : (payload.probableMediaType ?? "unknown"),
    autoTitle: detail.title ?? detail.name ?? title,
    autoReleaseYear: releaseYear,
    searchDebug: {
      source: "tmdb",
      matchId: detail.id,
      popularity: target.popularity ?? null,
      title: detail.title ?? detail.name ?? title,
      releaseYear,
    },
    source: "tmdb",
    externalUrl: externalUrl ?? null,
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

async function fetchFromIgdb(
  title: string,
  payload: MediaEnrichmentPayload
): Promise<Partial<MediaItemDraft> | null> {
  const games = await searchIgdbGames(title, { limit: 6 });
  if (games.length === 0) {
    return null;
  }

  const preferredYear = payload.overrideYear ?? payload.probableYear ?? null;

  const ranked = games
    .map((game) => {
      const releaseYear = game.release_dates?.find((r) => r.y)?.y ?? null;
      let score = 0;
      if (preferredYear && releaseYear === preferredYear) {
        score += 40;
      }
      if (game.rating) {
        score += game.rating;
      }
      if (game.name?.toLowerCase() === title.toLowerCase()) {
        score += 60;
      }
      return { game, releaseYear, score };
    })
    .sort((a, b) => b.score - a.score);

  const target = ranked[0]?.game ?? games[0];
  if (!target) return null;

  const releaseYear =
    target.release_dates?.find((r) => r.y)?.y ?? preferredYear ?? null;

  const coverUrl = target.cover?.image_id
    ? igdbCoverUrl(target.cover.image_id)
    : null;

  const platforms = Array.isArray(target.platforms)
    ? target.platforms
        .map((platform) => platform?.name)
        .filter((name): name is string => Boolean(name))
    : undefined;

  const trailerId = Array.isArray(target.videos)
    ? target.videos.find((video) => typeof video?.video_id === "string")
        ?.video_id
    : null;

  const genres = Array.isArray(target.genres)
    ? target.genres
        .map((genre) => genre?.name)
        .filter((name): name is string => Boolean(name))
    : undefined;

  const youtubeUrl = trailerId
    ? `https://www.youtube.com/watch?v=${trailerId}`
    : undefined;

  let timeToBeatMinutes: number | null = null;
  const timeData = await fetchIgdbTimeToBeat(target.id);
  if (
    timeData &&
    typeof timeData.normally === "number" &&
    timeData.normally > 0
  ) {
    const minutes = Math.round(timeData.normally / 60);
    timeToBeatMinutes = minutes > 0 ? minutes : null;
  }

  const externalUrl = target.slug
    ? `https://www.igdb.com/games/${target.slug}`
    : null;

  return {
    title: target.name ?? title,
    releaseYear,
    posterUrl: coverUrl,
    overview: target.summary ?? payload.transcriptExcerpt ?? null,
    platforms,
    genres,
    mediaType: "game",
    ratings: target.rating
      ? [{ source: "IGDB", value: `${Math.round(target.rating)}/100` }]
      : undefined,
    trailerUrl: youtubeUrl,
    autoTitle: target.name ?? title,
    autoReleaseYear: releaseYear,
    searchDebug: {
      source: "igdb",
      id: target.id,
      slug: target.slug,
      platforms,
      releaseYear,
      timeToBeat: timeData ?? null,
    },
    source: "igdb",
    externalUrl,
    timeToBeatMinutes,
  } satisfies Partial<MediaItemDraft>;
}
