import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ReminderUpdatePayload {
  status?: string;
  dueAt?: string | null;
  dueDateText?: string | null;
  isRecurring?: boolean;
  recurrenceRule?: string | null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { memoId: string } }
) {
  const memoId = params.memoId;

  if (!memoId) {
    return NextResponse.json({ error: "Missing memoId" }, { status: 400 });
  }

  const body = (await request
    .json()
    .catch(() => ({}))) as ReminderUpdatePayload;

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (body.status) {
    updates.status = body.status;
  }

  if ("dueAt" in body) {
    updates.due_at = body.dueAt;
  }

  if ("dueDateText" in body) {
    updates.due_date_text = body.dueDateText;
  }

  if ("isRecurring" in body) {
    updates.is_recurring = body.isRecurring ?? false;
  }

  if ("recurrenceRule" in body) {
    updates.recurrence_rule = body.recurrenceRule;
  }

  if (Object.keys(updates).length === 1) {
    return NextResponse.json({ error: "No fields provided" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("reminders")
    .update(updates)
    .eq("memo_id", memoId)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Failed to update reminder", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ reminder: data });
}
