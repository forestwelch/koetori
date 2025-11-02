import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ReorderPayload {
  memoIds: string[];
  status: string;
}

export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as ReorderPayload;

    if (!body.memoIds || !Array.isArray(body.memoIds) || !body.status) {
      return NextResponse.json(
        { error: "Invalid payload: memoIds array and status are required" },
        { status: 400 }
      );
    }

    // Update display_order for each memoId based on its position in the array
    // We need to update each item individually since Supabase doesn't support
    // batch updates with different WHERE conditions easily
    const updatePromises = body.memoIds.map((memoId, index) =>
      supabase
        .from("shopping_list_items")
        .update({
          display_order: index,
          updated_at: new Date().toISOString(),
        })
        .eq("memo_id", memoId)
        .eq("status", body.status)
    );

    const results = await Promise.all(updatePromises);
    const errors = results.filter((result) => result.error);

    if (errors.length > 0) {
      const error = errors[0].error;

      return NextResponse.json(
        {
          error: "Failed to reorder shopping items",
          details: error?.message || "Unknown error",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to reorder shopping items",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
