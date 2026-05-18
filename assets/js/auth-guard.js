import { getAuthenticatedUser, hasSupabaseConfig } from './supabase-client.js';

const LOCAL_DEV_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

function hasLocalDemoSession() {
    return LOCAL_DEV_HOSTS.has(window.location.hostname)
        && sessionStorage.getItem('viLocalPortal') === 'true';
}

document.addEventListener('DOMContentLoaded', async () => {
    if (hasLocalDemoSession()) {
        return;
    }

    if (hasSupabaseConfig()) {
        const user = await getAuthenticatedUser();

        if (!user) {
            window.location.href = 'login.html';
        }

        return;
    }

    window.location.href = 'login.html?demo=1';
});
