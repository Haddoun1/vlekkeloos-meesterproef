import { supabase } from "../../lib/supabase";

export async function POST({ request }) {
  let body = {};

  try {
    const text = await request.text();
    body = text ? JSON.parse(text) : {};
  } catch (error) {
    return new Response(
      JSON.stringify({
        data: null,
        error: "Geen geldige JSON ontvangen"
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  if (!body.stepId || !body.category) {
    return new Response(
      JSON.stringify({
        data: null,
        error: "stepId of category ontbreekt"
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  const { data, error } = await supabase
    .from("course_progress")
    .insert({
      user_id: body.userId || "anonymous",
      email: body.email || null,
      name: body.name || null,
      step_id: body.stepId,
      category: body.category,
      started_at: body.startedAt || new Date().toISOString(),
      ended_at: body.endedAt || new Date().toISOString(),
      duration_seconds: body.durationSeconds || 0,
    })
    .select();

  return new Response(JSON.stringify({ data, error }), {
    headers: { "Content-Type": "application/json" }
  });
}

export async function GET() {
  return new Response(
    JSON.stringify({
      message: "Deze API werkt alleen met POST requests."
    }),
    {
      headers: { "Content-Type": "application/json" }
    }
  );
}