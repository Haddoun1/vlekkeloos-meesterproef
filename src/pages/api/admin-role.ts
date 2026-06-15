// Importeert het type voor een Astro API-route.
// Hierdoor weet TypeScript dat dit bestand een API-endpoint bevat.
import type { APIRoute } from "astro";

// Importeert een gewone Supabase client.
// Deze gebruiken we later met de Service Role Key.
import { createClient } from "@supabase/supabase-js";

// Importeert de server-side Supabase client.
// Hiermee kunnen we controleren welke gebruiker momenteel is ingelogd.
import { createSupabaseServerClient } from "../../lib/supabaseServer";

// Deze functie wordt uitgevoerd wanneer een POST-request
// naar /api/admin-role wordt gestuurd.
export const POST: APIRoute = async (context) => {

    // Maakt een server-side Supabase client aan.
    const supabase = createSupabaseServerClient(context);

    // Haalt de momenteel ingelogde gebruiker op.
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Als niemand is ingelogd stoppen we direct.
    if (!user) {
        return new Response(JSON.stringify({ message: "Niet ingelogd" }), {
            status: 401,
        });
    }

    // Maakt een admin-client aan met de Service Role Key.
    // Deze heeft meer rechten dan een gewone gebruiker
    // en mag gegevens van andere gebruikers aanpassen.
    const adminClient = createClient(
        import.meta.env.PUBLIC_SUPABASE_URL,
        import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
        {
            auth: {
                // Voorkomt dat deze client sessies opslaat.
                persistSession: false,
            },
        }
    );

    // Controleert welke rol de huidige gebruiker heeft.
    const { data: currentProfile } = await adminClient
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    // Alleen admins mogen rollen aanpassen.
    if (currentProfile?.role !== "admin") {
        return new Response(JSON.stringify({ message: "Geen admin rechten" }), {
            status: 403,
        });
    }

    // Leest de verstuurde JSON uit het verzoek.
    const { email, action } = await context.request.json();

    // Controleert of een geldig e-mailadres en actie zijn meegestuurd.
    // Toegestane acties zijn "add" en "remove".
    if (!email || !["add", "remove"].includes(action)) {
        return new Response(JSON.stringify({ message: "Ongeldige input" }), {
            status: 400,
        });
    }

    // Bepaalt welke rol moet worden opgeslagen.
    // add = admin maken
    // remove = terugzetten naar gewone gebruiker
    const newRole = action === "add" ? "admin" : "user";

    // Zoekt het profiel van de gebruiker op basis van e-mailadres.
    const { data: targetProfile, error: findError } = await adminClient
        .from("profiles")
        .select("id, email, role")
        .eq("email", email)
        .single();

    // Als het profiel niet bestaat geven we een foutmelding terug.
    if (findError || !targetProfile) {
        return new Response(JSON.stringify({ message: "Gebruiker niet gevonden" }), {
            status: 404,
        });
    }

    // Past de rol van de gebruiker aan in de database.
    const { error: updateError } = await adminClient
        .from("profiles")
        .update({ role: newRole })
        .eq("email", email);

    // Als het updaten mislukt geven we de fout terug.
    if (updateError) {
        return new Response(JSON.stringify({ message: updateError.message }), {
            status: 500,
        });
    }

    // Geeft een succesmelding terug naar de browser.
    return new Response(
        JSON.stringify({
            message:
                action === "add"
                    ? `${email} is nu admin.`
                    : `${email} is geen admin meer.`,
        }),
        { status: 200 }
    );
};

// 