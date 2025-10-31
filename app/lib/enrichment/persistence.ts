import { supabase } from "../supabase";
import { EnrichmentJobResult } from "./types";

export async function persistEnrichmentResult(
  result: Extract<EnrichmentJobResult, { status: "completed" }>
) {
  switch (result.type) {
    case "media":
      await upsertMediaItem(result);
      break;
    case "reminder":
      await upsertReminder(result);
      break;
    case "shopping":
      await upsertShoppingItem(result);
      break;
  }

  await markMemoProcessed(result.payload.memoId);
}

export async function markMemoProcessed(memoId: string) {
  const { error } = await supabase
    .from("memos")
    .update({ enrichment_processed_at: new Date().toISOString() })
    .eq("id", memoId);

  if (error) {
    console.error("[enrichment] failed to mark memo processed", {
      memoId,
      error: error.message,
    });
  }
}

export async function markMemosProcessed(memoIds: string[]) {
  if (memoIds.length === 0) return;
  const { error } = await supabase
    .from("memos")
    .update({ enrichment_processed_at: new Date().toISOString() })
    .in("id", memoIds);

  if (error) {
    console.error("[enrichment] failed bulk memo processed update", {
      memoIds,
      error: error.message,
    });
  }
}

async function upsertMediaItem(
  result: Extract<EnrichmentJobResult, { type: "media" }>
) {
  const draft = result.draft;
  const payload = result.payload;
  const mediaData = {
    memo_id: payload.memoId,
    title: draft.autoTitle ?? draft.title,
    auto_title: draft.autoTitle ?? draft.title,
    custom_title: draft.customTitle ?? payload.overrideTitle ?? null,
    release_year: draft.releaseYear ?? null,
    auto_release_year: draft.autoReleaseYear ?? draft.releaseYear ?? null,
    custom_release_year:
      draft.customReleaseYear ?? payload.overrideYear ?? null,
    runtime_minutes: draft.runtimeMinutes ?? null,
    poster_url: draft.posterUrl ?? null,
    backdrop_url: draft.backdropUrl ?? null,
    overview: draft.overview ?? null,
    trailer_url: draft.trailerUrl ?? null,
    platforms: draft.platforms ?? null,
    providers: draft.providers ?? null,
    genres: draft.genres ?? null,
    tmdb_id: draft.tmdbId ?? null,
    imdb_id: draft.imdbId ?? null,
    media_type: draft.mediaType ?? null,
    ratings: draft.ratings ?? null,
    search_debug: draft.searchDebug ?? null,
    source: draft.source ?? null,
    external_url: draft.externalUrl ?? null,
    time_to_beat_minutes: draft.timeToBeatMinutes ?? null,
    updated_at: new Date().toISOString(),
  };

  // Debug logging for overview persistence
  console.debug("[persistence] saving media item overview", {
    memoId: payload.memoId,
    title: mediaData.title,
    overviewLength: mediaData.overview?.length ?? 0,
    overviewPreview: mediaData.overview?.slice(0, 100) ?? null,
    hasOverview: !!mediaData.overview,
  });

  const { error } = await supabase.from("media_items").upsert(mediaData, {
    onConflict: "memo_id",
  });

  if (error) {
    console.error("[enrichment] failed to upsert media item", {
      memoId: payload.memoId,
      error: error.message,
    });
  } else {
    console.debug("[persistence] media item saved successfully", {
      memoId: payload.memoId,
      title: mediaData.title,
      overviewLength: mediaData.overview?.length ?? 0,
    });
  }
}

async function upsertReminder(
  result: Extract<EnrichmentJobResult, { type: "reminder" }>
) {
  const draft = result.draft;
  const payload = result.payload;
  const { error } = await supabase.from("reminders").upsert(
    {
      memo_id: payload.memoId,
      title: draft.title,
      due_date_text: draft.dueDateText ?? null,
      recurrence_text: draft.recurrenceText ?? null,
      priority_score: draft.priorityScore ?? null,
      is_recurring: draft.recurrenceHint ?? false,
      recurrence_rule: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "memo_id" }
  );

  if (error) {
    console.error("[enrichment] failed to upsert reminder", {
      memoId: payload.memoId,
      error: error.message,
    });
  }
}

async function upsertShoppingItem(
  result: Extract<EnrichmentJobResult, { type: "shopping" }>
) {
  const draft = result.draft;
  const payload = result.payload;
  const { error } = await supabase.from("shopping_list_items").upsert(
    {
      memo_id: payload.memoId,
      item_name: draft.itemName,
      quantity: draft.quantity ?? null,
      category: draft.category ?? null,
      urgency_score: draft.urgencyScore ?? null,
      items: draft.items ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "memo_id" }
  );

  if (error) {
    console.error("[enrichment] failed to upsert shopping item", {
      memoId: payload.memoId,
      error: error.message,
    });
  }
}
