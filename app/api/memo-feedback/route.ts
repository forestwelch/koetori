import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface MemoFeedbackPayload {
  memoId: string;
  username: string;
  editType: string;
  originalValue: string | null;
  newValue: string | null;
  feedbackText: string;
  transcript?: string;
  category?: string;
  confidence?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as MemoFeedbackPayload;

    // Validate required fields
    if (
      !body.memoId ||
      !body.username ||
      !body.editType ||
      !body.feedbackText
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Insert feedback
    const { data, error } = await supabase
      .from("memo_feedback")
      .insert([
        {
          memo_id: body.memoId,
          username: body.username,
          edit_type: body.editType,
          original_value: body.originalValue,
          new_value: body.newValue,
          feedback_text: body.feedbackText,
          transcript: body.transcript,
          category: body.category,
          confidence: body.confidence,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error saving feedback:", error);
      return NextResponse.json(
        { error: "Failed to save feedback", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, feedback: data });
  } catch (error) {
    console.error("Error in memo-feedback API:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
