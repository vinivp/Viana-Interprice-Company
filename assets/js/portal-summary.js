import { getSupabaseClient, hasSupabaseConfig } from './supabase-client.js';

const PORTAL_API_BASE_URL = window.VIANA_API_BASE_URL || 'http://localhost:3003';

const statusLabels = {
    active: 'Ativo',
    needs_approval: 'Aguardando aprovacao',
    protected: 'Protegido',
    planned: 'Planejado',
    review: 'Em revisao'
};

function setText(id, value) {
    const element = document.querySelector(`#${id}`);
    if (element) {
        element.textContent = value;
    }
}

function renderModules(modules) {
    const list = document.querySelector('#moduleList');
    if (!list) {
        return;
    }

    list.innerHTML = modules.map((module) => `
        <article class="rounded border border-slate-200 bg-viLight p-4">
            <div class="flex items-start justify-between gap-4">
                <div>
                    <h3 class="font-black text-viBlue">${module.label}</h3>
                    <p class="mt-1 text-sm text-slate-500">${statusLabels[module.status] || module.status}</p>
                </div>
                <span class="rounded bg-white px-2 py-1 text-xs font-black text-viGold">${module.pending} pend.</span>
            </div>
        </article>
    `).join('');
}

async function loadSummaryFromSupabase() {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
        .from('portal_modules')
        .select('id,label,status,pending_count,sort_order')
        .order('sort_order', { ascending: true });

    if (error) {
        throw new Error(error.message);
    }

    const modules = data.map((module) => ({
        id: module.id,
        label: module.label,
        status: module.status,
        pending: module.pending_count
    }));

    return {
        indicators: {
            pendingApprovals: modules.reduce((total, module) => total + Number(module.pending || 0), 0),
            openTickets: 0,
            activeModules: modules.length,
            operationHealth: 92
        },
        modules
    };
}

async function loadSummaryFromLocalApi() {
    const response = await fetch(`${PORTAL_API_BASE_URL}/api/portal/summary`);
    const summary = await response.json();

    if (!response.ok) {
        throw new Error(summary.message || 'API indisponivel');
    }

    return summary;
}

async function loadSummary() {
    if (hasSupabaseConfig()) {
        try {
            return {
                source: 'Supabase Online',
                summary: await loadSummaryFromSupabase()
            };
        } catch (error) {
            console.warn('Supabase indisponivel para o portal, usando API local.', error);
        }
    }

    return {
        source: 'API local online',
        summary: await loadSummaryFromLocalApi()
    };
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const { source, summary } = await loadSummary();

        setText('apiStatus', source);
        document.querySelector('#apiStatus')?.classList.remove('text-amber-600');
        document.querySelector('#apiStatus')?.classList.add('text-emerald-600');
        setText('pendingApprovals', summary.indicators.pendingApprovals);
        setText('openTickets', summary.indicators.openTickets);
        setText('activeModules', summary.indicators.activeModules);
        setText('operationHealth', `${summary.indicators.operationHealth}%`);
        renderModules(summary.modules);
    } catch (error) {
        setText('apiStatus', 'Offline');
        setText('pendingApprovals', '3');
        setText('openTickets', '1');
        setText('activeModules', '5');
        setText('operationHealth', '92%');
        renderModules([
            { label: 'Marketing & Trade', pending: 2, status: 'needs_approval' },
            { label: 'RH & Escalas', pending: 0, status: 'active' },
            { label: 'Infraestrutura T.I.', pending: 0, status: 'protected' },
            { label: 'Financeiro & Performance', pending: 1, status: 'planned' },
            { label: 'Juridico & Compliance', pending: 1, status: 'review' }
        ]);
    }
});
