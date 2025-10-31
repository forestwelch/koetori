import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";
import { planEnrichmentTasks } from "@/app/lib/services/enrichmentPlanner";
import { createQueueDispatcher } from "@/app/lib/pipeline/createPipeline";
import { markMemosProcessed } from "@/app/lib/enrichment/persistence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RequeuePayload {
  memoId?: string;
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

  if (!memoId) {
    return NextResponse.json({ error: "memoId is required" }, { status: 400 });
  }

  const { data: memo, error } = await supabase
    .from("memos")
    .select(
      "id, category, extracted, tags, transcript_excerpt, transcription_id, username, source"
    )
    .eq("id", memoId)
    .single();

  if (error || !memo) {
    return NextResponse.json(
      { error: "Memo not found", details: error?.message },
      { status: 404 }
    );
  }

  if (!memo.transcription_id) {
    return NextResponse.json(
      { error: "Memo is missing transcription reference" },
      { status: 400 }
    );
  }

  await supabase.from("media_items").delete().eq("memo_id", memoId);
  await supabase.from("reminders").delete().eq("memo_id", memoId);
  await supabase.from("shopping_list_items").delete().eq("memo_id", memoId);

  await supabase
    .from("memos")
    .update({ enrichment_processed_at: null })
    .eq("id", memoId);

  const tasks = planEnrichmentTasks({
    memos: [
      {
        id: memo.id,
        category: memo.category,
        extracted: memo.extracted as Record<string, unknown> | null,
        tags: memo.tags as string[] | null,
        transcript_excerpt: memo.transcript_excerpt ?? null,
      },
    ],
    metadata: {
      username: memo.username,
      source: memo.source,
    },
    transcriptionId: memo.transcription_id,
  });

  if (tasks.length > 0) {
    const queue = createQueueDispatcher();
    await queue.enqueueMany(tasks);
  } else {
    await markMemosProcessed([memo.id]);
  }

  return NextResponse.json({ memoId, enqueued: tasks.length });
}
