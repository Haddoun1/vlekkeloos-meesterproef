import { supabase } from "../../lib/supabase";

export async function POST({ request }) {
  let body = {};

  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({
        data: null,
        error: "Ongeldige JSON"
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }

  if (!body.userId) {
    return new Response(
      JSON.stringify({
        data: null,
        error: "userId ontbreekt"
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }

  const { data, error } = await supabase
    .from("course_progress")
    .select("*")
    .eq("user_id", body.userId)
    .order("ended_at", { ascending: false });

  return new Response(
    JSON.stringify({
      data,
      error
    }),
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
}