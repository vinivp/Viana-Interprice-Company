const config = window.VIANA_SUPABASE || {};
let supabaseClientPromise = null;

export function hasSupabaseConfig() {
    return Boolean(config.url && config.anonKey);
}

export async function getSupabaseClient() {
    if (!hasSupabaseConfig()) {
        return null;
    }

    if (!supabaseClientPromise) {
        supabaseClientPromise = import('https://esm.sh/@supabase/supabase-js@2.102.0')
            .then(({ createClient }) => createClient(config.url, config.anonKey, {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true
                }
            }));
    }

    return supabaseClientPromise;
}

export async function getAuthenticatedUser() {
    const supabase = await getSupabaseClient();

    if (!supabase) {
        return null;
    }

    const { data, error } = await supabase.auth.getUser();

    if (error) {
        return null;
    }

    return data.user || null;
}
