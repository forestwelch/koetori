import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";
import { getClientIdentifier } from "@/app/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function logRequest(
  level: "info" | "error" | "warn",
  message: string,
  data?: Record<string, unknown>
) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...data,
  };

  if (level === "error") {
    console.error(JSON.stringify(logEntry));
  } else if (level === "warn") {
    console.warn(JSON.stringify(logEntry));
  } else {
    console.log(JSON.stringify(logEntry));
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ memoId: string }> }
) {
  const clientId = getClientIdentifier(request);
  const { memoId } = await params;

  try {
    const body = await request.json();
    const { status, completedAt } = body;

    if (!status || typeof status !== "string") {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    if (!["open", "purchased", "archived"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be: open, purchased, or archived" },
        { status: 400 }
      );
    }

    const updateData: {
      status: string;
      completed_at?: string | null;
      updated_at: string;
    } = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === "purchased" && completedAt) {
      updateData.completed_at = completedAt;
    } else if (status !== "purchased") {
      updateData.completed_at = null;
    }

    const { error, data } = await supabase
      .from("shopping_list_items")
      .update(updateData)
      .eq("memo_id", memoId)
      .select()
      .single();

    if (error) {
      logRequest("error", "Failed to update shopping list item", {
        clientId,
        memoId,
        error: error.message,
      });

      return NextResponse.json(
        { error: `Failed to update item: ${error.message}` },
        { status: 500 }
      );
    }

    logRequest("info", "Shopping list item updated", {
      clientId,
      memoId,
      status,
    });

    return NextResponse.json({
      success: true,
      item: {
        memoId: data.memo_id,
        status: data.status,
        completedAt: data.completed_at,
      },
    });
  } catch (error) {
    logRequest("error", "Shopping list update failed", {
      clientId,
      memoId,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update shopping list item",
      },
      { status: 500 }
    );
  }
}
