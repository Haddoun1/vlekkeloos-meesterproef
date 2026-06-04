import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "../../lib/supabaseServer";

export const POST: APIRoute = async (context) => {
const supabase = createSupabaseServerClient(context);

const {
    data: { user },
} = await supabase.auth.getUser();

if (!user) {
    return new Response(JSON.stringify({ message: "Niet ingelogd" }), {
    status: 401,
    });
}

const adminClient = createClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
    {
    auth: {
        persistSession: false,
    },
    }
);

const { data: currentProfile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

if (currentProfile?.role !== "admin") {
    return new Response(JSON.stringify({ message: "Geen admin rechten" }), {
    status: 403,
    });
}

const { email, action } = await context.request.json();

if (!email || !["add", "remove"].includes(action)) {
    return new Response(JSON.stringify({ message: "Ongeldige input" }), {
    status: 400,
    });
}

const newRole = action === "add" ? "admin" : "user";

const { data: targetProfile, error: findError } = await adminClient
    .from("profiles")
    .select("id, email, role")
    .eq("email", email)
    .single();

if (findError || !targetProfile) {
    return new Response(JSON.stringify({ message: "Gebruiker niet gevonden" }), {
    status: 404,
    });
}

const { error: updateError } = await adminClient
    .from("profiles")
    .update({ role: newRole })
    .eq("email", email);

if (updateError) {
    return new Response(JSON.stringify({ message: updateError.message }), {
    status: 500,
    });
}

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