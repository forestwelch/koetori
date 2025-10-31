import { MediaEnrichmentPayload } from "../pipeline/types";
import { EnrichmentJobResult, MediaItemDraft } from "./types";

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
}

const OMDB_ENDPOINT = "https://www.omdbapi.com/";

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
  };

  const apiKey = process.env.OMDB_API_KEY;

  if (!apiKey) {
    return {
      status: "completed",
      type: "media",
      draft,
      payload,
    };
  }

  try {
    const params = new URLSearchParams({
      apikey: apiKey,
      t: title,
    });

    if (payload.probableYear) {
      params.set("y", String(payload.probableYear));
    }

    const response = await fetch(`${OMDB_ENDPOINT}?${params.toString()}`);

    if (!response.ok) {
      return {
        status: "completed",
        type: "media",
        draft,
        payload,
      };
    }

    const body = (await response.json()) as OmdbResponse;

    if (body.Response === "False") {
      return {
        status: "completed",
        type: "media",
        draft,
        payload,
      };
    }

    draft.title = body.Title ?? draft.title;
    draft.releaseYear = body.Year
      ? Number.parseInt(body.Year, 10)
      : draft.releaseYear;
    draft.runtimeMinutes = parseRuntime(body.Runtime);
    draft.posterUrl = body.Poster && body.Poster !== "N/A" ? body.Poster : null;
    draft.overview =
      draft.overview ?? (body.Plot && body.Plot !== "N/A" ? body.Plot : null);
    draft.trailerUrl =
      body.Website && body.Website !== "N/A" ? body.Website : null;
    draft.ratings = Array.isArray(body.Ratings)
      ? body.Ratings.map((rating) => ({
          source: rating.Source,
          value: rating.Value,
        }))
      : undefined;

    return {
      status: "completed",
      type: "media",
      draft,
      payload,
    };
  } catch (error) {
    console.warn("[enrichment:media] fetch-failed", {
      title,
      error: error instanceof Error ? error.message : String(error),
    });

    return {
      status: "completed",
      type: "media",
      draft,
      payload,
    };
  }
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
  const match = /(?<minutes>\d+)\s*min/i.exec(runtime);
  if (match?.groups?.minutes) {
    const minutes = Number.parseInt(match.groups.minutes, 10);
    return Number.isNaN(minutes) ? null : minutes;
  }
  return null;
}
