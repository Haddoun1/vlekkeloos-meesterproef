// Importeert de normale Supabase client.
// Hiermee kunnen we gegevens uit de database ophalen.
import { supabase } from "../../lib/supabase";

// Deze functie wordt uitgevoerd wanneer er een POST-request
// naar deze API-route wordt gestuurd.
export async function POST({ request }) {

  // Leest de JSON-data uit het verzoek.
  // Hier verwachten we onder andere een userId.
  const body = await request.json();

  // Controleert of er een userId is meegestuurd.
  // Zonder userId weten we niet van welke gebruiker
  // we de voortgang moeten ophalen.
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

  // Haalt alle opgeslagen cursusvoortgang op
  // van de opgegeven gebruiker.
  const { data, error } = await supabase
    .from("course_progress")
    .select("*")
    .eq("user_id", body.userId)

    // Sorteert op datum zodat de nieuwste activiteit bovenaan staat.
    .order("created_at", { ascending: false });

  // Stuurt de opgehaalde data terug naar de browser.
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

// Bron: https://chatgpt.com/c/6a195d63-9e38-83eb-a00b-9b631d2b3a69