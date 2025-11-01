import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ memoId: string }> }
) {
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

  const { memoId } = await params;
  if (!memoId) {
    return NextResponse.json({ error: "memoId is required" }, { status: 400 });
  }

  const { error: deleteError } = await supabase
    .from("media_items")
    .delete()
    .eq("memo_id", memoId);

  if (deleteError) {
    return NextResponse.json(
      { error: "Failed to delete media item", details: deleteError.message },
      { status: 500 }
    );
  }

  await supabase
    .from("memos")
    .update({ enrichment_processed_at: new Date().toISOString() })
    .eq("id", memoId);

  return NextResponse.json({ success: true });
}
