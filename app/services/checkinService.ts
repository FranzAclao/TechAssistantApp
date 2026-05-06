import { supabase } from "./supabaseService";

export type CheckinInsert = {
  user_id: string;
  category: string;
  concern: string;
  questions: unknown;
  answers: unknown;
  advice: string;
  health_score: number | null;
};

export async function saveCheckin(data: CheckinInsert): Promise<void> {
  console.log("=== SAVING CHECKIN ===");
  console.log("user_id:", data.user_id);
  console.log("category:", data.category);
  console.log("concern:", data.concern);

  const { data: result, error } = await supabase.from("checkins").insert(data).select();

  console.log("Supabase insert result:", JSON.stringify(result));
  console.log("Supabase insert error:", JSON.stringify(error));

  if (error) throw new Error(error.message);
  console.log("=== CHECKIN SAVED ===");
}

