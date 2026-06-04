// Importeert de Supabase client.
// Hiermee kunnen we gegevens opslaan in de database.
import { supabase } from "../../lib/supabase";

// Deze functie wordt uitgevoerd wanneer een POST-request
// naar deze API-route wordt gestuurd.
export async function POST({ request }) {

  // Leeg object waarin later de ontvangen data wordt opgeslagen.
  let body = {};

  try {

    // Leest de inhoud van het verzoek als tekst.
    const text = await request.text();

    // Zet de ontvangen JSON om naar een JavaScript object.
    // Als er geen data is ontvangen, gebruiken we een leeg object.
    body = text ? JSON.parse(text) : {};

  } catch (error) {

    // Als de ontvangen JSON ongeldig is,
    // sturen we een foutmelding terug.
    return new Response(
      JSON.stringify({
        data: null,
        error: "Geen geldige JSON ontvangen"
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }

  // Controleert of de verplichte velden aanwezig zijn.
  // Zonder stepId en category kunnen we geen voortgang opslaan.
  if (!body.stepId || !body.category) {
    return new Response(
      JSON.stringify({
        data: null,
        error: "stepId of category ontbreekt"
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }

  // Slaat de cursusvoortgang op in de database.
  const { data, error } = await supabase
    .from("course_progress")

    .insert({

      // Unieke gebruiker die de stap heeft bezocht.
      // Als niemand is ingelogd gebruiken we "anonymous".
      user_id: body.userId || "anonymous",

      // E-mailadres van de gebruiker.
      email: body.email || null,

      // Naam van de gebruiker.
      name: body.name || null,

      // ID van de huidige stap.
      step_id: body.stepId,

      // Naam van de cursus of categorie.
      category: body.category,

      // Tijdstip waarop de gebruiker de stap begon.
      started_at:
        body.startedAt || new Date().toISOString(),

      // Tijdstip waarop de gebruiker de stap verliet.
      ended_at:
        body.endedAt || new Date().toISOString(),

      // Tijdsduur op deze stap in seconden.
      duration_seconds:
        body.durationSeconds || 0,
    })

    // Geeft het nieuw opgeslagen record direct terug.
    .select();

  // Stuurt het resultaat terug naar de browser.
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

// Deze functie wordt uitgevoerd wanneer iemand
// deze route via een GET-request bezoekt.
export async function GET() {

  // Geeft een melding terug dat deze API-route
  // alleen bedoeld is voor POST-requests.
  return new Response(
    JSON.stringify({
      message: "Deze API werkt alleen met POST requests."
    }),
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
}

// Bron: https://chatgpt.com/c/6a195d63-9e38-83eb-a00b-9b631d2b3a69