import { getSupabaseClient, hasSupabaseConfig } from './supabase-client.js';

const LOCAL_PORTAL_EMAIL = 'admin@vianainterprice.com';
const LOCAL_PORTAL_PASSWORD = 'Viana@2026!';
const LOCAL_DEV_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

function isLocalDevHost() {
    return LOCAL_DEV_HOSTS.has(window.location.hostname);
}

function showStatus(message, type = 'error') {
    const statusBox = document.querySelector('#loginStatus');

    if (!statusBox) {
        return;
    }

    statusBox.classList.remove('hidden', 'bg-red-50', 'text-red-700', 'bg-green-50', 'text-green-700');
    statusBox.classList.add(type === 'success' ? 'bg-green-50' : 'bg-red-50');
    statusBox.classList.add(type === 'success' ? 'text-green-700' : 'text-red-700');
    statusBox.textContent = message;
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#loginForm');
    const emailField = document.querySelector('input[name="email"]');
    const passField = document.querySelector('input[name="password"]');
    const submitButton = document.querySelector('#loginSubmit');

    if (!form || !emailField || !passField || !submitButton) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const shouldUseDemoLogin = params.get('demo') === '1' && isLocalDevHost();

    if (shouldUseDemoLogin) {
        emailField.value = LOCAL_PORTAL_EMAIL;
        passField.value = LOCAL_PORTAL_PASSWORD;
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        submitButton.disabled = true;
        submitButton.textContent = 'Entrando...';

        try {
            if (shouldUseDemoLogin || !hasSupabaseConfig()) {
                const isLocalLogin = emailField.value.trim().toLowerCase() === LOCAL_PORTAL_EMAIL
                    && passField.value === LOCAL_PORTAL_PASSWORD;

                if (!isLocalLogin) {
                    throw new Error('Login local invalido. Configure o Supabase para usar autenticacao real.');
                }

                sessionStorage.setItem('viLocalPortal', 'true');
            } else {
                const supabase = await getSupabaseClient();
                const { error } = await supabase.auth.signInWithPassword({
                    email: emailField.value.trim(),
                    password: passField.value
                });

                if (error) {
                    throw new Error(error.message || 'Login invalido.');
                }
            }

            showStatus('Login aprovado. Redirecionando...', 'success');
            window.location.href = 'home.html';
        } catch (error) {
            showStatus(error.message || 'Nao foi possivel entrar no portal.');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Entrar no Sistema';
        }
    });
});
