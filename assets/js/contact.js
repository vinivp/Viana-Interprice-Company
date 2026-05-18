import { getSupabaseClient, hasSupabaseConfig } from './supabase-client.js';

const API_BASE_URL = window.VIANA_API_BASE_URL || 'http://localhost:3003';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#contactForm');
    const submitButton = document.querySelector('#contactSubmit');
    const statusBox = document.querySelector('#contactStatus');

    if (!form || !submitButton || !statusBox) {
        return;
    }

    function showStatus(type, message) {
        statusBox.classList.remove('hidden', 'bg-green-50', 'text-green-700', 'bg-red-50', 'text-red-700');
        statusBox.classList.add(type === 'success' ? 'bg-green-50' : 'bg-red-50');
        statusBox.classList.add(type === 'success' ? 'text-green-700' : 'text-red-700');
        statusBox.textContent = message;
    }

    function normalizePayload(payload) {
        const message = payload.segment
            ? `[Segmento: ${payload.segment}] ${payload.message}`
            : payload.message;

        return {
            ...payload,
            message
        };
    }

    async function saveLead(payload) {
        const normalizedPayload = normalizePayload(payload);

        if (hasSupabaseConfig()) {
            const supabase = await getSupabaseClient();
            const { error } = await supabase.from('contact_leads').insert({
                name: normalizedPayload.name,
                company: normalizedPayload.company,
                email: normalizedPayload.email,
                phone: normalizedPayload.phone || null,
                bottleneck: normalizedPayload.bottleneck,
                message: normalizedPayload.message,
                source: 'site-diagnostico'
            });

            if (error) {
                throw new Error(error.message);
            }

            return {
                message: 'Diagnóstico recebido. A V.I. retornará com os próximos passos.'
            };
        }

        const response = await fetch(`${API_BASE_URL}/api/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(normalizedPayload)
        });
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Não foi possível enviar seu diagnóstico.');
        }

        return result;
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        submitButton.disabled = true;
        submitButton.textContent = 'Enviando diagnóstico...';

        const payload = Object.fromEntries(new FormData(form).entries());

        try {
            const result = await saveLead(payload);
            form.reset();
            showStatus('success', result.message || 'Diagnóstico recebido. A V.I. retornará com os próximos passos.');
        } catch (error) {
            showStatus('error', error.message || 'A API local ou o Supabase não respondeu.');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Solicitar diagnóstico';
        }
    });
});
