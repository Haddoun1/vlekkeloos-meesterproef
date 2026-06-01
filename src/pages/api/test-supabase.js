import { supabase } from "../../lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("course_progress")
    .insert({
      user_id: "test-user",
      email: "test@example.com",
      name: "Test Gebruiker",
      step_id: "intro_01",
      category: "Intro",
      started_at: new Date().toISOString(),
      ended_at: new Date().toISOString(),
      duration_seconds: 10,
      completed: true
    })
    .select();

  return new Response(JSON.stringify({ data, error }), {
    headers: {
      "Content-Type": "application/json"
    }
  });
}