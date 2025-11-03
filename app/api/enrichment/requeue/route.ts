import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";
import { planEnrichmentTasks } from "@/app/lib/services/enrichmentPlanner";
import { createQueueDispatcher } from "@/app/lib/pipeline/createPipeline";
import { markMemosProcessed } from "@/app/lib/enrichment/persistence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RequeuePayload {
  memoId?: string;
  overrideTitle?: string | null;
  overrideYear?: number | null;
  overrideMediaType?: "movie" | "tv" | "music" | "game" | "unknown";
}

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function POST(request: NextRequest) {
  if (!process.env.ENRICHMENT_BACKFILL_TOKEN) {
    return NextResponse.json(
      { error: "Backfill token not configured" },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return unauthorized();
  }

  const token = authHeader.slice("Bearer ".length);
  if (token !== process.env.ENRICHMENT_BACKFILL_TOKEN) {
    return unauthorized();
  }

  const body = (await request.json().catch(() => ({}))) as RequeuePayload;
  const memoId = body.memoId;
  const overrideTitle =
    typeof body.overrideTitle === "string" ? body.overrideTitle.trim() : null;
  const overrideYear =
    typeof body.overrideYear === "number"
      ? body.overrideYear
      : typeof body.overrideYear === "string"
        ? Number.parseInt(body.overrideYear, 10)
        : null;
  const overrideMediaType = body.overrideMediaType ?? null;

  if (!memoId) {
    return NextResponse.json({ error: "memoId is required" }, { status: 400 });
  }

  const { data: memo, error } = await supabase
    .from("memos")
    .select(
      "id, category, extracted, tags, transcript_excerpt, transcription_id, username, source, deleted_at"
    )
    .eq("id", memoId)
    .single();

  if (error || !memo) {
    return NextResponse.json(
      { error: "Memo not found", details: error?.message },
      { status: 404 }
    );
  }

  // Delete all existing enrichment items for this memo
  await Promise.all([
    supabase.from("media_items").delete().eq("memo_id", memoId),
    supabase.from("reminders").delete().eq("memo_id", memoId),
    supabase.from("shopping_list_items").delete().eq("memo_id", memoId),
    supabase.from("todo_items").delete().eq("memo_id", memoId),
    supabase.from("journal_items").delete().eq("memo_id", memoId),
    supabase.from("tarot_items").delete().eq("memo_id", memoId),
    supabase.from("idea_items").delete().eq("memo_id", memoId),
  ]);

  await supabase
    .from("memos")
    .update({ enrichment_processed_at: null })
    .eq("id", memoId);

  const transcriptionId = memo.transcription_id ?? memo.id;

  const tasks = planEnrichmentTasks({
    memos: [
      {
        id: memo.id,
        category: memo.category,
        extracted: memo.extracted as Record<string, unknown> | null,
        tags: memo.tags as string[] | null,
        transcript_excerpt: memo.transcript_excerpt ?? null,
        deleted_at: (memo.deleted_at as string | null) ?? null,
      },
    ],
    metadata: {
      username: memo.username,
      source: memo.source,
    },
    transcriptionId,
  });

  const queue = createQueueDispatcher();

  const mediaTasks = tasks.filter((task) => task.type === "media");
  if (
    mediaTasks.length > 0 &&
    (overrideTitle || overrideYear || overrideMediaType)
  ) {
    for (const task of mediaTasks) {
      if (overrideTitle) {
        task.payload.overrideTitle = overrideTitle;
        task.payload.probableTitle = overrideTitle;
      }
      if (overrideYear !== null && !Number.isNaN(overrideYear)) {
        task.payload.overrideYear = overrideYear;
        task.payload.probableYear = overrideYear;
      }
      if (overrideMediaType) {
        task.payload.probableMediaType = overrideMediaType;
        task.payload.overrideMediaType = overrideMediaType;
      }
    }
  }

  if (mediaTasks.length === 0 && overrideTitle) {
    tasks.push({
      type: "media",
      payload: {
        transcriptionId,
        username: memo.username,
        memoId: memo.id,
        memoCategory: memo.category,
        tags: (memo.tags as string[] | null) ?? null,
        extracted: (memo.extracted as Record<string, unknown> | null) ?? null,
        transcriptExcerpt: memo.transcript_excerpt ?? null,
        probableTitle: overrideTitle,
        probableYear: overrideYear ?? null,
        probableMediaType: overrideMediaType ?? "unknown",
        overrideTitle,
        overrideYear: overrideYear ?? null,
        overrideMediaType: overrideMediaType ?? "unknown",
      },
    });
  }

  if (tasks.length > 0) {
    await queue.enqueueMany(tasks);
  } else {
    await markMemosProcessed([memo.id]);
  }

  return NextResponse.json({ memoId, enqueued: tasks.length });
}
