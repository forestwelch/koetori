import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";
import { MediaStatus } from "@/app/types/enrichment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface StatusUpdatePayload {
  status: MediaStatus;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { memoId: string } }
) {
  try {
    const { memoId } = await params;

    if (!memoId) {
      return NextResponse.json({ error: "Missing memoId" }, { status: 400 });
    }

    const body = (await request
      .json()
      .catch(() => ({}))) as StatusUpdatePayload;

    if (
      !body.status ||
      !["to-watch", "watched", "backlog"].includes(body.status)
    ) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: to-watch, watched, backlog" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("media_items")
      .update({
        status: body.status,
        updated_at: new Date().toISOString(),
      })
      .eq("memo_id", memoId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        {
          error: "Failed to update media status",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ mediaItem: data });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to update media status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
