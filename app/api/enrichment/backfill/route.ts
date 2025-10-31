import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";
import { planEnrichmentTasks } from "@/app/lib/services/enrichmentPlanner";
import { createQueueDispatcher } from "@/app/lib/pipeline/createPipeline";
import { markMemosProcessed } from "@/app/lib/enrichment/persistence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface BackfillRequestBody {
  limit?: number;
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

  if (process.env.ENRICHMENT_MODE !== "immediate") {
    return NextResponse.json(
      {
        error:
          "Backfill requires ENRICHMENT_MODE=immediate so results can persist synchronously.",
      },
      { status: 400 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as BackfillRequestBody;
  const limit = Math.min(Math.max(body.limit ?? 20, 1), 50);

  const { data: memos, error } = await supabase
    .from("memos")
    .select(
      "id, category, extracted, tags, transcription_id, username, source, transcript_excerpt, deleted_at"
    )
    .is("enrichment_processed_at", null)
    .is("deleted_at", null)
    .limit(limit);

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch memos", details: error.message },
      { status: 500 }
    );
  }

  if (!memos || memos.length === 0) {
    return NextResponse.json({ processed: 0, enqueued: 0, skipped: 0 });
  }

  const queue = createQueueDispatcher();
  const tasks = [];
  const memoIdsWithoutTasks: string[] = [];

  for (const memo of memos) {
    const memoTasks = planEnrichmentTasks({
      memos: [
        {
          id: memo.id,
          category: memo.category,
          extracted: (memo.extracted as Record<string, unknown>) ?? null,
          tags: (memo.tags as string[] | null) ?? null,
          transcript_excerpt: memo.transcript_excerpt ?? null,
          deleted_at: memo.deleted_at ?? null,
        },
      ],
      metadata: {
        username: memo.username,
        source: memo.source,
      },
      transcriptionId: memo.transcription_id,
    });

    if (memoTasks.length === 0) {
      memoIdsWithoutTasks.push(memo.id);
    }

    tasks.push(...memoTasks);
  }

  if (tasks.length > 0) {
    await queue.enqueueMany(tasks);
  }

  if (memoIdsWithoutTasks.length > 0) {
    await markMemosProcessed(memoIdsWithoutTasks);
  }

  return NextResponse.json({
    processed: memos.length,
    enqueued: tasks.length,
    skipped: memoIdsWithoutTasks.length,
  });
}
